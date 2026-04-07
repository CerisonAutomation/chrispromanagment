/**
 * @fileoverview Public CMS page renderer — Server Component.
 * Catches all routes managed by the CMS. notFound() for missing/unpublished.
 */
import { Render } from '@measured/puck';
import { notFound } from 'next/navigation';
import type { Data } from '@measured/puck';
import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/supabase';
import config from '@/puck.config';
import type { PuckData } from '@/types';

type Props = { params: Promise<{ puckPath?: string[] }> };

function resolveSlug(path?: string[]): string {
  return (path ?? []).filter(Boolean).join('/') || 'home';
}

function safeData(raw: unknown): Data {
  if (raw && typeof raw === 'object') {
    const d = raw as Partial<PuckData>;
    return {
      content: Array.isArray(d.content) ? d.content as Data['content'] : [],
      root: d.root ?? { props: {} },
    };
  }
  return { content: [], root: { props: {} } };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { puckPath } = await params;
  const page = await getPageBySlug(resolveSlug(puckPath));
  return {
    title: page?.title,
    description: `${page?.title ?? 'Page'} — Christo Property Management`,
  };
}

export default async function CmsPage({ params }: Props) {
  const { puckPath } = await params;
  const slug = resolveSlug(puckPath);
  const page = await getPageBySlug(slug);
  if (!page) return notFound();
  if (!page.published && process.env.NODE_ENV === 'production') return notFound();
  return <Render config={config} data={safeData(page.data)} />;
}
