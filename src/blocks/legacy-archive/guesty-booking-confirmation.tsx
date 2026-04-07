"use client";

export const GuestyBookingConfirmation = {
  label: "Guesty Booking Confirmation",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Booking Confirmed",
  },
  render: () => (
    <section className="bg-cpm-bg-primary px-4 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-cpm-text-secondary">Booking Confirmation component</p>
      </div>
    </section>
  ),
};
