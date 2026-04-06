'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Puck } from '@measured/puck';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Save, 
  Eye, 
  ChevronLeft, 
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Settings,
  Blocks,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import config from '@/puck.config';
import '@measured/puck/puck.css';

// =============================================================================
// TYPES
// =============================================================================

type PageData = {
  id?: string;
  slug: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  content: any;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
};

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

// =============================================================================
// ADMIN PAGE COMPONENT
// =============================================================================

export default function AdminPage({ 
  initialPage 
}: { 
  initialPage?: PageData 
}) {
  const router = useRouter();
  const [page, setPage] = useState<PageData>(initialPage || {
    slug: 'new-page',
    title: 'New Page',
    status: 'DRAFT',
    content: { content: [], root: { props: { title: 'New Page' } } },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [activeTab, setActiveTab] = useState('editor');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  const fetchPage = useCallback(async (slug: string) => {
    try {
      const response = await fetch(`/api/pages/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      const data = await response.json();
      setPage(data);
      return data;
    } catch (error) {
      toast.error('Failed to load page');
      return null;
    }
  }, []);

  // =============================================================================
  // SAVE & PUBLISH
  // =============================================================================

  const savePage = async (content: any, status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/pages/${page.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          data: content,
          saveAsDraft: status === 'DRAFT',
          meta: {
            title: page.metaTitle || page.title,
            description: page.metaDescription,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save page');

      const savedPage = await response.json();
      setPage(prev => ({ ...prev, ...savedPage }));
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      toast.success(status === 'PUBLISHED' ? 'Page published!' : 'Draft saved');
      return savedPage;
    } catch (error) {
      toast.error('Failed to save page');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const publishPage = async (content: any) => {
    setIsPublishing(true);
    try {
      await savePage(content, 'PUBLISHED');
    } finally {
      setIsPublishing(false);
    }
  };

  // =============================================================================
  // KEYBOARD SHORTCUTS
  // =============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      
      if (isCtrl && e.key === 's') {
        e.preventDefault();
        // Save triggered via Puck's onPublish
      }
      
      if (isCtrl && e.key === 'p') {
        e.preventDefault();
        // Preview
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // =============================================================================
  // RENDER
  // =============================================================================

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/puck')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">{page.title}</h1>
              <p className="text-xs text-neutral-500">/{page.slug}</p>
            </div>
          </div>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Device Toggle */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-1 mr-4">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={cn(
                "p-1.5 rounded transition-all",
                deviceMode === 'desktop' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              )}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={cn(
                "p-1.5 rounded transition-all",
                deviceMode === 'tablet' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              )}
              title="Tablet view"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={cn(
                "p-1.5 rounded transition-all",
                deviceMode === 'mobile' ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              )}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/${page.slug}?preview=true`, '_blank')}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>

          <Button
            size="sm"
            onClick={() => {
              // Get current Puck data and publish
              const puckData = (window as any).__PUCK_DATA__;
              if (puckData) {
                publishPage(puckData);
              }
            }}
            disabled={isPublishing}
            className="gap-2"
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Publish
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Puck
          config={config}
          data={page.content}
          onPublish={async (data) => {
            await savePage(data);
          }}
          onChange={(data) => {
            setHasUnsavedChanges(true);
            // Store for publish button access
            (window as any).__PUCK_DATA__ = data;
          }}
          permissions={{
            delete: true,
            drag: true,
            edit: true,
            duplicate: true,
            insert: true,
          }}
          overrides={{
            // Custom header override
            header: ({ actions }: any) => <div className="hidden">{actions}</div>,

            // Component library panel
            components: ({ children }: any) => (
              <div className="bg-white border-r border-neutral-200 w-80 flex flex-col h-full">
                <div className="px-4 py-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Blocks className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-sm">Components</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {children}
                </div>
              </div>
            ),

            // Fields panel
            fields: ({ children }: any) => (
              <div className="bg-white border-l border-neutral-200 w-80 flex flex-col h-full">
                <div className="px-4 py-3 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold text-sm">Properties</h2>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {children}
                </div>
              </div>
            ),
          }}
        />
      </div>

      {/* Status Bar */}
      <footer className="bg-white border-t border-neutral-200 px-4 py-2 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {page.status === 'PUBLISHED' ? 'Published' : 'Draft'}
          </span>
          {lastSaved && (
            <span>
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">
            Press Cmd+S to save
          </span>
        </div>
      </footer>
    </div>
  );
}
