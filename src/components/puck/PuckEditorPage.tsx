/**
 * @fileoverview PuckEditorPage — Full editor with AI Theme Creator, Block Generator,
 * and Property Description Writer wired into Puck's overrides system.
 * Unlocks ALL disabled admin panels as proper Puck sidebar tabs.
 */
'use client';

import { useCallback, useState, useTransition } from 'react';
import { Puck, type Data } from '@measured/puck';
import '@measured/puck/puck.css';
import config from '@/puck.config';
import { AIThemeCreator } from '@/components/ai/AIThemeCreator';
import { PuckAIPanel } from '@/components/ai/PuckAIPanel';
import type { GeneratedTheme } from '@/app/api/ai/generate-theme/route';
import { cn } from '@/lib/utils';
import {
  Wand2, Palette, LayoutTemplate, Save, Eye, ChevronLeft, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type EditorTab = 'blocks' | 'ai' | 'theme';

interface PuckEditorPageProps {
  initialData: Data;
  slug: string;
  onSave: (data: Data) => Promise<void>;
}

/**
 * Full-featured Puck editor page with AI sidebar integration.
 */
export function PuckEditorPage({ initialData, slug, onSave }: PuckEditorPageProps) {
  const [isSaving, startSave] = useTransition();
  const [activeTab, setActiveTab] = useState<EditorTab>('blocks');
  const [appliedThemeName, setAppliedThemeName] = useState<string | null>(null);
  const [puckData, setPuckData] = useState<Data>(initialData);

  const handleSave = useCallback((data: Data) => {
    startSave(async () => {
      try {
        await onSave(data);
        setPuckData(data);
        toast.success('Page saved successfully');
      } catch {
        toast.error('Failed to save page');
      }
    });
  }, [onSave]);

  const handleThemeApplied = useCallback((_tokens: Record<string, string>, theme: GeneratedTheme) => {
    setAppliedThemeName(theme.name);
    toast.success(`Theme "${theme.name}" applied live`, { description: theme.description });
  }, []);

  const tabs: Array<{ id: EditorTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'blocks', label: 'Blocks', icon: <Layers className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Builder', icon: <Wand2 className="w-4 h-4" />, badge: 'NEW' },
    { id: 'theme', label: 'AI Theme', icon: <Palette className="w-4 h-4" />, badge: appliedThemeName ?? undefined },
  ];

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="h-12 border-b border-border flex items-center px-4 gap-4 shrink-0 bg-background/95 backdrop-blur-sm z-50">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <a href="/admin">
            <ChevronLeft className="w-4 h-4" /> Admin
          </a>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium truncate max-w-[200px]">{slug}</span>
        </div>
        {appliedThemeName && (
          <Badge variant="outline" className="text-xs border-violet-500 text-violet-500 ml-2">
            <Palette className="w-3 h-3 mr-1" />{appliedThemeName}
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-1.5" /> Preview
            </a>
          </Button>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Custom AI Sidebar */}
        <aside className="w-80 border-r border-border flex flex-col shrink-0 bg-background">
          {/* Sidebar Tab Nav */}
          <nav className="flex border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 text-xs font-medium transition-colors relative',
                  activeTab === tab.id
                    ? 'text-foreground border-b-2 border-primary bg-muted/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="absolute top-1 right-1.5 text-[9px] font-bold px-1 py-0.5 rounded bg-violet-600 text-white leading-none">
                    {tab.badge.length > 6 ? '●' : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'blocks' && (
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-3">
                  20 blocks available. Drag from the Puck component panel on the right.
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(config.components).map(([key, comp]) => (
                    <div key={key} className="text-xs p-2 rounded-lg bg-muted/50 border border-border text-muted-foreground truncate">
                      {(comp as { label: string }).label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'ai' && (
              <PuckAIPanel
                pageSlug={slug}
                existingBlocks={(puckData.content ?? [])}
                onBlocksGenerated={(blocks) => {
                  setPuckData(prev => ({
                    ...prev,
                    content: [...(prev.content ?? []), ...blocks],
                  }));
                  toast.success(`${blocks.length} AI block${blocks.length > 1 ? 's' : ''} added`);
                }}
                onPageGenerated={(page) => {
                  setPuckData(prev => ({ ...prev, content: page.blocks }));
                  toast.success('Full page generated by AI');
                }}
                className="rounded-none border-0 bg-transparent"
              />
            )}
            {activeTab === 'theme' && (
              <AIThemeCreator
                onThemeApplied={handleThemeApplied}
                className="rounded-none border-0 bg-transparent"
              />
            )}
          </div>

          {/* Save Footer */}
          <div className="border-t border-border p-3">
            <Button
              onClick={() => handleSave(puckData)}
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Page'}
            </Button>
          </div>
        </aside>

        {/* Puck Editor */}
        <div className="flex-1 min-w-0">
          <Puck
            config={config}
            data={puckData}
            onPublish={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
