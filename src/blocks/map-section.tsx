import { CONTACT } from "@/lib/constants";

export const MapSection = {
  label: "Map Section",
  fields: {
    title: { type: "text" as const },
    description: { type: "textarea" as const },
    latitude: { type: "text" as const, label: "Latitude" },
    longitude: { type: "text" as const, label: "Longitude" },
    address: { type: "text" as const, label: "Display Address" },
    height: { type: "select" as const, options: [{ label: "Short (300px)", value: "300" }, { label: "Medium (450px)", value: "450" }, { label: "Tall (600px)", value: "600" }] },
  },
  defaultProps: {
    title: "Our Location",
    description: "Visit our office in the heart of Malta.",
    latitude: "35.8961",
    longitude: "14.4645",
    address: CONTACT.location,
    height: "450",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; description: string; latitude: string; longitude: string; address: string; height: string };
    return (
      <>
        <section className="bg-cpm-bg-primary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{p.title}</h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
              {p.description && <p className="mx-auto mt-4 max-w-2xl text-base text-cpm-text-secondary">{p.description}</p>}
            </div>
            <div className="overflow-hidden rounded-2xl border border-cpm-border transition-all duration-300 hover:border-cpm-accent/20">
              <div className="relative flex items-center justify-center bg-cpm-bg-secondary" style={{ minHeight: `${p.height}px` }}>
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${p.longitude}!3d${p.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(p.address)}!5e0!3m2!1sen!2s!4v1`}
                  width="100%" height="100%"
                  style={{ border: 0, minHeight: `${p.height}px` }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-cpm-bg-primary/90 px-4 py-3 backdrop-blur-sm">
                  <svg className="h-4 w-4 text-cpm-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                  <span className="text-sm font-medium text-cpm-text-primary">{p.address}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Embedded Google Map showing CPM Birkirkara Malta location. Coordinates: 35.8961327, 14.4644929." },
};