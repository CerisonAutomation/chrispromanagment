"use client";

export const ImageGallery = {
  label: "Image Gallery",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Image Gallery",
  },
  render: () => (
    <section className="bg-cpm-bg-primary px-4 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-cpm-text-secondary">Image Gallery component</p>
      </div>
    </section>
  ),
};
