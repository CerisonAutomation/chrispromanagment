"use client";

export const GuestyPropertyGrid = {
  label: "Guesty Property Grid",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Property Grid",
  },
  render: () => (
    <section className="bg-cpm-bg-primary px-4 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-cpm-text-secondary">Property Grid component</p>
      </div>
    </section>
  ),
};
