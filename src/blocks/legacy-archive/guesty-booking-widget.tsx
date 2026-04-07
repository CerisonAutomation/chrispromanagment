"use client";

export const GuestyBookingWidget = {
  label: "Guesty Booking Widget",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Book Now",
  },
  render: () => (
    <section className="bg-cpm-bg-primary px-4 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-cpm-text-secondary">Booking Widget component</p>
      </div>
    </section>
  ),
};
