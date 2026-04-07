/**
 * @fileoverview Public page renderer — Server Component.
 * Route: /[...puckPath] — catches all public CMS pages.
 * Loads page data from Supabase, renders with @measured/puck <Render>.
 * Falls back to 404 if page not found or unpublished.
 */
import { Render } from '@measured/puck';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import config from '@/puck.config';
import type { Data } from '@measured/puck';
import type { Metadata } from 'next';

type Props = { params: Promise<{ puckPath: string[] }> };

async function getPageData(
  slug: string
): Promise<{ data: Data; title: string; published: boolean } | null> {
  const { data, error } = await supabaseAdmin
    .from('cms_pages')
    .select('data, title, published')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as { data: Data; title: string; published: boolean };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { puckPath } = await params;
  const slug = puckPath?.join('/') ?? 'home';
  const page = await getPageData(slug);
  return {
    title: page?.title ?? slug,
  };
}

export default async function PublicPage({ params }: Props) {
  const { puckPath } = await params;
  const slug = puckPath?.join('/') ?? 'home';

  const page = await getPageData(slug);

  if (!page) return notFound();
  if (!page.published && process.env.NODE_ENV === 'production') return notFound();

  const pageData: Data =
    page.data &&
    typeof page.data === 'object' &&
    'content' in page.data
      ? (page.data as Data)
      : { content: [], root: { props: {} } };

  return <Render config={config} data={pageData} />;
}
