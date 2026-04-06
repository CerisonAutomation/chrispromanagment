

export const ThemeSettings = {
  label: "Theme Settings",
  fields: {
    accentColor: {
      type: "text" as const,
      label: "Accent Color",
    },
    backgroundShade: {
      type: "select" as const,
      label: "Background Shade",
      options: [
        { label: "Darkest", value: "darkest" },
        { label: "Dark", value: "dark" },
        { label: "Medium", value: "medium" },
      ],
    },
    fontBody: {
      type: "select" as const,
      label: "Body Font",
      options: [
        { label: "Outfit", value: "Outfit" },
        { label: "Inter", value: "Inter" },
        { label: "Lato", value: "Lato" },
        { label: "DM Sans", value: "DM Sans" },
        { label: "Poppins", value: "Poppins" },
      ],
    },
    fontHeading: {
      type: "select" as const,
      label: "Heading Font",
      options: [
        { label: "Cormorant Garamond", value: "Cormorant Garamond" },
        { label: "Playfair Display", value: "Playfair Display" },
        { label: "Libre Baskerville", value: "Libre Baskerville" },
        { label: "Fraunces", value: "Fraunces" },
        { label: "DM Serif Display", value: "DM Serif Display" },
      ],
    },
    borderRadius: {
      type: "select" as const,
      label: "Border Radius",
      options: [
        { label: "Sharp", value: "sharp" },
        { label: "Subtle", value: "subtle" },
        { label: "Rounded", value: "rounded" },
        { label: "Pill", value: "pill" },
      ],
    },
    animationSpeed: {
      type: "select" as const,
      label: "Animation Speed",
      options: [
        { label: "Instant", value: "instant" },
        { label: "Fast", value: "fast" },
        { label: "Normal", value: "normal" },
        { label: "Slow", value: "slow" },
        { label: "Disabled", value: "disabled" },
      ],
    },
  },
  defaultProps: {
    accentColor: "",
    backgroundShade: "darkest",
    fontBody: "Outfit",
    fontHeading: "Cormorant Garamond",
    borderRadius: "rounded",
    animationSpeed: "normal",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      accentColor: string;
      backgroundShade: string;
      fontBody: string;
      fontHeading: string;
      borderRadius: string;
      animationSpeed: string;
    };

    // Build CSS overrides based on editor configuration
    const bgMap: Record<string, { primary: string; secondary: string; tertiary: string; border: string; borderHover: string }> = {
      darkest: {
        primary: "#0e0f11",
        secondary: "#15171b",
        tertiary: "#1a1c21",
        border: "#1b1e23",
        borderHover: "#2a2d33",
      },
      dark: {
        primary: "#12141a",
        secondary: "#1a1c24",
        tertiary: "#22252e",
        border: "#2a2d38",
        borderHover: "#3a3d48",
      },
      medium: {
        primary: "#1a1c24",
        secondary: "#22252e",
        tertiary: "#2a2d38",
        border: "#353842",
        borderHover: "#454855",
      },
    };

    const radiusMap: Record<string, string> = {
      sharp: "4px",
      subtle: "8px",
      rounded: "12px",
      pill: "9999px",
    };

    const bg = bgMap[p.backgroundShade] || bgMap.darkest;
    const accent = p.accentColor || "#c8a96a";
    const fontBody = p.fontBody || "Outfit";
    const fontHeading = p.fontHeading || "Cormorant Garamond";
    const radius = radiusMap[p.borderRadius] || radiusMap.rounded;
    const speed = p.animationSpeed || "normal";

    // Helper: lighten a hex color by a percentage
    function lightenHex(hex: string, percent: number): string {
      const cleaned = hex.replace("#", "");
      const r = Math.min(255, parseInt(cleaned.substring(0, 2), 16) + Math.round(255 * percent / 100));
      const g = Math.min(255, parseInt(cleaned.substring(2, 4), 16) + Math.round(255 * percent / 100));
      const b = Math.min(255, parseInt(cleaned.substring(4, 6), 16) + Math.round(255 * percent / 100));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    // Helper: parse hex to rgba
    function hexToRgba(hex: string, alpha: number): string {
      const cleaned = hex.replace("#", "");
      const r = parseInt(cleaned.substring(0, 2), 16);
      const g = parseInt(cleaned.substring(2, 4), 16);
      const b = parseInt(cleaned.substring(4, 6), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    // Compute a hover variant (lighten by ~20%)
    const accentHover = p.accentColor ? lightenHex(p.accentColor, 20) : "#d4b87a";
    // Compute dim variant (30% opacity)
    const accentDim = p.accentColor ? hexToRgba(p.accentColor, 0.3) : "rgba(200, 169, 106, 0.3)";
    // Parse hex to rgba for shadow-glow
    const shadowGlow = p.accentColor
      ? `0 0 30px ${hexToRgba(p.accentColor, 0.15)}`
      : "0 0 30px rgba(200,169,106,0.15)";

    // Animation speed CSS classes
    const speedCss = `
      .cpm-speed-instant * { animation-duration: 0.01s !important; transition-duration: 0.01s !important; }
      .cpm-speed-fast * { animation-duration: 0.3s !important; transition-duration: 0.15s !important; }
      .cpm-speed-normal * { /* default */ }
      .cpm-speed-slow * { animation-duration: 2s !important; transition-duration: 0.8s !important; }
      .cpm-speed-disabled * { animation: none !important; transition: none !important; }
    `;

    // Font CSS overrides
    const fontCss = `
      body, .font-body { font-family: '${fontBody}', system-ui, sans-serif !important; }
      h1, h2, h3, h4, h5, h6, .font-heading, .font-\\[family-name\\:var\\(--font-heading\\)\\] { font-family: '${fontHeading}', serif !important; }
    `;

    // Border radius global override
    const radiusCss = `
      * { border-radius: ${radius} !important; }
    `;

    const cssOverrides = `
      :root {
        --cpm-accent: ${accent};
        --cpm-accent-hover: ${accentHover};
        --cpm-accent-dim: ${accentDim};
        --cpm-bg-primary: ${bg.primary};
        --cpm-bg-secondary: ${bg.secondary};
        --cpm-bg-tertiary: ${bg.tertiary};
        --cpm-border: ${bg.border};
        --cpm-border-hover: ${bg.borderHover};
        --cpm-shadow-glow: ${shadowGlow};
        --cpm-radius: ${radius};
        --cpm-speed: ${speed};
        --font-body: '${fontBody}', system-ui, sans-serif;
        --font-heading: '${fontHeading}', serif;
        --background: ${bg.primary};
        --foreground: #ede9e0;
        --card: ${bg.secondary};
        --card-foreground: #ede9e0;
        --popover: ${bg.secondary};
        --popover-foreground: #ede9e0;
        --primary: ${accent};
        --primary-foreground: ${bg.primary};
        --secondary: ${bg.border};
        --secondary-foreground: #ede9e0;
        --muted: ${bg.border};
        --muted-foreground: var(--cpm-text-secondary);
        --accent: ${accent};
        --accent-foreground: ${bg.primary};
        --border: ${bg.border};
        --input: ${bg.border};
        --ring: ${accent};
        --chart-1: ${accent};
        --sidebar: ${bg.secondary};
        --sidebar-primary: ${accent};
        --sidebar-primary-foreground: ${bg.primary};
        --sidebar-accent: ${bg.border};
        --sidebar-accent-foreground: #ede9e0;
        --sidebar-border: ${bg.border};
        --sidebar-ring: ${accent};
      }

      ${fontCss}

      ${radiusCss}

      ${speedCss}
    `;

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: cssOverrides }} />
        <div className="min-h-0" />
      </>
    );
  },
  ai: { instructions: "Theme customization block for accent color and background shade. Default accent gold #c8a96a." },
};