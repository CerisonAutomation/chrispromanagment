/**
 * @fileoverview Puck editor route — /puck/* paths.
 * Server component shell: Supabase auth gate, loads page data, mounts PuckEditorPage.
 * Auth unified to Supabase SSR (same as admin layout — no next-auth split).
 */
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { PuckEditorPage } from '@/components/puck';
import { updatePageData } from '@/lib/actions/pages';
import type { Data } from '@measured/puck';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Editor — Admin',
  robots: { index: false, follow: false },
};

const EMPTY_PAGE: Data = {
  content: [],
  root: { props: { title: 'New Page' } as Record<string, unknown> },
};

async function getSupabaseUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cs) {
          cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getPageData(slug: string): Promise<Data> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ?? process.env.NEXTAUTH_URL
      ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/pages?slug=${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return EMPTY_PAGE;
    const json = await res.json() as { data?: Data };
    return json.data ?? EMPTY_PAGE;
  } catch {
    return EMPTY_PAGE;
  }
}

interface PageProps {
  params: Promise<{ puckPath: string[] }>;
}

export default async function PuckEditorRoute({ params }: PageProps) {
  const user = await getSupabaseUser();
  if (!user) redirect('/admin/login');

  const { puckPath } = await params;
  const slug = puckPath.join('/');
  if (!slug) notFound();

  const initialData = await getPageData(slug);

  // Server action bound to this slug
  async function handleSave(data: Data): Promise<void> {
    'use server';
    await updatePageData(slug, data);
  }

  return (
    <PuckEditorPage
      initialData={initialData}
      slug={slug}
      onSave={handleSave}
    />
  );
}
