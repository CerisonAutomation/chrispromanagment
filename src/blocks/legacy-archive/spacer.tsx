

export const Spacer = {
  label: "Spacer",
  fields: {
    size: { type: "select" as const, options: [{ label: "XS (16px)", value: "16" }, { label: "SM (32px)", value: "32" }, { label: "MD (48px)", value: "48" }, { label: "LG (64px)", value: "64" }, { label: "XL (96px)", value: "96" }, { label: "2XL (128px)", value: "128" }] },
  },
  defaultProps: { size: "64" },
  render: (props: Record<string, unknown>) => {
    const p = props as { size: string };
    return (
      <div style={{ height: `${p.size}px` }} className="w-full" />
    );
  },
  ai: { instructions: "Vertical spacing block for layout control. Common values: 32px between sections, 64px for major breaks." },
};