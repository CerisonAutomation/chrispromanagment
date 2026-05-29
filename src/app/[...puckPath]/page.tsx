/**
 * @fileoverview Dynamic CMS page renderer.
 * Matches any slug path, renders published Puck data via ISR.
 */
import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/supabase';
import Client from './client';
import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

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
      <Client data={puckData} />
    </main>
  );
}
