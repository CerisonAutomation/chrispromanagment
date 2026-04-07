"use client";

export const GuestyPropertySearch = {
  label: "Guesty Property Search",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Property Search",
  },
  render: () => (
    <section className="bg-cpm-bg-primary px-4 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-cpm-text-secondary">Property Search component</p>
      </div>
    </section>
  ),
};
