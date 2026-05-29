'use client';

import React, {useEffect, useState} from 'react';
import {useEditorStore} from '@/store/editor-store';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Clock, GitBranch, History, MessageSquare, RotateCcw, User} from 'lucide-react';
import {cn} from '@/lib/utils';
import {formatDistanceToNow} from 'date-fns';
import {toast} from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

interface PageVersion {
  id: string;
  pageId: string;
  data: any;
  message: string | null;
  authorName: string | null;
  createdAt: string;
  blocksAdded: number;
  blocksRemoved: number;
  blocksModified: number;
}

// =============================================================================
// VERSION PANEL COMPONENT
// =============================================================================

export function VersionPanel() {
  const { currentPage, setCurrentPage } = useEditorStore();
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  // Load versions
  useEffect(() => {
    if (!currentPage?.id) return;

    const loadVersions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/pages/${currentPage.slug}/versions`);
        if (!response.ok) throw new Error('Failed to load versions');
        const data = await response.json();
        setVersions(data);
      } catch (error) {
        console.error('Failed to load versions:', error);
        toast.error('Failed to load version history');
      } finally {
        setIsLoading(false);
      }
    };

    loadVersions();
  }, [currentPage?.id, currentPage?.slug]);

  const restoreVersion = async (version: PageVersion) => {
    if (!currentPage) return;

    try {
      // Update current page with version data
      const response = await fetch(`/api/pages/${currentPage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentPage.title,
          data: version.data,
          saveAsDraft: true,
          meta: {
            title: currentPage.metaTitle || currentPage.title,
            description: currentPage.metaDescription,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to restore version');

      setCurrentPage({
        ...currentPage,
        content: JSON.parse(version.data),
      });

      toast.success('Version restored successfully');
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast.error('Failed to restore version');
    }
  };

  const previewVersion = (version: PageVersion) => {
    // Store preview data and open in new tab
    sessionStorage.setItem('version-preview', version.data);
    window.open(`/${currentPage?.slug}?preview=version`, '_blank');
  };

  if (!currentPage) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-4">
        <History className="h-12 w-12 text-neutral-300 mb-3" />
        <p className="text-sm text-neutral-500 text-center">
          Select a page to view version history
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">Version History</h2>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          {versions.length} versions of "{currentPage.title}"
        </p>
      </div>

      {/* Versions List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Clock className="h-10 w-10 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-500 text-center">
              No versions yet. Save your page to create the first version.
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {versions.map((version, index) => {
              const isLatest = index === 0;
              const isSelected = selectedVersion === version.id;
              const date = new Date(version.createdAt);

              return (
                <div
                  key={version.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-neutral-200 hover:border-neutral-300"
                  )}
                  onClick={() => setSelectedVersion(version.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isLatest && (
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded">
                          Latest
                        </span>
                      )}
                      <span className="text-xs text-neutral-500">
                        {formatDistanceToNow(date, { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  {version.message && (
                    <p className="text-sm font-medium text-neutral-800 mb-2">
                      {version.message}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                    {version.blocksAdded > 0 && (
                      <span className="text-emerald-600">
                        +{version.blocksAdded} added
                      </span>
                    )}
                    {version.blocksRemoved > 0 && (
                      <span className="text-red-600">
                        -{version.blocksRemoved} removed
                      </span>
                    )}
                    {version.blocksModified > 0 && (
                      <span className="text-amber-600">
                        ~{version.blocksModified} modified
                      </span>
                    )}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <User className="h-3 w-3" />
                    <span>{version.authorName || 'Unknown'}</span>
                  </div>

                  {/* Actions */}
                  {isSelected && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-200">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          previewVersion(version);
                        }}
                      >
                        Preview
                      </Button>
                      {!isLatest && (
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreVersion(version);
                          }}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <MessageSquare className="h-3 w-3" />
          <span>Each save creates a new version</span>
        </div>
      </div>
    </div>
  );
}
