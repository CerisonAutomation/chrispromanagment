/**
 * @fileoverview Terms of Service — Server Component.
 */
import { SiteNav } from '@/components/nav/SiteNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Christiano Property Management website and booking services.',
};

const LAST_UPDATED = '1 January 2025';

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-16">
        <article className="max-w-3xl mx-auto px-6 py-20 space-y-10">
          <header className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c8a96a]">
              Legal
            </span>
            <h1 className="text-4xl font-bold font-playfair text-[#e8e4dc]">
              Terms of Service
            </h1>
            <p className="text-sm text-[rgba(232,228,220,0.4)]">Last updated: {LAST_UPDATED}</p>
          </header>

          <Section title="1. Acceptance of Terms">
            By accessing or using the Christiano Property Management website (&quot;Site&quot;) or booking
            services, you agree to be bound by these Terms of Service. If you do not agree, please
            do not use the Site.
          </Section>

          <Section title="2. Services">
            We provide an online platform to browse and enquire about holiday rental properties in
            Malta managed by Christiano Property Management. Bookings are subject to availability
            and separate booking confirmation from us or our partner platform (Guesty).
          </Section>

          <Section title="3. Booking & Payment">
            <ul className="list-disc list-inside space-y-1 text-[rgba(232,228,220,0.65)]">
              <li>All prices are displayed in EUR and are subject to change without notice until a booking is confirmed.</li>
              <li>A deposit may be required to secure a booking. Full details are provided during the booking process.</li>
              <li>Payment is processed securely via our booking platform. We do not store card details.</li>
            </ul>
          </Section>

          <Section title="4. Cancellation Policy">
            Cancellation terms vary by property and booking dates. The specific policy applicable to
            your booking will be displayed before you confirm. In general:
            <ul className="mt-2 list-disc list-inside space-y-1 text-[rgba(232,228,220,0.65)]">
              <li>Cancellations 30+ days before check-in: full refund of deposit.</li>
              <li>Cancellations 14–29 days before check-in: 50% refund of deposit.</li>
              <li>Cancellations within 14 days: deposit non-refundable.</li>
            </ul>
          </Section>

          <Section title="5. Guest Responsibilities">
            Guests are responsible for: treating properties with care, adhering to house rules
            (maximum occupancy, noise, no smoking unless stated), and reporting any damage promptly.
            A security deposit may be held and applied against damages.
          </Section>

          <Section title="6. Limitation of Liability">
            To the fullest extent permitted by law, Christiano Property Management is not liable for
            indirect, incidental, or consequential damages arising from your use of the Site or any
            booked property. Our total liability shall not exceed the amount paid for the booking.
          </Section>

          <Section title="7. Intellectual Property">
            All content on this Site — including text, photography, branding, and software — is owned
            by or licensed to Christiano Property Management. You may not reproduce or distribute it
            without prior written permission.
          </Section>

          <Section title="8. Governing Law">
            These Terms are governed by the laws of Malta. Any disputes shall be subject to the
            exclusive jurisdiction of the Maltese courts.
          </Section>

          <Section title="9. Changes to Terms">
            We reserve the right to modify these Terms at any time. Continued use of the Site
            after changes are posted constitutes your acceptance.
          </Section>

          <Section title="10. Contact">
            For questions about these Terms:{' '}
            <a href="mailto:legal@christiano-pm.com" className="text-[#c8a96a] underline underline-offset-2">
              legal@christiano-pm.com
            </a>
          </Section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-[#e8e4dc] font-playfair">{title}</h2>
      <div className="text-[rgba(232,228,220,0.65)] leading-relaxed text-sm">
        {children}
      </div>
    </section>
  );
}
