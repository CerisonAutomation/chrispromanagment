/**
 * @fileoverview Dynamic CMS page renderer.
 * Matches any slug path, renders published Puck data via ISR.
 */
import { notFound } from 'next/navigation';
import { getAllPages, getPageBySlug } from '@/lib/supabase';
import config from '@/puck.config';
import { Render } from '@measured/puck';
import type { Metadata } from 'next';

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
    title: page?.title ?? slug,
    description: undefined,
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

  const puckData = typeof page.data === 'string' ? JSON.parse(page.data) : page.data;

  return (
    <main>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- bridge puck config types */}
      <Render config={config as any} data={puckData} />
    </main>
  );
}
