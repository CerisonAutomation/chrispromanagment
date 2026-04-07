"use client";

export const GuestyPropertyDetail = {
  label: "Guesty Property Detail",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Property Detail",
  },
  render: () => (
    <section className="bg-cpm-bg-primary px-4 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-cpm-text-secondary">Property Detail component</p>
      </div>
    </section>
  ),
};
