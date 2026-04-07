/**
 * @fileoverview Dynamic CMS page renderer.
 * Matches any slug path, renders published Puck data via ISR.
 */
import { notFound } from 'next/navigation';
import { getAllPages, getPageBySlug } from '@/lib/supabase';
import { puckConfig } from '@/puck.config';
import { Render } from '@measured/puck';
import type { Metadata } from 'next';
import type { PuckData } from '@/types';

export const revalidate = 60;

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages
    .filter((p) => p.published && p.slug && p.slug !== 'home')
    .map((p) => ({ puckPath: p.slug.split('/').filter(Boolean) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath } = await params;
  const slug = puckPath.join('/');
  const page = await getPageBySlug(slug);
  return {
    title: page?.meta_title ?? page?.title ?? slug,
    description: page?.meta_description ?? undefined,
  };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ puckPath: string[] }>;
}) {
  const { puckPath } = await params;
  const slug = puckPath.join('/');
  const page = await getPageBySlug(slug);

  if (!page || !page.published) notFound();

  return (
    <main>
      <Render config={puckConfig} data={page.content as PuckData} />
    </main>
  );
}
