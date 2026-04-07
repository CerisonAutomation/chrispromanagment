/**
 * @fileoverview Home route — renders the CMS page for slug 'home'.
 * Falls back to redirect to /properties if no home page is published.
 */
import { redirect } from 'next/navigation';
import { getPageBySlug } from '@/lib/supabase';
import { puckConfig } from '@/puck.config';
import { Render } from '@measured/puck';
import type { Metadata } from 'next';
import type { PuckData } from '@/types';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('home');
  return {
    title: page?.meta_title ?? page?.title ?? 'Home',
    description: page?.meta_description ?? undefined,
  };
}

export default async function HomePage() {
  const page = await getPageBySlug('home');

  if (!page || !page.published) {
    redirect('/properties');
  }

  return (
    <main>
      <Render config={puckConfig} data={page.content as PuckData} />
    </main>
  );
}
