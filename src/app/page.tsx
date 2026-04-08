/**
 * @version 2.0.0
 * @fileoverview Home route — renders the CMS page for slug 'home'.
 * Falls back to redirect to /properties if no home page is published.
 */
import { redirect } from 'next/navigation';
import { getPageBySlug } from '@/lib/supabase';
import puckConfig from '@/puck.config';
import { Render } from '@measured/puck';
import type { Metadata } from 'next';
import type { PuckData } from '@/types';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('home');
  // Extract metadata from page data if available
  const pageData = page?.data as { meta_title?: string; meta_description?: string } | undefined;
  return {
    title: pageData?.meta_title ?? page?.title ?? 'Home',
    description: pageData?.meta_description ?? undefined,
  };
}

export default async function HomePage() {
  const page = await getPageBySlug('home');

  if (!page || !page.published) {
    redirect('/properties');
  }

  // Parse the page data from JSON string
  const pageContent = typeof page.data === 'string' 
    ? JSON.parse(page.data) 
    : page.data;

  return (
    <main>
      <Render config={puckConfig} data={pageContent} />
    </main>
  );
}
