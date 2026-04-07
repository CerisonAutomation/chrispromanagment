"use client";

import React from "react";
import {toast} from "sonner";
import {CONTACT} from "@/lib/constants";

export interface ContactSectionProps {
  title: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  mapLat: string;
  mapLng: string;
}

export const ContactSection = {
  label: "Contact Section",
  fields: {
    title: { type: "text" as const },
    email: { type: "text" as const },
    phone: { type: "text" as const },
    whatsapp: { type: "text" as const },
    location: { type: "text" as const },
    mapLat: { type: "text" as const },
    mapLng: { type: "text" as const },
  },
  defaultProps: {
    title: "Get in Touch",
    email: CONTACT.email,
    phone: CONTACT.phone,
    whatsapp: CONTACT.whatsapp,
    location: CONTACT.location,
    mapLat: "35.8992",
    mapLng: "14.5140",
  },
  render: (props: Record<string, unknown>) => {
    const p = props as unknown as ContactSectionProps;
    return <ContactComponent {...p} />;
  },
};

const ContactComponent: React.FC<ContactSectionProps> = React.memo(({ title, email, phone, whatsapp, location }) => {
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
      if (r.ok) { toast.success("Message sent! We will reply soon."); setSubmitted(true); }
      else { toast.error("Something went wrong. Please try again."); }
    } catch { toast.error("Network error. Please check your connection and try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="bg-cpm-bg-secondary px-4 py-20 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-light tracking-tight text-cpm-text-primary sm:text-4xl">{title}</h2>
          <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-transparent via-cpm-accent to-transparent" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {submitted ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-cpm-success/20 p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cpm-success/10"><svg className="h-8 w-8 text-cpm-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
              <h3 className="mb-2 text-lg font-medium text-cpm-text-primary">Message Sent!</h3>
              <p className="text-sm text-cpm-text-secondary">We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Name</label><input name="name" required className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3 text-sm text-cpm-text-primary outline-none" placeholder="Your name" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Email</label><input name="email" type="email" required className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3 text-sm text-cpm-text-primary outline-none" placeholder="you@email.com" /></div>
              </div>
              <div className="mt-4"><label className="mb-1.5 block text-sm font-medium text-cpm-text-primary">Message</label><textarea name="message" required rows={4} className="w-full rounded-xl border border-cpm-border bg-cpm-bg-secondary px-4 py-3 text-sm text-cpm-text-primary outline-none" placeholder="How can we help you?" /></div>
              <button type="submit" disabled={submitting} className="mt-4 w-full rounded-xl bg-cpm-accent px-6 py-3 text-sm font-semibold text-cpm-bg-primary transition-all hover:bg-cpm-accent-hover disabled:opacity-50">{submitting ? "Sending..." : "Send Message"}</button>
            </form>
          )}
          <div className="space-y-4">
            <div className="rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cpm-accent">Contact Info</h3>
              <div className="space-y-3">
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-cpm-text-secondary hover:text-cpm-accent"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>{email}</a>
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-sm text-cpm-text-secondary hover:text-cpm-accent"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>{phone}</a>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-cpm-text-secondary hover:text-cpm-accent"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>WhatsApp</a>
              </div>
            </div>
            <div className="rounded-2xl border border-cpm-border bg-cpm-bg-primary p-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cpm-accent">Location</h3>
              <p className="text-sm text-cpm-text-secondary">{location}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ContactComponent.displayName = "ContactComponent";
