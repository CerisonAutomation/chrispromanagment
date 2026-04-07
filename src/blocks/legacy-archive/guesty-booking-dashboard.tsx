"use client";

export const GuestyBookingDashboard = {
  label: "Guesty Booking Dashboard",
  fields: {
    title: { type: "text" as const },
  },
  defaultProps: {
    title: "Booking Dashboard",
  },
  render: () => (
    <section className="bg-cpm-bg-primary px-4 py-20">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-cpm-text-secondary">Booking Dashboard component</p>
      </div>
    </section>
  ),
};
