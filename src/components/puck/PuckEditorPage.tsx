/**
 * @fileoverview PuckEditorPage — Full editor with AI Theme Creator, Block Generator,
 * and Property Description Writer wired into Puck's overrides system.
 * Unlocks ALL disabled admin panels as proper Puck sidebar tabs.
 */
'use client';

import { useCallback, useState, useTransition, useEffect } from 'react';
import { Puck, type Data } from '@measured/puck';
import '@measured/puck/puck.css';
import config from '@/puck.config';
import { AIThemeCreator } from '@/components/ai/AIThemeCreator';
import { PuckAIPanel } from '@/components/ai/PuckAIPanel';
import type { GeneratedTheme } from '@/app/api/ai/generate-theme/route';
import { cn } from '@/lib/utils';
import {
  Wand2, Palette, LayoutTemplate, Save, Eye, ChevronLeft, Layers,
  History, RotateCcw, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getPageVersions, rollbackToVersion } from '@/lib/actions/pages';
import type { PageVersion } from '@/lib/actions/pages';

type EditorTab = 'blocks' | 'ai' | 'theme' | 'versions';

interface PuckEditorPageProps {
  initialData: Data;
  slug: string;
  onSave: (data: Data) => Promise<void>;
}

/**
 * Full-featured Puck editor page with AI sidebar integration AND VERSION CONTROL
 * State is DATA-DRIVEN: loads from DB, stays in sync until edited
 */
export function PuckEditorPage({ initialData, slug, onSave }: PuckEditorPageProps) {
  const [isSaving, startSave] = useTransition();
  const [activeTab, setActiveTab] = useState<EditorTab>('blocks');
  const [appliedThemeName, setAppliedThemeName] = useState<string | null>(null);
  
  // CORE FIX: State is initialized from DB and stays in sync
  const [puckData, setPuckData] = useState<Data>(initialData);
  const [isDirty, setIsDirty] = useState(false); // Track if edited
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [isLoadingVersions, startLoadingVersions] = useTransition();

  // Track changes: mark dirty when data changes from initial
  useEffect(() => {
    const initialStr = JSON.stringify(initialData);
    const currentStr = JSON.stringify(puckData);
    setIsDirty(initialStr !== currentStr);
  }, [puckData, initialData]);

  // Load version history when versions tab is opened
  const handleTabChange = useCallback((tab: EditorTab) => {
    setActiveTab(tab);
    if (tab === 'versions' && versions.length === 0) {
      loadVersions();
    }
  }, [versions.length]);

  const loadVersions = useCallback(() => {
    startLoadingVersions(async () => {
      try {
        const data = await getPageVersions(slug);
        setVersions(data);
      } catch (error) {
        toast.error('Failed to load version history');
      }
    });
  }, [slug]);

  const handleRollback = useCallback(async (versionId: string) => {
    if (!confirm('Rollback to this version? Current changes will be saved as a version first.')) {
      return;
    }
    
    startSave(async () => {
      try {
        const result = await rollbackToVersion(versionId, slug);
        if (result.success) {
          toast.success(result.message);
          // Reload the page to get fresh data
          window.location.reload();
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error('Failed to rollback');
      }
    });
  }, [slug]);

  const handleSave = useCallback((data: Data) => {
    startSave(async () => {
      try {
        await onSave(data);
        setPuckData(data);
        setIsDirty(false); // Reset dirty state after save
        toast.success('Page saved successfully');
        // Reload versions if on that tab
        if (activeTab === 'versions') {
          loadVersions();
        }
      } catch {
        toast.error('Failed to save page');
      }
    });
  }, [onSave, activeTab]);

  const handleThemeApplied = useCallback((_tokens: Record<string, string>, theme: GeneratedTheme) => {
    setAppliedThemeName(theme.name);
    toast.success(`Theme "${theme.name}" applied live`, { description: theme.description });
  }, []);

  const handleReset = useCallback(() => {
    if (isDirty && !confirm('Discard changes and reload from database?')) {
      return;
    }
    // Reset to initial DB state
    setPuckData(initialData);
    setIsDirty(false);
    toast.info('Reset to saved state');
  }, [isDirty, initialData]);

  const tabs: Array<{ id: EditorTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'blocks', label: 'Blocks', icon: <Layers className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Builder', icon: <Wand2 className="w-4 h-4" />, badge: 'NEW' },
    { id: 'theme', label: 'AI Theme', icon: <Palette className="w-4 h-4" />, badge: appliedThemeName ?? undefined },
    { id: 'versions', label: 'History', icon: <History className="w-4 h-4" />, badge: versions.length > 0 ? `${versions.length}` : undefined },
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
          {isDirty && (
            <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
              Modified
            </Badge>
          )}
        </div>
        {appliedThemeName && (
          <Badge variant="outline" className="text-xs border-violet-500 text-violet-500 ml-2">
            <Palette className="w-3 h-3 mr-1" />{appliedThemeName}
          </Badge>
        )}
        <div className="ml-auto flex items-center gap-2">
          {isDirty && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
            </Button>
          )}
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
                onClick={() => handleTabChange(tab.id)}
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
                  {Object.keys(config.components).length} blocks available. Drag from the Puck component panel on the right.
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
            {activeTab === 'versions' && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Version History</h3>
                  <Button variant="ghost" size="sm" onClick={loadVersions} disabled={isLoadingVersions}>
                    <RotateCcw className={`w-3 h-3 ${isLoadingVersions ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {versions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No version history yet. Save the page to create versions.</p>
                ) : (
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <div key={version.id} className="p-2 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate">{version.title || 'Untitled'}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleRollback(version.id)}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Rollback
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(version.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save Footer */}
          <div className="border-t border-border p-3">
            <Button
              onClick={() => handleSave(puckData)}
              disabled={isSaving || !isDirty}
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : isDirty ? 'Save Changes' : 'No Changes'}
            </Button>
          </div>
        </aside>

        {/* Puck Editor */}
        <div className="flex-1 min-w-0">
          <Puck
            config={config}
            data={puckData}
            onPublish={handleSave}
            onChange={(data) => {
              setPuckData(data);
              // isDirty is calculated via useEffect
            }}
          />
        </div>
      </div>
    </div>
  );
}
