# Blocks - Puck CMS Components

## Overview

This directory contains all 35 Puck-compatible components organized by category. These are the building blocks used to construct pages in the Christiano Property Management CMS.

## Index Exports

The `index.ts` file exports all blocks with a unified configuration:

```typescript
import { 
  BLOCK_REGISTRY,
  BLOCK_CATEGORIES,
  HeroSection,
  AboutSection,
  // ... all 35 blocks
} from '@/blocks';
```

## Block Categories

### Content Blocks

| Block | Description |
|-------|-------------|
| HeroSection | Full-width hero with background, title, CTA |
| AboutSection | Company information section |
| WhyChooseUs | USP/features grid |
| ServicesSection | Services listing |
| PropertyShowcase | Featured properties display |
| FaqSection | FAQ accordion |
| ContactSection | Contact form and info |
| ImageWithText | Side-by-side image and text |
| TextBlock | Rich text content block |
| ComparisonSection | Feature comparison table |
| FeatureGrid | Grid of features |

### Social Proof Blocks

| Block | Description |
|-------|-------------|
| TestimonialSection | Customer testimonials carousel |
| StatsSection | Statistics/numbers display |
| LogoBar | Partner/client logos |
| SocialProofStrip | Social proof badges |
| TeamSection | Team member profiles |

### Media Blocks

| Block | Description |
|-------|-------------|
| ImageGallery | Image gallery/lightbox |
| VideoSection | Video embed section |
| MapSection | Google/OpenStreetMap embed |
| MaltaMapSection | Malta-specific map section |
| Timeline | Timeline/roadmap display |

### Conversion Blocks

| Block | Description |
|-------|-------------|
| CtaBanner | Call-to-action banner |
| BookingSection | Booking form section |
| NewsletterSection | Email signup form |
| PricingTable | Pricing comparison |

### Layout Blocks

| Block | Description |
|-------|-------------|
| Divider | Visual separator |
| Spacer | Vertical spacing |
| FooterSection | Site footer |
| ThemeSettings | Theme configuration |

### Guesty Integration Blocks

| Block | Description |
|-------|-------------|
| GuestyPropertySearch | Property search widget |
| GuestyPropertyGrid | Property listings grid |
| GuestyPropertyDetail | Single property details |
| GuestyBookingWidget | Booking form widget |
| GuestyBookingConfirmation | Booking success page |
| GuestyBookingDashboard | User booking dashboard |

## Usage

### Basic Block Usage

```typescript
import { HeroSection, AboutSection } from '@/blocks';

// In your puck.config.tsx
export default {
  categories: BLOCK_CATEGORIES,
  components: {
    HeroSection,
    AboutSection,
    // ... add more blocks
  },
};
```

### Custom Block Creation

```typescript
import type { ComponentConfig } from '@/lib/types';

export const MyCustomBlock: ComponentConfig<Props, Fields> = {
  label: 'My Custom Block',
  fields: {
    title: { type: 'text' },
    content: { type: 'textarea' },
    image: { type: 'text' },
  },
  defaultProps: {
    title: 'Default Title',
    content: 'Default content',
    image: '',
  },
  render: ({ title, content, image }) => (
    <div className="custom-block">
      {image && <img src={image} alt={title} />}
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  ),
};
```

## AI Integration

Each block includes AI instructions for the Puck AI block generator:

```typescript
HeroSection.ai.instructions 
// "Create impactful headlines under 80 characters..."
```

### Example AI Prompt

```typescript
const aiPrompt = `Create a hero section for a luxury property management company.
- Headline: benefit-focused, under 80 chars
- Subtitle: 2-3 sentences max, 300 chars
- CTA: 2-4 action words
- Use premium imagery from CDN`;
```

## Common Props

Most blocks share these props:

| Prop | Type | Description |
|------|------|-------------|
| id | string | Unique block identifier |
| className | string | Additional CSS classes |

### Text Props

| Prop | Type | Description |
|------|------|-------------|
| title | string | Main heading |
| subtitle | string | Secondary text |
| description | string | Full description text |

### Media Props

| Prop | Type | Description |
|------|------|-------------|
| backgroundImage | string | URL to background image |
| image | string | URL to image |
| videoUrl | string | URL to video |

### CTA Props

| Prop | Type | Description |
|------|------|-------------|
| ctaText | string | Button label |
| ctaLink | string | Button URL |
| ctaSecondaryText | string | Secondary button label |
| ctaSecondaryLink | string | Secondary button URL |

## Animation Integration

Blocks use effects from `@/components/effects`:

```typescript
import { BlurFade, BlurFadeText, SparklesText } from '@/components/effects';

export const HeroSection = {
  render: (props) => (
    <section>
      <BlurFade delay={0.1}>
        <MorphingText texts={["Text 1", "Text 2"]} />
      </BlurFade>
      <h1>
        <BlurFadeText text={props.title} byWord />
      </h1>
      <SparklesText>{props.subtitle}</SparklesText>
    </section>
  ),
};
```

## Guesty Integration

Guesty blocks connect to the Guesty PMS API:

```typescript
import { 
  GuestyPropertySearch,
  GuestyPropertyGrid,
  GuestyPropertyDetail 
} from '@/blocks';

// GuestyPropertySearch - Search widget
<GuestyPropertySearch 
  apiKey="your-api-key"
  locale="en-US"
/>

// GuestyPropertyGrid - Listings
<GuestyPropertyGrid 
  properties={properties}
  columns={3}
/>

// GuestyPropertyDetail - Single property
<GuestyPropertyDetail 
  propertyId="prop-123"
  showCalendar
  showReviews
/>
```

## Best Practices

1. **Default Props**: Always provide sensible defaults
2. **Field Labels**: Use descriptive field labels
3. **AI Instructions**: Write clear AI generation instructions
4. **Accessibility**: Include ARIA labels where needed
5. **Responsive**: Design for mobile-first with responsive classes

## Example Block Configuration

```typescript
export const PricingTable = {
  label: 'Pricing Table',
  fields: {
    title: { type: 'text', label: 'Section Title' },
    subtitle: { type: 'textarea', label: 'Section Subtitle' },
    plans: { 
      type: 'array',
      arrayFields: {
        name: { type: 'text' },
        price: { type: 'text' },
        features: { type: 'textarea' },
        ctaText: { type: 'text' },
      },
    },
  },
  defaultProps: {
    title: 'Choose Your Plan',
    subtitle: 'Flexible pricing for every need',
    plans: [],
  },
  render: ({ title, subtitle, plans }) => (
    <section>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="pricing-grid">
        {plans.map(plan => (
          <div key={plan.name} className="plan-card">
            <h3>{plan.name}</h3>
            <span className="price">{plan.price}</span>
            <ul>{plan.features}</ul>
            <button>{plan.ctaText}</button>
          </div>
        ))}
      </div>
    </section>
  ),
  ai: {
    instructions: 'Create pricing tables with 2-4 plans. Include plan names, prices, and key features.',
  },
};
```
