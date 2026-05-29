// =============================================================================
// CANONICAL PUCK SPACER BLOCK
// Vertical spacing utility for layout control
// =============================================================================

export const Spacer = {
  label: "Spacer",
  fields: {
    size: {
      type: "select" as const,
      options: [
        { label: "XS (16px)", value: "16" },
        { label: "SM (32px)", value: "32" },
        { label: "MD (48px)", value: "48" },
        { label: "LG (64px)", value: "64" },
        { label: "XL (96px)", value: "96" },
        { label: "2XL (128px)", value: "128" },
      ],
    },
  },
  defaultProps: { size: "64" },
  render: (props: Record<string, unknown>) => {
    const p = props as { size: string };
    return <div style={{ height: `${p.size}px` }} className="w-full" />;
  },
  ai: {
    instructions:
      "Vertical spacing block for layout control. Common values: 32px between sections, 64px for major breaks.",
  },
};

// =============================================================================
// CANONICAL PUCK TEXT BLOCK
// Flexible text content with styling options
// =============================================================================

export const TextBlock = {
  label: "Text Block",
  fields: {
    heading: { type: "text" as const, label: "Heading" },
    body: { type: "textarea" as const, label: "Body Text" },
    badge: { type: "text" as const, label: "Badge Text" },
    align: {
      type: "select" as const,
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    size: {
      type: "select" as const,
      options: [
        { label: "Large", value: "lg" },
        { label: "Medium", value: "md" },
        { label: "Small", value: "sm" },
      ],
    },
    style: {
      type: "select" as const,
      options: [
        { label: "Default", value: "default" },
        { label: "Gold Accent", value: "gold" },
        { label: "Glass Card", value: "glass" },
      ],
    },
  },
  defaultProps: {
    heading: "Welcome to Christiano",
    body: "Your luxury property management partner in Malta. We bring five-star hospitality standards to short-term rental management.",
    badge: "",
    align: "center",
    size: "lg",
    style: "default",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      heading: string;
      body: string;
      badge: string;
      align: string;
      size: string;
      style: string;
    };
    return (
      <div
        className={`text-${p.align} ${p.size} ${p.style}`}
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        {p.badge && <div className="badge">{p.badge}</div>}
        <h2>{p.heading}</h2>
        <p>{p.body}</p>
      </div>
    );
  },
  ai: {
    instructions:
      "Flexible text content with styling options. Use for hero sections, feature descriptions, and more.",
  },
};

// =============================================================================
// CANONICAL PUCK VIDEO SECTION
// Full-width video sections for immersive storytelling
// =============================================================================

export const VideoSection = {
  label: "Video Section",
  fields: {
    video: { type: "video" as const, label: "Video File" },
    poster: { type: "image" as const, label: "Poster Image" },
    heading: { type: "text" as const, label: "Heading" },
    body: { type: "textarea" as const, label: "Body Text" },
    align: {
      type: "select" as const,
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    size: {
      type: "select" as const,
      options: [
        { label: "Large", value: "lg" },
        { label: "Medium", value: "md" },
        { label: "Small", value: "sm" },
      ],
    },
    style: {
      type: "select" as const,
      options: [
        { label: "Default", value: "default" },
        { label: "Gold Accent", value: "gold" },
        { label: "Glass Card", value: "glass" },
      ],
    },
  },
  defaultProps: {
    video: "",
    poster: "",
    heading: "Welcome to Christiano",
    body: "Your luxury property management partner in Malta. We bring five-star hospitality standards to short-term rental management.",
    align: "center",
    size: "lg",
    style: "default",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as {
      video: string;
      poster: string;
      heading: string;
      body: string;
      align: string;
      size: string;
      style: string;
    };
    return (
      <div
        className={`text-${p.align} ${p.size} ${p.style}`}
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <video
          poster={p.poster}
          src={p.video}
          controls
          style={{ width: "100%", maxHeight: "500px" }}
        />
        <h2>{p.heading}</h2>
        <p>{p.body}</p>
      </div>
    );
  },
  ai: {
    instructions:
      "Full-width video sections for immersive storytelling. Use for hero sections, feature descriptions, and more.",
  },
};