/**
 * @fileoverview About Us — Server Component, Malta Gold design language.
 */
import { SiteNav } from '@/components/nav/SiteNav';
import { SiteFooter } from '@/components/nav/SiteFooter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Christiano Property Management — premium holiday rentals and property management services in Malta since 2015.',
};

const STATS = [
  { value: '200+', label: 'Happy Guests' },
  { value: '15+', label: 'Curated Properties' },
  { value: '9+', label: 'Years in Malta' },
  { value: '4.9★', label: 'Average Rating' },
] as const;

const VALUES = [
  {
    icon: '✦',
    title: 'Luxury First',
    body: 'Every property is personally inspected and styled to exceed the expectations of discerning travellers.',
  },
  {
    icon: '🏡',
    title: 'Local Expertise',
    body: 'Born and based in Malta, we know every neighbourhood, beach, and hidden gem — and share that knowledge with every guest.',
  },
  {
    icon: '🤝',
    title: 'Owner Partnership',
    body: 'We treat your property like our own, maximising returns through professional management and direct booking.',
  },
  {
    icon: '📞',
    title: '24 / 7 Support',
    body: 'From the moment you enquire to long after check-out, our team is always a message away.',
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 px-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% -10%, #c8a96a33 0%, transparent 70%)',
            }}
            aria-hidden
          />
          <div className="relative max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#c8a96a] mb-2">
              About Christiano PM
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-playfair leading-tight text-[#e8e4dc]">
              Luxury living,<br />local heart
            </h1>
            <p className="text-lg text-[rgba(232,228,220,0.6)] max-w-2xl mx-auto leading-relaxed">
              We are a boutique property management company passionate about
              showcasing the best of Malta — one exceptional stay at a time.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6 border-y border-border/40">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#c8a96a] font-playfair tabular-nums">
                  {value}
                </div>
                <div className="mt-1 text-sm text-[rgba(232,228,220,0.5)]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold font-playfair text-[#e8e4dc]">
              Our Story
            </h2>
            <div className="space-y-4 text-[rgba(232,228,220,0.65)] leading-relaxed">
              <p>
                Christiano Property Management was founded on a simple belief: that a
                holiday home should feel like the finest hotel, but with the warmth and
                character of a local home. We started with a single apartment in Valletta
                and grew organically through word-of-mouth and five-star reviews.
              </p>
              <p>
                Today we manage a curated portfolio of villas, townhouses, and apartments
                across Malta&apos;s most sought-after locations — from the honey-coloured
                streets of Mdina to the sun-drenched shores of St. Julian&apos;s. Each
                property is selected for its architecture, quality, and the story it tells
                about this remarkable island.
              </p>
              <p>
                Our guests return year after year not just for the properties, but for the
                experience — the insider tips, the fresh-flower welcome, the seamless
                check-in at midnight. That&apos;s the Christiano difference.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 bg-[#111214]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-playfair text-[#e8e4dc] mb-12 text-center">
              What We Stand For
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VALUES.map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="p-6 rounded-2xl border border-border/50 bg-[#0a0b0d] hover:border-[rgba(200,169,106,0.35)] transition-colors"
                >
                  <div className="text-2xl mb-4">{icon}</div>
                  <h3 className="text-base font-semibold text-[#e8e4dc] mb-2">{title}</h3>
                  <p className="text-sm text-[rgba(232,228,220,0.55)] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold font-playfair text-[#e8e4dc]">
              Ready to experience Malta?
            </h2>
            <p className="text-[rgba(232,228,220,0.55)]">
              Browse our handpicked collection of luxury properties and book directly for
              the best rates.
            </p>
            <a
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#c8a96a] to-[#9b7d3f] text-[#0e0f11] font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              View Properties →
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
