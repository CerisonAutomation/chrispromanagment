# Effects Components - 21st.dev Inspired Magic UI

## Overview

Collection of premium animation and visual effect components inspired by 21st.dev and Magic UI. Adapted for luxury dark theme with CPM brand tokens.

## Components

### BlurFade

Smooth blur + fade entrance animation.

```typescript
import { BlurFade } from '@/components/effects';

<BlurFade delay={0.2} duration={0.4} blur="8px">
  <YourContent />
</BlurFade>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Content to animate |
| delay | number | 0 | Animation delay in seconds |
| duration | number | 0.4 | Animation duration in seconds |
| blur | string | "8px" | Blur intensity |
| yOffset | number | 6 | Vertical offset in pixels |
| inView | boolean | true | Trigger on scroll into view |
| className | string | - | Additional CSS classes |

### BlurFadeText

Per-word stagger animation for text.

```typescript
import { BlurFadeText } from '@/components/effects';

<BlurFadeText 
  text="Your animated text"
  byWord
  characterDelay={0.06}
  delay={0.3}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | required | Text to animate |
| byWord | boolean | false | Animate by word vs character |
| characterDelay | number | 0.04 | Delay between characters |
| delay | number | 0 | Initial delay |
| direction | BlurFadeDirection | 'down' | Animation direction |

### MorphingText

Rotating text with smooth transitions.

```typescript
import { MorphingText } from '@/components/effects';

<MorphingText
  texts={["First text", "Second text", "Third text"]}
  interval={3000}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| texts | string[] | required | Array of texts to cycle |
| interval | number | 3000 | Time between transitions (ms) |
| className | string | - | Additional CSS classes |

### AnimatedShinyText

Text with shimmer effect.

```typescript
import { AnimatedShinyText } from '@/components/effects';

<AnimatedShinyText className="text-xl font-bold">
  Premium Content
</AnimatedShinyText>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Text content |
| className | string | - | Additional CSS classes |

### SparklesText

Text with sparkle particle effects.

```typescript
import { SparklesText } from '@/components/effects';

<SparklesText className="text-2xl">
  Celebrating Success
</SparklesText>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Text content |
| className | string | - | Additional CSS classes |

### HyperText

Interactive text with hover animations.

```typescript
import { HyperText } from '@/components/effects';

<HyperText className="text-3xl font-bold">
  Hover Me
</HyperText>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Text content |
| className | string | - | Additional CSS classes |
| duration | number | - | Animation duration |

### ShimmerButton

Button with loading shimmer effect.

```typescript
import { ShimmerButton } from '@/components/effects';

<ShimmerButton
  shimmerDuration={2.5}
  borderRadius="0.5rem"
  className="px-6 py-3"
>
  Click Me
</ShimmerButton>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Button content |
| shimmerDuration | number | 2 | Shimmer cycle duration (s) |
| borderRadius | string | "0.375rem" | Border radius |
| className | string | - | Additional CSS classes |

### RetroGrid

Animated grid background.

```typescript
import { RetroGrid } from '@/components/effects';

<RetroGrid 
  cellSize={50} 
  opacity={0.04}
  className="absolute inset-0"
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| cellSize | number | 40 | Grid cell size in pixels |
| opacity | number | 0.05 | Grid opacity |
| className | string | - | Additional CSS classes |

### AnimatedTooltip

Hover tooltip with animations.

```typescript
import { AnimatedTooltip } from '@/components/effects';

<AnimatedTooltip content="Help text">
  <button>Hover me</button>
</AnimatedTooltip>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | required | Trigger element |
| content | string | required | Tooltip text |
| side | 'top' \\| 'bottom' \\| 'left' \\| 'right' | 'top' | Tooltip position |

### DotPattern & GridPattern

Pattern backgrounds.

```typescript
import { DotPattern, GridPattern } from '@/components/effects';

<DotPattern 
  color="var(--cpm-accent)"
  opacity={0.5}
/>

<GridPattern />
```

### Particles

Interactive particle canvas.

```typescript
import { Particles } from '@/components/effects';

<Particles
  quantity={30}
  staticity={50}
  ease={50}
  color="var(--cpm-accent)"
  size={2}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| quantity | number | 30 | Number of particles |
| staticity | number | 50 | Particle stillness (0-100) |
| ease | number | 50 | Mouse interaction strength |
| color | string | "var(--cpm-accent)" | Particle color |
| size | number | 2 | Particle size |
| className | string | - | Additional CSS classes |

### NumberTicker

Animated number counter.

```typescript
import { NumberTicker } from '@/components/effects';

<NumberTicker 
  value={1000}
  duration={2}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | required | Target number |
| duration | number | 2 | Animation duration (s) |
| className | string | - | Additional CSS classes |

### Marquee

Infinite scrolling text.

```typescript
import { Marquee } from '@/components/effects';

<Marquee 
  items={["Item 1", "Item 2", "Item 3"]}
  speed={50}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | string[] | required | Items to scroll |
| speed | number | 50 | Scroll speed |
| className | string | - | Additional CSS classes |

## Usage Examples

### Hero Section Animation

```typescript
export function Hero() {
  return (
    <section className="relative min-h-screen">
      <RetroGrid className="z-0" />
      <Particles className="z-0" quantity={25} />
      
      <div className="relative z-10">
        <BlurFade delay={0.1} duration={0.5}>
          <MorphingText
            texts={["Superhost", "Expert", "Professional"]}
            interval={3000}
          />
        </BlurFade>
        
        <h1>
          <BlurFadeText 
            text="Welcome to Malta" 
            byWord 
            characterDelay={0.06}
          />
        </h1>
        
        <SparklesText className="text-xl">
          Luxury Awaits
        </SparklesText>
        
        <ShimmerButton>
          Book Now
        </ShimmerButton>
      </div>
    </section>
  );
}
```

### Feature Cards with Stagger

```typescript
function FeatureGrid() {
  const features = [
    { title: "Premium Locations", desc: "..." },
    { title: "24/7 Support", desc: "..." },
    { title: "Best Prices", desc: "..." },
  ];
  
  return (
    <div className="grid grid-cols-3 gap-8">
      {features.map((f, i) => (
        <BlurFade key={f.title} delay={i * 0.1}>
          <div className="rounded-xl p-6 bg-card">
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}
```

## Customization

### Theme Tokens

All effects use CPM CSS variables:

```css
:root {
  --cpm-accent: #d4a574;
  --cpm-bg-primary: #0a0a0a;
  --cpm-text-primary: #fafafa;
  --cpm-text-secondary: #a1a1aa;
}
```

### Creating Custom Variants

```typescript
const customVariant = {
  hidden: { filter: "blur(12px)", opacity: 0, y: 20 },
  visible: { filter: "blur(0px)", opacity: 1, y: 0 },
};

<BlurFade variant={customVariant}>
  Custom Animation
</BlurFade>
```
