// Secret Management System with Environment Variable Validation
// Implements OWASP A02: Cryptographic Failures and A05: Security Misconfiguration remediation

/**
 * Secret validation and management
 */

interface SecretConfig {
  name: string;
  required: boolean;
  validation?: (value: string) => boolean;
  mask: boolean;
  description: string;
}

class SecretManager {
  private secrets: Map<string, string> = new Map();
  private validationErrors: string[] = [];
  private initialized = false;

  private readonly SECRET_CONFIGS: Record<string, SecretConfig> = {
    // Supabase
    SUPABASE_URL: {
      name: 'Supabase URL',
      required: true,
      validation: (val) => val.startsWith('https://') && val.endsWith('.supabase.co'),
      mask: false,
      description: 'Supabase project URL',
    },
    VITE_SUPABASE_URL: {
      name: 'Supabase URL (Public)',
      required: true,
      validation: (val) => val.startsWith('https://') && val.endsWith('.supabase.co'),
      mask: false,
      description: 'Supabase project URL (client-side)',
    },
    VITE_SUPABASE_PUBLISHABLE_KEY: {
      name: 'Supabase Publishable Key',
      required: true,
      validation: (val) => val.length > 20 && (val.startsWith('sb_publishable_') || val.startsWith('eyJ')),
      mask: true,
      description: 'Supabase client-side API key',
    },
    VITE_SUPABASE_ANON_KEY: {
      name: 'Supabase Anonymous Key',
      required: true,
      validation: (val) => val.length > 50 && val.startsWith('eyJ'),
      mask: true,
      description: 'Supabase anonymous key',
    },

    // Guesty (optional)
    GUESTY_CLIENT_ID: {
      name: 'Guesty Client ID',
      required: false,
      validation: (val) => val.length > 10,
      mask: true,
      description: 'Guesty OAuth client ID',
    },
    GUESTY_CLIENT_SECRET: {
      name: 'Guesty Client Secret',
      required: false,
      validation: (val) => val.length > 10,
      mask: true,
      description: 'Guesty OAuth client secret',
    },

    // Stripe (optional)
    VITE_STRIPE_PUBLISHABLE_KEY: {
      name: 'Stripe Publishable Key',
      required: false,
      validation: (val) => val.startsWith('pk_'),
      mask: true,
      description: 'Stripe client-side key',
    },

    // Google Maps (optional)
    VITE_GOOGLE_MAPS_API_KEY: {
      name: 'Google Maps API Key',
      required: false,
      validation: (val) => val.length > 20,
      mask: true,
      description: 'Google Maps API key',
    },

    // OpenAI (server-side only, should not be in client env)
    OPENAI_API_KEY: {
      name: 'OpenAI API Key',
      required: false,
      validation: (val) => val.startsWith('sk-'),
      mask: true,
      description: 'OpenAI API key (server-side only)',
    },

    // Server-side secrets (should never be in client code)
    SUPABASE_SERVICE_ROLE_KEY: {
      name: 'Supabase Service Role Key',
      required: false,
      validation: (val) => val.length > 50 && val.startsWith('eyJ'),
      mask: true,
      description: '⚠️ SERVER-SIDE ONLY - Never expose to client',
    },
    SUPABASE_JWT_SECRET: {
      name: 'Supabase JWT Secret',
      required: false,
      validation: (val) => val.length > 20,
      mask: true,
      description: '⚠️ SERVER-SIDE ONLY - Never expose to client',
    },
  };

  /**
   * Initialize secret manager with environment variables
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    // Check client-side vs server-side
    const isClient = typeof window !== 'undefined';

    // Validate all configured secrets
    for (const [envKey, config] of Object.entries(this.SECRET_CONFIGS)) {
      const value = this.getEnvValue(envKey);

      // Check if required secret is missing
      if (config.required && !value) {
        this.validationErrors.push(
          `Missing required secret: ${config.name} (${envKey})`
        );
        continue;
      }

      // Skip validation if value is missing and not required
      if (!value) {
        continue;
      }

      // Warn about server-side secrets in client code
      if (isClient && envKey.includes('SERVICE_ROLE') || envKey.includes('JWT_SECRET')) {
        console.error(
          `🚨 SECURITY WARNING: Server-side secret ${envKey} detected in client code! `
          + 'This should never happen. Remove it from client environment variables.'
        );
        this.validationErrors.push(
          `Server-side secret in client code: ${envKey}`
        );
        continue;
      }

      // Validate secret format
      if (config.validation && !config.validation(value)) {
        this.validationErrors.push(
          `Invalid format for ${config.name} (${envKey})`
        );
        continue;
      }

      // Store secret
      this.secrets.set(envKey, value);
    }

    this.initialized = true;

    // Log warnings if there are validation errors
    if (this.validationErrors.length > 0) {
      console.error('🔒 Secret validation errors:', this.validationErrors);
    }
  }

  /**
   * Get environment variable value
   */
  private getEnvValue(key: string): string | undefined {
    // Try import.meta.env first (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }

    // Fallback to process.env
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }

    return undefined;
  }

  /**
   * Get secret value
   */
  get(key: string): string | undefined {
    if (!this.initialized) {
      this.initialize();
    }

    const value = this.secrets.get(key);
    const config = this.SECRET_CONFIGS[key];

    // Log access to sensitive secrets in development
    if (config?.mask && import.meta?.env?.DEV) {
      console.debug(`🔐 Accessing secret: ${config.name}`);
    }

    return value;
  }

  /**
   * Get secret with masking for logs
   */
  getSafe(key: string): string {
    const value = this.get(key);
    const config = this.SECRET_CONFIGS[key];

    if (!value) {
      return '[MISSING]';
    }

    if (config?.mask) {
      return this.maskValue(value);
    }

    return value;
  }

  /**
   * Mask secret value for display
   */
  private maskValue(value: string): string {
    if (value.length <= 8) {
      return '****';
    }
    return `${value.substring(0, 4)  }****${  value.substring(value.length - 4)}`;
  }

  /**
   * Check if all required secrets are present
   */
  hasRequiredSecrets(): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    for (const [envKey, config] of Object.entries(this.SECRET_CONFIGS)) {
      if (config.required && !this.secrets.has(envKey)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): string[] {
    if (!this.initialized) {
      this.initialize();
    }

    return [...this.validationErrors];
  }

  /**
   * Validate secret at runtime
   */
  validateSecret(key: string): boolean {
    const value = this.get(key);
    const config = this.SECRET_CONFIGS[key];

    if (!value) {
      return !config?.required;
    }

    if (config?.validation) {
      return config.validation(value);
    }

    return true;
  }

  /**
   * Get all secret names for diagnostic purposes (never returns values)
   */
  getSecretNames(): string[] {
    return Object.keys(this.SECRET_CONFIGS);
  }

  /**
   * Get configuration for a secret
   */
  getConfig(key: string): SecretConfig | undefined {
    return this.SECRET_CONFIGS[key];
  }

  /**
   * Diagnostic report
   */
  getDiagnosticReport(): {
    initialized: boolean;
    totalSecrets: number;
    configuredSecrets: number;
    missingRequired: number;
    validationErrors: string[];
    secretsStatus: Array<{
      name: string;
      key: string;
      present: boolean;
      required: boolean;
      valid: boolean;
    }>;
  } {
    if (!this.initialized) {
      this.initialize();
    }

    const secretsStatus = Object.entries(this.SECRET_CONFIGS).map(([key, config]) => ({
      name: config.name,
      key,
      present: this.secrets.has(key),
      required: config.required,
      valid: this.validateSecret(key),
    }));

    const missingRequired = secretsStatus.filter(
      s => s.required && !s.present
    ).length;

    return {
      initialized: this.initialized,
      totalSecrets: Object.keys(this.SECRET_CONFIGS).length,
      configuredSecrets: this.secrets.size,
      missingRequired,
      validationErrors: [...this.validationErrors],
      secretsStatus,
    };
  }

  /**
   * Log diagnostic report in development
   */
  logDiagnosticReport(): void {
    if (!import.meta?.env?.DEV) {
      return;
    }

    const report = this.getDiagnosticReport();

    console.group('🔒 Secret Manager Diagnostic Report');
    console.log('Initialized:', report.initialized);
    console.log('Configured Secrets:', `${report.configuredSecrets}/${report.totalSecrets}`);
    console.log('Missing Required:', report.missingRequired);

    if (report.validationErrors.length > 0) {
      console.error('Validation Errors:', report.validationErrors);
    }

    console.log('Secret Status:');
    report.secretsStatus.forEach(status => {
      const icon = status.present ? (status.valid ? '✅' : '⚠️') : (status.required ? '❌' : '⏭️');
      console.log(`  ${icon} ${status.name}: ${status.present ? 'Present' : 'Missing'}`);
    });

    console.groupEnd();
  }

  /**
   * Security check: Detect if any server-side secrets are exposed to client
   */
  checkSecretExposure(): {
    exposed: boolean;
    exposedSecrets: string[];
  } {
    const isClient = typeof window !== 'undefined';
    const exposedSecrets: string[] = [];

    if (!isClient) {
      return { exposed: false, exposedSecrets };
    }

    const dangerousKeys = ['SERVICE_ROLE_KEY', 'JWT_SECRET', 'SECRET_KEY'];
    dangerousKeys.forEach(dangerousKey => {
      Object.keys(this.SECRET_CONFIGS).forEach(key => {
        if (key.includes(dangerousKey) && this.secrets.has(key)) {
          exposedSecrets.push(key);
        }
      });
    });

    return {
      exposed: exposedSecrets.length > 0,
      exposedSecrets,
    };
  }

  /**
   * Clear all secrets from memory (for security)
   */
  clear(): void {
    this.secrets.clear();
    this.initialized = false;
  }
}

// Singleton instance
const secretManager = new SecretManager();

// Initialize immediately in development for diagnostic purposes
if (import.meta?.env?.DEV) {
  secretManager.initialize();
  secretManager.logDiagnosticReport();

  // Check for secret exposure
  const exposureCheck = secretManager.checkSecretExposure();
  if (exposureCheck.exposed) {
    console.error(
      '🚨 SECURITY ALERT: Server-side secrets exposed to client!',
      exposureCheck.exposedSecrets
    );
  }
}

export default secretManager;
export { SecretManager, type SecretConfig };
