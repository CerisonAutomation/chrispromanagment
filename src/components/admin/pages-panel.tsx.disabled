'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useEditorStore} from '@/store/editor-store';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {
    Archive,
    CheckCircle2,
    Clock,
    Copy,
    Edit2,
    FileText,
    Globe,
    MoreVertical,
    Plus,
    Search,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {cn} from '@/lib/utils';
import {formatDistanceToNow} from 'date-fns';
import {toast} from 'sonner';

// =============================================================================
// PAGES PANEL COMPONENT
// =============================================================================

export function PagesPanel() {
  const router = useRouter();
  const { 
    pages, 
    currentPage, 
    setCurrentPage, 
    loadPages, 
    createPage, 
    deletePage 
  } = useEditorStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Load pages on mount
  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Filter pages
  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return;

    const slug = newPageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const page = await createPage({
        slug,
        title: newPageTitle,
        content: {
          content: [],
          root: { props: { title: newPageTitle } },
        },
        status: 'DRAFT',
      });

      setNewPageTitle('');
      setIsCreating(false);
      setCurrentPage(page);
      toast.success('Page created');
    } catch (error) {
      toast.error('Failed to create page');
    }
  };

  const handleDeletePage = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await deletePage(slug);
      toast.success('Page deleted');
    } catch (error) {
      toast.error('Failed to delete page');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
      case 'DRAFT':
        return <Clock className="h-3 w-3 text-amber-500" />;
      case 'ARCHIVED':
        return <Archive className="h-3 w-3 text-neutral-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-sm">Pages</h2>
          </div>
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            className="h-7 px-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          {pages.length} total pages
        </p>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-neutral-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Create Page Form */}
      {isCreating && (
        <div className="p-3 border-b border-neutral-200 bg-neutral-50">
          <Input
            placeholder="Page title..."
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreatePage();
              if (e.key === 'Escape') setIsCreating(false);
            }}
            autoFocus
            className="mb-2"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleCreatePage}
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Pages List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredPages.map((page) => {
            const isActive = currentPage?.slug === page.slug;
            const updatedAt = page.updatedAt ? new Date(page.updatedAt) : new Date();

            return (
              <div
                key={page.slug}
                className={cn(
                  "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                  isActive
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-neutral-50 border border-transparent"
                )}
                onClick={() => setCurrentPage(page)}
              >
                {/* Icon */}
                <div className={cn(
                  "w-8 h-8 rounded flex items-center justify-center shrink-0",
                  isActive ? "bg-primary/20" : "bg-neutral-100"
                )}>
                  <FileText className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary" : "text-neutral-500"
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-primary" : "text-neutral-700"
                    )}>
                      {page.title}
                    </span>
                    {getStatusIcon(page.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span className="truncate">/{page.slug}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/${page.slug}`, '_blank');
                      }}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      View Page
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        // Duplicate page logic
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.slug);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          {filteredPages.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">
                {searchQuery ? 'No pages found' : 'No pages yet'}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {searchQuery ? 'Try a different search' : 'Create your first page'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/admin/settings')}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Site Settings
        </Button>
      </div>
    </div>
  );
}
