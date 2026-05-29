/**
 * @fileoverview Privacy Policy — Server Component, GDPR-aligned.
 */
import { SiteNav } from '@/components/nav/SiteNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Christiano Property Management collects, uses, and protects your data.',
};

const LAST_UPDATED = '1 January 2025';

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-16">
        <article className="max-w-3xl mx-auto px-6 py-20 space-y-10">
          <header className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c8a96a]">
              Legal
            </span>
            <h1 className="text-4xl font-bold font-playfair text-[#e8e4dc]">Privacy Policy</h1>
            <p className="text-sm text-[rgba(232,228,220,0.4)]">Last updated: {LAST_UPDATED}</p>
          </header>

          <Section title="1. Who We Are">
            Christiano Property Management (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a property management
            company based in Valletta, Malta. We operate the website at{' '}
            <a href="/" className="text-[#c8a96a] underline underline-offset-2">
              christiano-pm.com
            </a>{' '}
            and associated booking services.
          </Section>

          <Section title="2. What Data We Collect">
            <ul className="list-disc list-inside space-y-1 text-[rgba(232,228,220,0.65)]">
              <li>Contact information (name, email) when you submit the contact form or make a booking enquiry.</li>
              <li>Booking details (dates, guest count, property) when you request a quote or reservation.</li>
              <li>Usage data (pages visited, device type) collected automatically via Vercel Analytics.</li>
              <li>Authentication credentials if you access the Owner Portal, stored securely by Supabase.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul className="list-disc list-inside space-y-1 text-[rgba(232,228,220,0.65)]">
              <li>To process and manage your booking or enquiry.</li>
              <li>To communicate with you about your stay.</li>
              <li>To improve our website and services.</li>
              <li>To comply with our legal obligations under GDPR and Maltese law.</li>
            </ul>
          </Section>

          <Section title="4. Legal Basis for Processing">
            We process your personal data on the following lawful bases (GDPR Art. 6):
            <ul className="mt-2 list-disc list-inside space-y-1 text-[rgba(232,228,220,0.65)]">
              <li><strong className="text-[rgba(232,228,220,0.85)]">Contract</strong> — processing necessary to perform or prepare a booking contract.</li>
              <li><strong className="text-[rgba(232,228,220,0.85)]">Legitimate interest</strong> — website analytics and fraud prevention.</li>
              <li><strong className="text-[rgba(232,228,220,0.85)]">Consent</strong> — marketing communications (you can withdraw at any time).</li>
            </ul>
          </Section>

          <Section title="5. Third-Party Services">
            We share data only with processors strictly necessary to operate our service:
            <ul className="mt-2 list-disc list-inside space-y-1 text-[rgba(232,228,220,0.65)]">
              <li><strong className="text-[rgba(232,228,220,0.85)]">Guesty</strong> — booking and property management platform.</li>
              <li><strong className="text-[rgba(232,228,220,0.85)]">Supabase</strong> — database and authentication (EU data residency).</li>
              <li><strong className="text-[rgba(232,228,220,0.85)]">Vercel</strong> — website hosting and edge network.</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            We retain booking-related data for up to 7 years to comply with Maltese tax and hospitality
            regulations. Contact form submissions are retained for 12 months. You may request deletion at
            any time (see Your Rights below).
          </Section>

          <Section title="7. Your Rights (GDPR)">
            You have the right to: access your data, correct inaccuracies, request deletion, restrict
            or object to processing, and data portability. To exercise any of these rights, email{' '}
            <a href="mailto:privacy@christiano-pm.com" className="text-[#c8a96a] underline underline-offset-2">
              privacy@christiano-pm.com
            </a>
            . You also have the right to lodge a complaint with the{' '}
            <a href="https://idpc.org.mt" target="_blank" rel="noopener noreferrer" className="text-[#c8a96a] underline underline-offset-2">
              Office of the Information and Data Protection Commissioner (Malta)
            </a>
            .
          </Section>

          <Section title="8. Cookies">
            We use only technically necessary cookies (session management, authentication). We do not
            use third-party advertising cookies. You can manage cookies through your browser settings.
          </Section>

          <Section title="9. Changes to This Policy">
            We may update this policy periodically. Material changes will be announced on the website
            with at least 14 days&apos; notice.
          </Section>

          <Section title="10. Contact">
            For privacy enquiries:{' '}
            <a href="mailto:privacy@christiano-pm.com" className="text-[#c8a96a] underline underline-offset-2">
              privacy@christiano-pm.com
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
