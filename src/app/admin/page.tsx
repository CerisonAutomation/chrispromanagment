'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {AnimatePresence, motion} from 'framer-motion';
import {
  Blocks,
  Bot,
  CheckCircle2,
  ChevronLeft,
  Eye,
  FileText,
  Globe,
  Home,
  Keyboard,
  LayoutGrid,
  Loader,
  Loader2,
  Monitor,
  Palette,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Redo2,
  Save,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Undo2,
  X
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/lib/utils';
import {useAdminStore} from '@/store/admin-store';
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

// =============================================================================
// TOAST CONTAINER COMPONENT
// =============================================================================

function ToastContainer() {
  const toasts = useAdminStore((s) => s.toasts);
  const removeToast = useAdminStore((s) => s.removeToast);

  const toastStyles = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500'
    },
    error: {bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: X, iconColor: 'text-red-500'},
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Loader,
      iconColor: 'text-blue-500'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: Loader,
      iconColor: 'text-amber-500'
    },
  };

  return (
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const style = toastStyles[t.type];
            const Icon = style.icon;
            return (
                <motion.div
                    key={t.id}
                    initial={{opacity: 0, x: 80, scale: 0.95}}
                    animate={{opacity: 1, x: 0, scale: 1}}
                    exit={{opacity: 0, x: 80, scale: 0.95}}
                    transition={{type: 'spring', stiffness: 400, damping: 30}}
                    layout
                    className={cn('pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg max-w-sm', style.bg, style.border)}
                >
                  <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', style.iconColor)}/>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', style.text)}>{t.title}</p>
                    {t.description && <p className="text-xs mt-0.5 opacity-70">{t.description}</p>}
                  </div>
                  <button onClick={() => removeToast(t.id)}
                          className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                    <X className="h-3.5 w-3.5"/>
                  </button>
                </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
  );
}

// =============================================================================
// KEYBOARD SHORTCUTS HOOK
// =============================================================================

function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    savePage,
    publishPage,
    setViewMode,
    viewMode,
    setSidebarPanel,
    sidebarPanel,
    setRightPanel,
    selectedBlockId,
    deleteBlock,
    duplicateBlock
  } = useAdminStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const tag = (e.target as HTMLElement).tagName;
      const isInputFocused = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      // Command palette
      if (isCtrl && e.key === 'k') {
        e.preventDefault();
        // TODO: Open command palette
        return;
      }

      // Save
      if (isCtrl && e.key === 's') {
        e.preventDefault();
        savePage();
        return;
      }

      // Publish
      if (isCtrl && e.key === 'p' && !isShift) {
        e.preventDefault();
        publishPage();
        return;
      }

      // Undo
      if (isCtrl && e.key === 'z' && !isShift) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo
      if ((isCtrl && isShift && e.key === 'z') || (isCtrl && e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Toggle preview
      if (isCtrl && e.key === 'e') {
        e.preventDefault();
        setViewMode(viewMode === 'edit' ? 'preview' : 'edit');
        return;
      }

      // Duplicate block
      if (isCtrl && e.key === 'd' && !isInputFocused) {
        e.preventDefault();
        if (selectedBlockId) duplicateBlock(selectedBlockId);
        return;
      }

      // Panel shortcuts (when not in input)
      if (!isInputFocused && !isCtrl && !isShift) {
        if (e.key === '1') {
          setSidebarPanel(sidebarPanel === 'blocks' ? 'none' : 'blocks');
          return;
        }
        if (e.key === '2') {
          setSidebarPanel(sidebarPanel === 'ai' ? 'none' : 'ai');
          return;
        }
        if (e.key === '3') {
          setSidebarPanel(sidebarPanel === 'theme' ? 'none' : 'theme');
          return;
        }
        if (e.key === '4') {
          setSidebarPanel(sidebarPanel === 'pages' ? 'none' : 'pages');
          return;
        }
      }

      // Delete block
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId && !isInputFocused) {
        e.preventDefault();
        deleteBlock(selectedBlockId);
        return;
      }

      // Escape - deselect
      if (e.key === 'Escape') {
        useAdminStore.getState().setSelectedBlockId(null);
        setRightPanel('none');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, savePage, publishPage, setViewMode, viewMode, setSidebarPanel, sidebarPanel, setRightPanel, selectedBlockId, deleteBlock, duplicateBlock]);
}

// =============================================================================
// AUTOSAVE HOOK
// =============================================================================

function useAutosave() {
  const {autosaveEnabled, isDirty, savePage, currentPage} = useAdminStore();

  useEffect(() => {
    if (!autosaveEnabled || !isDirty || !currentPage) return;

    const timer = setTimeout(() => {
      savePage();
    }, 3000);

    return () => clearTimeout(timer);
  }, [autosaveEnabled, isDirty, savePage, currentPage]);
}

// =============================================================================
// BLOCKS PANEL
// =============================================================================

function BlocksPanel() {
  const {setSidebarPanel, sidebarPanel, addToast} = useAdminStore();
  const [search, setSearch] = useState('');

  const categories = useMemo(() => [
    {
      name: 'Content',
      components: ['HeroSection', 'AboutSection', 'WhyChooseUs', 'ServicesSection', 'PropertyShowcase', 'FaqSection', 'ContactSection', 'ImageWithText', 'TextBlock', 'ComparisonSection', 'FeatureGrid']
    },
    {
      name: 'Social Proof',
      components: ['TestimonialSection', 'StatsSection', 'LogoBar', 'SocialProofStrip', 'TeamSection']
    },
    {name: 'Media', components: ['ImageGallery', 'VideoSection', 'MapSection', 'MaltaMapSection', 'Timeline']},
    {name: 'Conversion', components: ['CtaBanner', 'BookingSection', 'NewsletterSection', 'PricingTable']},
    {name: 'Layout', components: ['Divider', 'Spacer', 'FooterSection', 'ThemeSettings']},
    {
      name: 'Guesty',
      components: ['GuestyPropertySearch', 'GuestyPropertyGrid', 'GuestyPropertyDetail', 'GuestyBookingWidget', 'GuestyBookingConfirmation', 'GuestyBookingDashboard']
    },
  ], []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      components: cat.components.filter(comp => comp.toLowerCase().includes(q)),
    })).filter(cat => cat.components.length > 0);
  }, [categories, search]);

  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      HeroSection: Sparkles, AboutSection: FileText, WhyChooseUs: CheckCircle2,
      ServicesSection: LayoutGrid, PropertyShowcase: Home, FaqSection: Loader,
      ContactSection: Globe, ImageWithText: Blocks, TextBlock: FileText,
      ComparisonSection: Loader, FeatureGrid: LayoutGrid, TestimonialSection: Loader,
      StatsSection: Loader, LogoBar: Blocks, SocialProofStrip: Loader,
      TeamSection: Loader, ImageGallery: Blocks, VideoSection: Loader,
      MapSection: Globe, MaltaMapSection: Globe, Timeline: Loader,
      CtaBanner: Sparkles, BookingSection: Loader, NewsletterSection: Loader,
      PricingTable: Loader, Divider: Loader, Spacer: Loader, FooterSection: Loader,
      ThemeSettings: Palette, GuestyPropertySearch: Search, GuestyPropertyGrid: LayoutGrid,
      GuestyPropertyDetail: Home, GuestyBookingWidget: Loader, GuestyBookingConfirmation: CheckCircle2,
      GuestyBookingDashboard: LayoutGrid,
    };
    return icons[name] || Blocks;
  };

  return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Blocks className="h-4 w-4 text-amber-600"/>
              <h2 className="font-semibold text-sm text-neutral-900">Components</h2>
            </div>
            <button onClick={() => setSidebarPanel('none')} className="p-1 rounded hover:bg-neutral-100">
              <PanelLeftClose className="h-4 w-4 text-neutral-500"/>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"/>
            <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blocks..."
                className="pl-9 h-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredCategories.map((category) => (
                <div key={category.name}>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">{category.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {category.components.map((comp) => {
                      const Icon = getIcon(comp);
                      return (
                          <button
                              key={comp}
                              onClick={() => {
                                addToast({type: 'info', title: `Click to add ${comp}`, duration: 2000});
                              }}
                              className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200 bg-white hover:border-amber-500/50 hover:bg-amber-50/50 transition-all text-left"
                          >
                            <Icon className="h-4 w-4 text-neutral-500 shrink-0"/>
                            <span
                                className="text-xs text-neutral-700 truncate">{comp.replace(/([A-Z])/g, ' $1').trim()}</span>
                          </button>
                      );
                    })}
                  </div>
                </div>
            ))}
          </div>
        </ScrollArea>
      </div>
  );
}

// =============================================================================
// AI PANEL
// =============================================================================

function AIPanel() {
  const {
    setSidebarPanel,
    aiMessages,
    isAiGenerating,
    addAiMessage,
    setAiGenerating,
    clearAiMessages,
    generateWithAI
  } = useAdminStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [aiMessages]);

  const handleSend = async () => {
    if (!input.trim() || isAiGenerating) return;
    await generateWithAI(input);
    setInput('');
  };

  return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-amber-600"/>
            <h2 className="font-semibold text-sm text-neutral-900">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clearAiMessages} className="p-1.5 rounded hover:bg-neutral-100" title="Clear conversation">
              <Trash2 className="h-4 w-4 text-neutral-500"/>
            </button>
            <button onClick={() => setSidebarPanel('none')} className="p-1.5 rounded hover:bg-neutral-100">
              <PanelLeftClose className="h-4 w-4 text-neutral-500"/>
            </button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          {aiMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-amber-600"/>
                </div>
                <p className="text-sm text-neutral-600">Describe the page you want to build</p>
                <p className="text-xs text-neutral-400 mt-2">Try: "Create a landing page for my SaaS"</p>
              </div>
          )}
          <div className="space-y-4">
            {aiMessages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                  <div
                      className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', msg.role === 'user' ? 'bg-amber-600' : 'bg-neutral-100')}>
                    {msg.role === 'user' ? <Loader className="h-4 w-4 text-white"/> :
                        <Bot className="h-4 w-4 text-amber-600"/>}
                  </div>
                  <div
                      className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', msg.role === 'user' ? 'bg-amber-600 text-white rounded-br-md' : 'bg-neutral-100 text-neutral-800 rounded-bl-md')}>
                    {msg.loading ? (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce"
                                style={{animationDelay: '0ms'}}/>
                          <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce"
                                style={{animationDelay: '150ms'}}/>
                          <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce"
                                style={{animationDelay: '300ms'}}/>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
            ))}
          </div>
          <div ref={messagesEndRef}/>
        </ScrollArea>
        <div className="p-4 border-t border-neutral-200">
          <div className="flex gap-2">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask AI to build something..."
                className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isAiGenerating} size="sm"
                    className="bg-amber-600 hover:bg-amber-700">
              <Loader className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </div>
  );
}

// =============================================================================
// THEME PANEL
// =============================================================================

function ThemePanel() {
  const {setSidebarPanel, currentTheme, themes, setTheme} = useAdminStore();

  return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-amber-600"/>
              <h2 className="font-semibold text-sm text-neutral-900">Themes</h2>
            </div>
            <button onClick={() => setSidebarPanel('none')} className="p-1 rounded hover:bg-neutral-100">
              <PanelLeftClose className="h-4 w-4 text-neutral-500"/>
            </button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {themes.map((theme) => (
                <button
                    key={theme.id}
                    onClick={() => setTheme(theme)}
                    className={cn('w-full text-left rounded-xl border-2 p-3 transition-all', currentTheme.id === theme.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-transparent hover:border-neutral-300')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg shadow-inner" style={{background: theme.colors.background}}>
                      <div className="w-full h-3 rounded-t" style={{background: theme.colors.primary}}/>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-neutral-900">{theme.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">{theme.fonts.body}</p>
                    </div>
                    {currentTheme.id === theme.id && <CheckCircle2 className="h-5 w-5 text-amber-600"/>}
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    {Object.values(theme.colors).slice(0, 5).map((color, idx) => (
                        <div key={idx} className="w-4 h-4 rounded-full border border-neutral-200"
                             style={{background: color}}/>
                    ))}
                  </div>
                </button>
            ))}
          </div>
        </ScrollArea>
      </div>
  );
}

// =============================================================================
// PAGES PANEL
// =============================================================================

function PagesPanel() {
  const {setSidebarPanel, pages, currentPage, loadPage, createPage, deletePage, loadPages} = useAdminStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPages().finally(() => setIsLoading(false));
  }, [loadPages]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newSlug.trim()) return;
    await createPage({slug: newSlug, title: newTitle});
    setIsCreating(false);
    setNewTitle('');
    setNewSlug('');
  };

  return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-600"/>
              <h2 className="font-semibold text-sm text-neutral-900">Pages</h2>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsCreating(true)} className="p-1.5 rounded hover:bg-neutral-100"
                      title="New page">
                <Plus className="h-4 w-4 text-neutral-500"/>
              </button>
              <button onClick={() => setSidebarPanel('none')} className="p-1.5 rounded hover:bg-neutral-100">
                <PanelLeftClose className="h-4 w-4 text-neutral-500"/>
              </button>
            </div>
          </div>
          {isCreating && (
              <div className="space-y-2">
                <Input value={newTitle} onChange={(e) => {
                  setNewTitle(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                }} placeholder="Page title..." autoFocus/>
                <div className="flex gap-2">
                  <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="Slug"
                         className="flex-1"/>
                  <Button onClick={handleCreate} size="sm" className="bg-amber-600 hover:bg-amber-700">
                    <CheckCircle2 className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
          )}
        </div>
        <ScrollArea className="flex-1 p-2">
          {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-5 w-5 animate-spin text-neutral-400"/>
              </div>
          ) : pages.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                No pages yet
              </div>
          ) : (
              <div className="space-y-1">
                {currentPage && (
                    <div className="p-3 rounded-lg bg-amber-50 border-2 border-amber-500 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-600"/>
                        <span className="font-medium text-sm text-neutral-900 flex-1">{currentPage.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600 text-white">Current</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">/{currentPage.slug}</div>
                    </div>
                )}
                {pages.filter((p) => p.slug !== currentPage?.slug).map((page) => (
                    <button
                        key={page.id}
                        onClick={() => loadPage(page.slug)}
                        className="w-full p-3 rounded-lg border border-transparent hover:border-neutral-300 hover:bg-neutral-50 text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-neutral-400"/>
                        <span className="font-medium text-sm text-neutral-900 flex-1">{page.title}</span>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          deletePage(page.slug);
                        }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-opacity">
                          <Trash2 className="h-3.5 h-3.5 text-red-500"/>
                        </button>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">/{page.slug}</div>
                    </button>
                ))}
              </div>
          )}
        </ScrollArea>
      </div>
  );
}

// =============================================================================
// TOOLBAR COMPONENT
// =============================================================================

function Toolbar({onNavigate}: { onNavigate: (path: string) => void }) {
  const currentPage = useAdminStore((s) => s.currentPage);
  const isDirty = useAdminStore((s) => s.isDirty);
  const isSaving = useAdminStore((s) => s.isSaving);
  const isPublishing = useAdminStore((s) => s.isPublishing);
  const viewMode = useAdminStore((s) => s.viewMode);
  const setViewMode = useAdminStore((s) => s.setViewMode);
  const deviceMode = useAdminStore((s) => s.deviceMode);
  const setDeviceMode = useAdminStore((s) => s.setDeviceMode);
  const sidebarPanel = useAdminStore((s) => s.sidebarPanel);
  const setSidebarPanel = useAdminStore((s) => s.setSidebarPanel);
  const undo = useAdminStore((s) => s.undo);
  const redo = useAdminStore((s) => s.redo);
  const savePage = useAdminStore((s) => s.savePage);
  const publishPage = useAdminStore((s) => s.publishPage);
  const lastSavedAt = useAdminStore((s) => s.lastSavedAt);
  const autosaveEnabled = useAdminStore((s) => s.autosaveEnabled);
  const canUndo = useAdminStore((s) => s.undoStack.length > 0);
  const canRedo = useAdminStore((s) => s.redoStack.length > 0);

  const [title, setTitle] = useState(currentPage?.title || 'Untitled');

  useEffect(() => {
    if (currentPage?.title) setTitle(currentPage.title);
  }, [currentPage?.title]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    useAdminStore.getState().updateCurrentPage({title: newTitle});
  };

  const autosaveStatus = useMemo(() => {
    if (!autosaveEnabled) return {text: 'Autosave off', color: 'text-neutral-500'};
    if (isDirty) return {text: 'Saving...', color: 'text-amber-500'};
    if (lastSavedAt) {
      const diff = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      if (diff < 5) return {text: 'Just saved', color: 'text-emerald-500'};
      return {text: `Saved ${diff < 60 ? diff + 's' : Math.floor(diff / 60) + 'm'} ago`, color: 'text-neutral-400'};
    }
    return {text: 'Ready', color: 'text-neutral-400'};
  }, [autosaveEnabled, isDirty, lastSavedAt]);

  const deviceButtons = [
    {mode: 'desktop' as const, icon: Monitor, label: 'Desktop'},
    {mode: 'tablet' as const, icon: Tablet, label: 'Tablet'},
    {mode: 'mobile' as const, icon: Smartphone, label: 'Mobile'},
  ];

  const panelButtons = [
    {panel: 'blocks' as const, icon: LayoutGrid, label: 'Blocks', key: '1'},
    {panel: 'ai' as const, icon: Bot, label: 'AI', key: '2'},
    {panel: 'theme' as const, icon: Palette, label: 'Theme', key: '3'},
    {panel: 'pages' as const, icon: FileText, label: 'Pages', key: '4'},
  ];

  return (
      <div className="h-14 flex items-center px-4 border-b border-neutral-200 gap-4 bg-white">
        <div className="flex items-center gap-3 flex-1">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/')} className="gap-2">
            <ChevronLeft className="h-4 w-4"/>
            Back
          </Button>
          <div className="h-6 w-px bg-neutral-200"/>
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-1.5 rounded">
              <Sparkles className="h-4 w-4 text-amber-600"/>
            </div>
            <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="font-semibold text-neutral-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded px-1 -ml-1 w-48"
            />
          </div>
          {isDirty && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            Unsaved
          </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          {deviceButtons.map(({mode, icon: Icon, label}) => (
              <button
                  key={mode}
                  onClick={() => setDeviceMode(mode)}
                  className={cn('p-1.5 rounded-md transition-colors', deviceMode === mode ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700')}
                  title={label}
              >
                <Icon className="h-4 w-4"/>
              </button>
          ))}
          <div className="w-px h-4 bg-neutral-300 mx-1"/>
          <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'preview' ? 'bg-amber-600 text-white' : 'text-neutral-500 hover:text-neutral-700')}
              title={viewMode === 'edit' ? 'Preview' : 'Edit'}
          >
            {viewMode === 'edit' ? <Eye className="h-4 w-4"/> : <Settings className="h-4 w-4"/>}
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={!canUndo}
                    className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 disabled:opacity-30"
                    title="Undo (Cmd+Z)">
              <Undo2 className="h-4 w-4"/>
            </button>
            <button onClick={redo} disabled={!canRedo}
                    className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 disabled:opacity-30"
                    title="Redo (Cmd+Shift+Z)">
              <Redo2 className="h-4 w-4"/>
            </button>
          </div>
          <div className="w-px h-4 bg-neutral-300"/>
          <div className="flex items-center gap-1">
            {panelButtons.map(({panel, icon: Icon, label, key}) => (
            <button
                key={panel}
                onClick={() => setSidebarPanel(sidebarPanel === panel ? 'none' : panel)}
                className={cn('p-1.5 rounded-md transition-colors', sidebarPanel === panel ? 'bg-amber-600 text-white' : 'text-neutral-500 hover:text-neutral-700')}
                title={`${label} (${key})`}
            >
              <Icon className="h-4 w-4"/>
            </button>
            ))}
          </div>
          <div className="w-px h-4 bg-neutral-300"/>
          <div className="flex items-center gap-2">
          <span className={cn('text-xs flex items-center gap-1', autosaveStatus.color)}>
            {isDirty ? <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/> :
                <CheckCircle2 className="h-3 w-3"/>}
            {autosaveStatus.text}
          </span>
            <Button onClick={() => savePage()} size="sm" variant="outline" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
              Save
          </Button>
            <Button onClick={() => publishPage()} size="sm" disabled={isPublishing}>
              {isPublishing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
            Publish
          </Button>
        </div>
        </div>
      </div>
  );
}

// =============================================================================
// MAIN ADMIN PAGE
// =============================================================================

export default function AdminPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.puckPath?.[0] as string | undefined;

  const {
    currentPage,
    content,
    setContent,
    loadPage,
    savePage,
    publishPage,
    sidebarPanel,
    setSidebarPanel,
    rightPanel,
    setRightPanel,
    deviceMode,
    viewMode,
    isDirty,
    selectedBlockId,
    setSelectedBlockId,
    updateCurrentPage
  } = useAdminStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (slug) {
      loadPage(slug);
    }
  }, [slug, loadPage]);

  // Initialize hooks
  useKeyboardShortcuts();
  useAutosave();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const renderSidebar = () => {
    switch (sidebarPanel) {
      case 'blocks':
        return <BlocksPanel/>;
      case 'ai':
        return <AIPanel/>;
      case 'theme':
        return <ThemePanel/>;
      case 'pages':
        return <PagesPanel/>;
      default:
        return null;
    }
  };

  if (!mounted) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"/>
            <p className="text-neutral-500">Loading editor...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <ToastContainer/>
        <Toolbar onNavigate={handleNavigate}/>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <AnimatePresence mode="wait">
            {sidebarPanel !== 'none' && (
                <motion.div
                    initial={{width: 0, opacity: 0}}
                    animate={{width: 320, opacity: 1}}
                    exit={{width: 0, opacity: 0}}
                    transition={{duration: 0.2}}
                    className="border-r border-neutral-200 bg-white flex flex-col shrink-0 overflow-hidden"
                >
                  {renderSidebar()}
                </motion.div>
            )}
          </AnimatePresence>

          {/* Main Canvas */}
          <div className="flex-1 overflow-auto p-8"
               style={{background: 'radial-gradient(ellipse at center, rgba(200,169,106,0.03) 0%, transparent 70%)'}}>
            <div className="flex justify-center min-h-full">
              <div
                  className={cn('transition-all duration-300 bg-white shadow-sm', deviceMode === 'mobile' && 'shadow-2xl')}
                  style={{width: deviceWidths[deviceMode], maxWidth: '100%'}}
              >
                {viewMode === 'edit' ? (
                    <div
                        className="min-h-[600px] flex items-center justify-center text-neutral-400 border-2 border-dashed border-neutral-200 m-4 rounded-lg">
                      <div className="text-center">
                        <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                        <p className="text-lg font-medium">Puck Editor Canvas</p>
                        <p className="text-sm mt-2">Drag and drop blocks here</p>
                      </div>
                    </div>
                ) : (
                    <div className="min-h-[600px] p-4">
                      {content ? (
                          <div>Preview Mode - Content loaded</div>
                      ) : (
                          <div className="text-center text-neutral-400 py-20">
                            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p className="text-lg">Preview Mode</p>
                          </div>
                      )}
                </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <AnimatePresence mode="wait">
            {rightPanel !== 'none' && (
                <motion.div
                    initial={{width: 0, opacity: 0}}
                    animate={{width: 320, opacity: 1}}
                    exit={{width: 0, opacity: 0}}
                    transition={{duration: 0.2}}
                    className="border-l border-neutral-200 bg-white flex flex-col shrink-0 overflow-hidden"
                >
                  <div className="p-4 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-amber-600"/>
                    <h2 className="font-semibold text-sm text-neutral-900">Properties</h2>
                  </div>
                      <button onClick={() => setRightPanel('none')} className="p-1 rounded hover:bg-neutral-100">
                        <PanelRightClose className="h-4 w-4 text-neutral-500"/>
                      </button>
                </div>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    {selectedBlockId ? (
                        <div className="text-sm text-neutral-600">
                          Selected block: {selectedBlockId}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-neutral-400">
                          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                          <p className="text-sm">Select a block to edit properties</p>
                        </div>
                    )}
                  </ScrollArea>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

      {/* Status Bar */}
        <div
            className="h-7 flex items-center justify-between px-4 text-[10px] bg-white border-t border-neutral-200 text-neutral-500 shrink-0">
          <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <LayoutGrid className="h-3 w-3"/>
            {content?.content?.length || 0} blocks
          </span>
            <span className="opacity-30">|</span>
            <span>{currentPage?.slug || '/'}</span>
        </div>
          <div className="flex items-center gap-1">
            <Keyboard className="h-3 w-3"/>
            <span>Cmd+K for shortcuts</span>
        </div>
        </div>
    </div>
  );
}