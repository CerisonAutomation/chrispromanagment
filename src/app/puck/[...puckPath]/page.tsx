/**
 * @fileoverview Puck editor route — /puck/* paths.
 * Server component shell: auth-gates, loads data, mounts PuckEditorPage.
 */
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PuckEditorPage } from '@/components/puck';
import type { Data } from '@measured/puck';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Editor — Admin',
  robots: { index: false, follow: false },
};

const EMPTY_PAGE: Data = {
  content: [],
  root: { props: { title: 'New Page', description: '', theme: 'malta-gold' } },
};

async function getPageData(slug: string): Promise<Data> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/pages?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return EMPTY_PAGE;
    const json = await res.json() as { data?: Data };
    return json.data ?? EMPTY_PAGE;
  } catch {
    return EMPTY_PAGE;
  }
}

async function savePageData(slug: string, data: Data): Promise<void> {
  'use server';
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, data }),
  });
  if (!res.ok) throw new Error('Failed to save page');
}

interface PageProps {
  params: Promise<{ puckPath: string[] }>;
}

export default async function PuckEditorRoute({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/api/auth/signin');

  const { puckPath } = await params;
  const slug = puckPath.join('/');
  if (!slug) notFound();

  const initialData = await getPageData(slug);

  return (
    <PuckEditorPage
      initialData={initialData}
      slug={slug}
      onSave={savePageData.bind(null, slug)}
    />
  );
}
