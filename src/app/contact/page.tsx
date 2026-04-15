/**
 * @fileoverview Contact page — Server Component shell + client form.
 */
import { SiteNav } from '@/components/nav/SiteNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import { ContactForm } from './ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Christiano Property Management — enquiries, bookings, and owner partnerships.',
};

const CONTACT_ITEMS = [
  { icon: '📧', label: 'Email', value: 'hello@christiano-pm.com', href: 'mailto:hello@christiano-pm.com' },
  { icon: '📍', label: 'Location', value: 'Valletta, Malta', href: 'https://maps.google.com/?q=Valletta,Malta' },
  { icon: '⏰', label: 'Office Hours', value: 'Mon – Sat, 9 AM – 7 PM CET', href: null },
] as const;

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#c8a96a]">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-playfair text-[#e8e4dc]">
              We&apos;d love to hear from you
            </h1>
            <p className="text-[rgba(232,228,220,0.55)] text-lg">
              Whether you&apos;re planning a stay, listing your property, or simply have a
              question — we&apos;re here to help.
            </p>
          </div>
        </section>

        {/* Content grid */}
        <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact details */}
          <div className="space-y-8">
            <div className="space-y-4">
              {CONTACT_ITEMS.map(({ icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-[#111214]">
                  <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[rgba(232,228,220,0.4)] mb-1">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-[#c8a96a] hover:text-[#e8e4dc] transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-[rgba(232,228,220,0.7)]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-xl border border-[rgba(200,169,106,0.2)] bg-[rgba(200,169,106,0.04)]">
              <p className="text-sm font-semibold text-[#c8a96a] mb-2">🏡 List Your Property</p>
              <p className="text-sm text-[rgba(232,228,220,0.55)] leading-relaxed">
                Interested in professional management for your Malta property? Use the form
                or email us directly — we typically respond within 24 hours.
              </p>
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
