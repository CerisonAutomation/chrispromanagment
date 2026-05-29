/**
 * @fileoverview Admin: Create New Page — slug entry form that redirects to Puck editor.
 */
'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugTouched) setSlug(slugify(val));
  }

  function handleSlugChange(val: string) {
    setSlugTouched(true);
    setSlug(slugify(val));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!slug) { setError('Slug is required.'); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError('Slug must be lowercase letters, numbers, and hyphens only.');
      return;
    }

    // Navigate to Puck editor — it will upsert the page on first save
    router.push(`/puck/${slug}`);
  }

  const preview = slug ? `/${slug}` : '';

  return (
    <div className="max-w-xl mx-auto p-10 space-y-8">
      {/* Header */}
      <header>
        <button
          onClick={() => router.push('/admin/pages')}
          className="text-xs text-[rgba(232,228,220,0.4)] hover:text-[#c8a96a] transition-colors mb-6 flex items-center gap-1"
        >
          ← Back to Pages
        </button>
        <h1 className="text-2xl font-bold text-[#e8e4dc] tracking-tight">Create New Page</h1>
        <p className="text-sm text-[rgba(232,228,220,0.4)] mt-1">
          Set a title and URL slug, then you&apos;ll be taken to the visual editor.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="np-title">Page Title</Label>
          <Input
            id="np-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. About Us"
            required
            autoFocus
          />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="np-slug">URL Slug</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[rgba(232,228,220,0.3)] pointer-events-none select-none">
              /
            </span>
            <Input
              id="np-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="about-us"
              className="pl-6"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </div>
          {preview && (
            <p className="text-xs text-[rgba(232,228,220,0.35)]">
              Live URL:{' '}
              <span className="font-mono text-[rgba(200,169,106,0.7)]">{preview}</span>
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={!slug}>
          Open in Editor →
        </Button>
      </form>
    </div>
  );
}
