/**
 * Developer Experience - Component Development Kit, Testing, and Documentation
 * Million-Times-Better Architecture
 */

import { Result } from '@/lib/types-index';

// ============================================================================
// TYPES - COMPONENT REGISTRY
// ============================================================================

export interface ComponentDefinition {
  name: string;
  component: string;
  props: PropDefinition[];
  defaultProps?: Record<string, unknown>;
  category: string;
  description: string;
  icon?: string;
  version: string;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
  description?: string;
  validation?: string; // Zod schema string
}

export interface BlockDocumentation {
  name: string;
  description: string;
  category: string;
  props: PropDefinition[];
  examples: CodeExample[];
  usage: string;
}

export interface CodeExample {
  title: string;
  code: string;
  language: 'tsx' | 'jsx' | 'json';
}

// ============================================================================
// TYPES - TESTING
// ============================================================================

export interface TestConfig {
  framework: 'vitest' | 'jest' | 'playwright';
  coverage: boolean;
  testMatch: string[];
  setupFiles?: string[];
}

export interface E2EConfig {
  browser: 'chromium' | 'firefox' | 'webkit';
  baseUrl: string;
  viewport: { width: number; height: number };
  timeout: number;
}

export interface VisualRegressionConfig {
  service: 'chromatic' | 'percy' | 'applitools';
  projectId: string;
  branch: string;
  viewportSizes: { width: number; height: number }[];
}

// ============================================================================
// TYPES - DOCUMENTATION
// ============================================================================

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  summary: string;
  description?: string;
  parameters: APIParameter[];
  requestBody?: APISchema;
  responses: APIResponse[];
  tags?: string[];
  security?: string[];
}

export interface APIParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  type: string;
  description?: string;
}

export interface APISchema {
  type: string;
  properties: Record<string, { type: string; description?: string }>;
}

export interface APIResponse {
  status: number;
  description: string;
  schema?: APISchema;
}

export interface MigrationStep {
  version: string;
  description: string;
  up: string;
  down?: string;
}

// ============================================================================
// MAIN DEV EXPERIENCE CLASS
// ============================================================================

export class DeveloperExperience {
  private baseUrl: string;
  private componentRegistry: Map<string, ComponentDefinition> = new Map();
  private docCache: Map<string, BlockDocumentation> = new Map();

  constructor(options?: { baseUrl?: string }) {
    this.baseUrl = options?.baseUrl || '/api/dev';
  }

  // ========================================================================
  // COMPONENT REGISTRY
  // ========================================================================

  /**
   * Register component
   */
  registerComponent(def: ComponentDefinition): void {
    this.componentRegistry.set(def.name, def);
  }

  /**
   * Get component definition
   */
  getComponent(name: string): ComponentDefinition | undefined {
    return this.componentRegistry.get(name);
  }

  /**
   * Get all components
   */
  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.componentRegistry.values());
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): ComponentDefinition[] {
    return this.getAllComponents().filter(c => c.category === category);
  }

  /**
   * Generate TypeScript types
   */
  generateTypes(): string {
    const types = this.getAllComponents()
      .map(comp => {
        const propTypes = comp.props
          .map(prop => {
            const optional = prop.required ? '' : '?';
            const defaultVal = prop.default ? ` = ${JSON.stringify(prop.default)}` : '';
            return `  ${prop.name}${optional}: ${prop.type}${defaultVal};`;
          })
          .join('\n');

        return `interface ${comp.name}Props {\n${propTypes}\n}`;
      })
      .join('\n\n');

    return `// Auto-generated types\n${types}`;
  }

  /**
   * Generate props config
   */
  generatePropsConfig(): string {
    const configs = this.getAllComponents().map(comp => {
      const props = comp.props.map(p => ({
        type: p.type,
        ...(p.default && { default: p.default }),
      }));

      return `${comp.name}: ${JSON.stringify({ props }, null, 2)}`;
    }).join(',\n  ');

    return `export const BlockProps = {\n  ${configs}\n};`;
  }

  // ========================================================================
  // DOCUMENTATION
  // ========================================================================

  /**
   * Generate Block documentation
   */
  generateBlockDocs(): BlockDocumentation[] {
    return this.getAllComponents().map(comp => {
      const existing = this.docCache.get(comp.name);
      if (existing) return existing;

      const docs: BlockDocumentation = {
        name: comp.name,
        description: comp.description,
        category: comp.category,
        props: comp.props,
        examples: this.generateExamples(comp),
        usage: this.generateUsage(comp),
      };

      this.docCache.set(comp.name, docs);
      return docs;
    });
  }

  private generateExamples(comp: ComponentDefinition): CodeExample[] {
    const props = comp.props
      .map(p => `  ${p.name}={${p.default ? JSON.stringify(p.default) : '...'}}`)
      .join('\n');

    return [
      {
        title: 'Basic Usage',
        language: 'tsx',
        code: `<${comp.name}>\n${props}\n</${comp.name}>`,
      },
    ];
  }

  private generateUsage(comp: ComponentDefinition): string {
    return `# ${comp.name}\n\n${comp.description}\n\n## Props\n\n${comp.props
      .map(p => `- \`${p.name}\` (${p.type}${p.required ? ', required' : ''}): ${p.description || ''}`)
      .join('\n')}`;
  }

  /**
   * Generate API docs (OpenAPI format)
   */
  generateAPIDocs(): { openapi: string; info: Record<string, unknown>; paths: Record<string, unknown> } {
    const paths: Record<string, unknown> = {};

    // Would collect from API routes
    paths['/api/pages'] = {
      get: {
        summary: 'List pages',
        parameters: [
          { name: 'page', in: 'query', type: 'number' },
          { name: 'limit', in: 'query', type: 'number' },
        ],
        responses: { 200: { description: 'Successful response' } },
      },
      post: {
        summary: 'Create page',
        requestBody: { content: { 'application/json': { schema: {} } } },
        responses: { 201: { description: 'Created' } },
      },
    };

    return {
      openapi: '3.0.0',
      info: {
        title: 'CMS API',
        version: '1.0.0',
        description: 'Content Management System API',
      },
      paths,
    };
  }

  // ========================================================================
  // HOT MODULE REPLACEMENT
  // ========================================================================

  /**
   * Setup hot reload
   */
  setupHotReload(): void {
    if (typeof window === 'undefined') return;

    // Register service worker for HMR
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.error('SW registration failed:', error);
        });
    }

    // Listen for HMR updates
    if ((module as unknown as { hot?: { accept: (callback: () => void) => void } }).hot) {
      (module as unknown as { hot?: { accept: (callback: () => void) => void } }).hot?.accept(() => {
        console.log('[HMR] Updated');
        window.location.reload();
      });
    }
  }

  // ========================================================================
  // TESTING UTILITIES
  // ========================================================================

  /**
   * Create test configuration
   */
  getTestConfig(): TestConfig {
    return {
      framework: 'vitest',
      coverage: true,
      testMatch: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      setupFiles: ['./tests/setup.ts'],
    };
  }

  /**
   * Create E2E configuration
   */
  getE2EConfig(): E2EConfig {
    return {
      browser: 'chromium',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      viewport: { width: 1280, height: 720 },
      timeout: 30000,
    };
  }

  /**
   * Get visual regression config
   */
  getVisualRegressionConfig(): VisualRegressionConfig {
    return {
      service: 'chromatic',
      projectId: process.env.CHROMATIC_PROJECT_ID || '',
      branch: process.env.VERCEL_GIT_BRANCH || 'main',
      viewportSizes: [
        { width: 320 },  // Mobile
        { width: 768 }, // Tablet
        { width: 1280 }, // Desktop
      ],
    };
  }

  /**
   * Generate test boilerplate
   */
  generateTest(componentName: string): string {
    return `import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  beforeEach(() => {
    render(<${componentName} />);
  });

  it('renders without error', () => {
    expect(screen.getByTestId('${componentName.toLowerCase()}')).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = render(<${componentName} />);
    expect(container).toMatchSnapshot();
  });
});`;
  }

  // ========================================================================
  // MIGRATION GUIDES
  // ========================================================================

  /**
   * Generate migration guide
   */
  generateMigration(steps: MigrationStep[]): string {
    const content = steps
      .map(step => `## ${step.version}\n\n${step.description}\n\n\`\`\`sql\n-- UP\n${step.up}\n\`\`\`\n${step.down ? `\`\`\`sql\n-- DOWN\n${step.down}\n\`\`\`` : ''}`)
      .join('\n\n');

    return `# Migration Guide\n\n${content}`;
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return process.env.npm_package_version || '1.0.0';
  }

  /**
   * Check if update available
   */
  async checkForUpdates(): Promise<Result<{ current: string; latest: string; updateAvailable: boolean }, Error>> {
    try {
      const response = await fetch('https://registry.npmjs.org/cms/latest');
      const data = await response.json();
      
      const current = this.getCurrentVersion();
      const updateAvailable = data.version !== current;
      
      return Result.ok({
        current,
        latest: data.version,
        updateAvailable,
      });
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to check updates'));
    }
  }

  // ========================================================================
  // STORYBOOK INTEGRATION
  // ========================================================================

  /**
   * Generate Storybook stories
   */
  generateStorybookStory(componentName: string): string {
    return `import type { Meta, StoryObj } from '@storybook/react';
import ${componentName} from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
  argTypes: {
    // Add argTypes here
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default args here
  },
};

export const Variant: Story = {
  args: {
    // Add variant args here
  },
};`;
  }

  /**
   * Generate Storybook config
   */
  generateStorybookConfig(): string {
    return `import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: [
        color: /(background|color)$/i,
        date: /Date$/i,
      ],
    },
  },
  globalTypes: {
    // Add global types here
  },
};

export default preview;`;
  }

  // ========================================================================
  // LINTING & CODE QUALITY
  // ========================================================================

  /**
   * Get ESLint config
   */
  getESLintConfig(): Record<string, unknown> {
    return {
      root: true,
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        'react/prop-types': 'off',
        'react-hooks/exhaustive-deps': 'warn',
      },
    };
  }

  /**
   * Get Prettier config
   */
  getPrettierConfig(): Record<string, unknown> {
    return {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 80,
      bracketSpacing: true,
      arrowParens: 'always',
    };
  }

  // ========================================================================
  // DEBUGGING TOOLS
  // ========================================================================

  /**
   * Enable debug mode
   */
  enableDebug(): void {
    if (typeof window !== 'undefined') {
      (window as unknown as { __DEBUG__: boolean }).__DEBUG__ = true;
      console.log('[DEBUG] Debug mode enabled');
    }
  }

  /**
   * Disable debug mode
   */
  disableDebug(): void {
    if (typeof window !== 'undefined') {
      (window as unknown as { __DEBUG__: boolean }).__DEBUG__ = false;
    }
  }

  /**
   * Check if debug enabled
   */
  isDebugEnabled(): boolean {
    if (typeof window !== 'undefined') {
      return (window as unknown as { __DEBUG__?: boolean }).__DEBUG__ || false;
    }
    return false;
  }

  /**
   * Debug log
   */
  debugLog(...args: unknown[]): void {
    if (this.isDebugEnabled()) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Performance marker
   */
  performanceMark(label: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(label);
    }
  }

  /**
   * Performance measure
   */
  performanceMeasure(label: string, startMark: string, endMark?: string): number {
    if (typeof performance === 'undefined') return 0;
    
    performance.measure(label, startMark, endMark);
    const entries = performance.getEntriesByName(label);
    
    return entries[0]?.duration || 0;
  }

  // ========================================================================
  // ERROR BOUNDARY
  // ========================================================================

  /**
   * Create error boundary component
   */
  createErrorBoundary(): string {
    return `import { Component, ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: unknown) => void;
}

export function ErrorBoundary({ children, fallback, onError }: Props) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <p>Something went wrong:</p>
          <pre>{error.message}</pre>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
      onError={onError}
    >
      {children}
    </ReactErrorBoundary>
  );
}`;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let devExpInstance: DeveloperExperience | null = null;

export function getDevExperience(): DeveloperExperience {
  if (!devExpInstance) {
    devExpInstance = new DeveloperExperience();
  }
  return devExpInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DeveloperExperience;