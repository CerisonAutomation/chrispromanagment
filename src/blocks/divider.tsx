

export const Divider = {
  label: "Divider",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string };
    if (p.title) {
      return (
        <>
            <div className="flex items-center gap-4 px-4 py-8 sm:px-8">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cpm-accent/30 to-cpm-accent/30" />
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-cpm-text-tertiary">{p.title}</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-cpm-accent/30 to-cpm-accent/30" />
          </div>
        </>
      );
    }
    return (
      <>
        <div className="flex items-center justify-center px-4 py-8 sm:px-8">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cpm-accent/20 to-transparent" />
          <div className="mx-3 h-2 w-2 rotate-45 rounded-sm bg-cpm-accent/40" style={{ animation: "dotPulse 2s ease-in-out infinite" }} />
          <div className="h-[1px] w-full bg-gradient-to-l from-transparent via-cpm-accent/20 to-transparent" />
        </div>
      </>
    );
  },
  ai: { instructions: "Optional text label centered on a subtle divider line. Leave empty string for plain separator." },
};