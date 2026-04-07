/**
 * @fileoverview Public page renderer — Server Component.
 * Route: /[...puckPath] catches all CMS-managed public pages.
 *
 * - Reads from cms_pages via supabaseAdmin
 * - Renders with @measured/puck <Render>
 * - notFound() for missing or unpublished pages in production
 * - generateMetadata for SEO title per page
 * - Defensive: data.content always coerced to array — never .map() crashes
 */
import { Render } from '@measured/puck';
import { notFound } from 'next/navigation';
import type { Data } from '@measured/puck';
import type { Metadata } from 'next';
import { getPageBySlug } from '@/lib/supabase';
import config from '@/puck.config';

type Props = { params: Promise<{ puckPath?: string[] }> };

function resolveSlug(path?: string[]): string {
  return (path ?? []).filter(Boolean).join('/') || 'home';
}

function safeData(raw: unknown): Data {
  if (raw && typeof raw === 'object' && 'content' in raw) {
    const d = raw as Record<string, unknown>;
    return {
      content: Array.isArray(d.content) ? d.content : [],
      root: (d.root as Data['root']) ?? { props: {} },
    };
  }
  return { content: [], root: { props: {} } };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { puckPath } = await params;
  const slug = resolveSlug(puckPath);
  const page = await getPageBySlug(slug);
  return {
    title: page?.title ?? slug,
    description: `${page?.title ?? slug} — Christo Property Management`,
  };
}

export default async function PublicPage({ params }: Props) {
  const { puckPath } = await params;
  const slug = resolveSlug(puckPath);
  const page = await getPageBySlug(slug);

  if (!page) return notFound();
  if (!page.published && process.env.NODE_ENV === 'production') return notFound();

  return <Render config={config} data={safeData(page.data)} />;
}
