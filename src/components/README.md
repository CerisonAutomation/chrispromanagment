# Components Directory

## Overview

The `src/components/` directory contains all React components for the Christiano Property Management platform.

## Structure

```
components/
├── effects/           # Animation and visual effects (21st.dev inspired)
│   ├── index.ts
│   ├── blur-fade.tsx
│   ├── blur-fade-text.tsx
│   ├── morphing-text.tsx
│   ├── animated-shiny-text.tsx
│   ├── sparkles-text.tsx
│   ├── hyper-text.tsx
│   ├── shimmer-button.tsx
│   ├── retro-grid.tsx
│   ├── animated-tooltip.tsx
│   ├── patterns.tsx
│   ├── particles.tsx
│   ├── number-ticker.tsx
│   └── README.md
├── admin/              # Admin panel components
│   ├── puck-editor.tsx
│   └── unified-admin.tsx
├── cms/                # CMS-specific components
│   └── media-library.tsx
├── fields/             # Puck field components
│   ├── index.ts
│   ├── array-field.tsx
│   ├── auto-field.tsx
│   ├── custom-field-renderer.tsx
│   ├── default-field.tsx
│   ├── field-group.tsx
│   ├── field-label.tsx
│   ├── fields-panel.tsx
│   ├── radio-field.tsx
│   ├── richtext-field.tsx
│   ├── select-field.tsx
│   ├── textarea-field.tsx
│   └── object-field.tsx
├── puck/               # Puck editor components
│   ├── ai-block-editor.tsx
│   ├── ai-page-builder.tsx
│   ├── auto-frame.tsx
│   ├── block-builder.tsx
│   ├── canvas.tsx
│   ├── components-panel.tsx
│   └── drag-drop-context.tsx
└── ui/                 # Generic UI components
    └── ...
```

## Subdirectories

### Effects

Premium animation components inspired by 21st.dev and Magic UI.

**See:** [effects/README.md](./effects/README.md)

### Admin

Components for the admin panel:

```typescript
import { PuckEditor } from '@/components/admin';
import { UnifiedAdmin } from '@/components/admin';

// Full Puck editor with AI
<PuckEditor config={config} data={data} onChange={setData} />

// Unified admin panel
<UnifiedAdmin activeTab="pages" />
```

### Fields

Puck field rendering components for custom form inputs:

```typescript
import { 
  FieldRenderer,
  FieldLabel,
  ArrayField,
  RichTextField,
} from '@/components/fields';

// Custom field rendering
<FieldRenderer 
  field={fieldDef}
  value={value}
  onChange={setValue}
/>

// Array field for repeatable items
<ArrayField
  field={arrayFieldDef}
  value={items}
  onChange={setItems}
/>
```

### Puck

Components for the Puck editor interface:

```typescript
import { 
  Canvas,
  ComponentsPanel,
  DragDropContext,
  AutoFrame,
} from '@/components/puck';

// Canvas for rendering
<Canvas data={data} config={config} />

// Component picker panel
<ComponentsPanel 
  categories={categories}
  components={components}
/>
```

## Component Patterns

### Client Components

All interactive components use the 'use client' directive:

```typescript
'use client';

import { useState } from 'react';

export function MyComponent() {
  const [state, setState] = useState();
  return <div>...</div>;
}
```

### Using Effects

```typescript
import { 
  BlurFade, 
  SparklesText, 
  ShimmerButton 
} from '@/components/effects';

export function HeroSection() {
  return (
    <section>
      <BlurFade delay={0.1}>
        <SparklesText>Premium Content</SparklesText>
      </BlurFade>
      <ShimmerButton>Get Started</ShimmerButton>
    </section>
  );
}
```

## Type Exports

All component types are exported from their respective index files:

```typescript
// From effects
export type { BlurFadeProps } from './blur-fade';
export type { MorphingTextProps } from './morphing-text';
export type { ParticlesProps } from './particles';

// From fields
export type { FieldProps } from './default-field';
export type { ArrayFieldProps } from './array-field';
```
