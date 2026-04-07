/**
 * @fileoverview Public homepage — Server Component.
 * Delegates to the CMS renderer via the home slug.
 * If no 'home' page exists in Supabase, renders a beautiful static fallback.
 */
import { Render } from '@measured/puck';
import type { Data } from '@measured/puck';
import { getPageBySlug } from '@/lib/supabase';
import config from '@/puck.config';
import { SiteNav } from '@/components/nav/SiteNav';
import { SiteFooter } from '@/components/nav/SiteFooter';

const FALLBACK_DATA: Data = {
  content: [
    {
      type: 'Hero',
      props: {
        heading: 'Luxury Living in Malta',
        subheading: 'Premium property management and holiday rentals on the Mediterranean island of Malta. From Valletta to Gozo — we take care of everything.',
        ctaText: 'View Properties',
        ctaHref: '/properties',
        backgroundImage: '',
      },
    },
    {
      type: 'Columns',
      props: {
        cols: [
          { heading: 'Premium Rentals', body: 'Hand-picked luxury properties across Malta\'s finest locations.', icon: '🏠' },
          { heading: 'Full Management', body: 'End-to-end property care, guest communication, and maintenance.', icon: '🔑' },
          { heading: 'Global Reach', body: 'Listed across Airbnb, Booking.com, and Guesty network worldwide.', icon: '🌍' },
          { heading: 'Revenue Optimised', body: 'Dynamic pricing and occupancy strategies to maximise returns.', icon: '📈' },
        ],
      },
    },
  ],
  root: { props: { title: 'Christo Property Management', theme: 'malta-gold' } },
};

export default async function HomePage() {
  const page = await getPageBySlug('home');
  const data: Data = page?.data
    ? { content: Array.isArray((page.data as { content?: unknown }).content) ? (page.data as Data).content : [], root: (page.data as Data).root ?? { props: {} } }
    : FALLBACK_DATA;

  return (
    <>
      <SiteNav />
      <main>
        <Render config={config} data={data} />
      </main>
      <SiteFooter />
    </>
  );
}
