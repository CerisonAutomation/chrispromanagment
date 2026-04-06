import React from "react";
import {toast} from "sonner";
import {CONTACT} from "@/lib/constants";

export const ContactSection = {
  label: "Contact Section",
  fields: {
    title: { type: "text" as const },
    email: { type: "text" as const },
    phone: { type: "text" as const },
    whatsapp: { type: "text" as const },
    location: { type: "text" as const },
    mapLat: { type: "text" as const, label: "Map Latitude" },
    mapLng: { type: "text" as const, label: "Map Longitude" },
  },
  defaultProps: {
    title: "Contact Us",
    email: CONTACT.email,
    phone: CONTACT.phone,
    whatsapp: CONTACT.whatsapp,
    location: CONTACT.location,
    mapLat: CONTACT.mapCoords.lat,
    mapLng: CONTACT.mapCoords.lng,
  },
  render: (props: Record<string, unknown>) => {
    const p = props as { title: string; email: string; phone: string; whatsapp: string; location: string; mapLat: string; mapLng: string };
    const [submitting, setSubmitting] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      setSubmitting(true);
      try {
        const r = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), message: formData.get("message") }),
        });
        if (r.ok) { toast.success("Message sent! We'll reply soon."); setSubmitted(true); }
        else { toast.error("Something went wrong. Please try again."); }
      } catch { toast.error("Network error. Please check your connection and try again."); }
      finally { setSubmitting(false); }
    };
    return (
      <>
        <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center" style={{ animation: "fadeInUp 0.6s ease-out" }}>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">
                {p.title}
              </h2>
              <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3" style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
              {/* Contact Form — Glassmorphism */}
              {submitted ? (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl border border-cpm-success/20 p-8 backdrop-blur-xl text-center"
                  style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(14,15,17,0.9))" }}
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cpm-success/30 bg-cpm-success/10" style={{ animation: "glowPulse 2s ease-in-out infinite" }}>
                    <svg className="h-8 w-8 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-cpm-text-primary">Message Sent!</h3>
                  <p className="mb-6 text-sm text-cpm-text-secondary">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="rounded-xl border border-cpm-accent/30 bg-cpm-accent/5 px-5 py-2.5 text-sm font-medium text-cpm-accent transition-all hover:bg-cpm-accent hover:text-cpm-bg-primary">Send Another Message</button>
                </div>
              ) : (
                <form
                  className="space-y-4 rounded-2xl border border-cpm-accent/10 p-6 backdrop-blur-xl"
                  style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}
                  onSubmit={handleSubmit}
                >
                  <h3 className="mb-2 text-lg font-medium text-cpm-text-primary">Send a Message</h3>
                  <div>
                    <label htmlFor="contact-name" className="mb-1 block text-sm text-cpm-text-secondary">Name <span className="text-cpm-accent">*</span></label>
                    <input id="contact-name" name="name" required className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-2.5 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-1 block text-sm text-cpm-text-secondary">Email <span className="text-cpm-accent">*</span></label>
                    <input id="contact-email" name="email" type="email" required className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-2.5 text-sm text-cpm-text-primary outline-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]" />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="mb-1 block text-sm text-cpm-text-secondary">Message <span className="text-cpm-accent">*</span></label>
                    <textarea id="contact-message" name="message" required rows={4} className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-2.5 text-sm text-cpm-text-primary outline-none resize-none transition-all duration-300 focus:border-cpm-accent/50 focus:shadow-[0_0_0_3px_rgba(200,169,106,0.1)]" />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-cpm-bg-primary transition-all duration-300 hover:shadow-[0_0_25px_rgba(200,169,106,0.2)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-accent-hover))" }}
                  >
                    {submitting && (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    )}
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}

              {/* Contact Info — Glassmorphism */}
              <div
                className="rounded-2xl border border-cpm-accent/10 p-6 backdrop-blur-xl"
                style={{ background: "linear-gradient(135deg, rgba(21,23,27,0.95), rgba(14,15,17,0.9))" }}
              >
                <h3 className="mb-6 text-lg font-medium text-cpm-text-primary">Get in Touch</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">Email</p>
                      <a href={`mailto:${p.email}`} className="text-sm text-cpm-accent transition-colors hover:text-cpm-text-primary">{p.email}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">Phone</p>
                      <a href={`tel:${p.phone}`} className="text-sm text-cpm-accent transition-colors hover:text-cpm-text-primary">{p.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">WhatsApp</p>
                      <a href={`https://wa.me/${p.whatsapp?.replace(/\+/g, "")}`} className="text-sm text-cpm-accent transition-colors hover:text-cpm-text-primary">{p.whatsapp}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110"
                      style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">Location</p>
                      <p className="text-sm text-cpm-text-primary">{p.location}</p>
                    </div>
                  </div>
                  {/* Working Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cpm-text-primary transition-transform duration-300 hover:scale-110" style={{ background: "linear-gradient(135deg, var(--cpm-accent), var(--cpm-gold-dark))" }}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-cpm-text-tertiary">Working Hours</p>
                      <p className="text-sm text-cpm-text-secondary">Mon–Fri: 9am – 6pm</p>
                      <p className="text-xs text-cpm-text-tertiary">Sat: 10am – 2pm</p>
                    </div>
                  </div>
                  {/* Social Media Links */}
                  <div className="pt-2">
                    <p className="mb-3 text-xs uppercase tracking-wider text-cpm-text-tertiary">Follow Us</p>
                    <div className="flex gap-3">
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-cpm-border bg-cpm-bg-primary text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-cpm-border bg-cpm-bg-primary text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-cpm-border bg-cpm-bg-primary text-cpm-text-secondary transition-all duration-300 hover:border-cpm-accent/30 hover:text-cpm-accent">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="overflow-hidden rounded-2xl border border-cpm-border transition-all duration-300 hover:border-cpm-accent/20">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${p.mapLng}!3d${p.mapLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(p.location)}!5e0!3m2!1sen!2s!4v1`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "380px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              </div>
            </div>
          </div>
        </section>
      </>
    );
  },
  ai: { instructions: "Professional contact section. Use CPM actual details: info@christianopropertymanagement.com, +35679790202, Birkirkara Malta." },
};