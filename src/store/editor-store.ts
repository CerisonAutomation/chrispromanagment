/**
 * Editor store for AI panel state management
 */

import { create } from 'zustand';
import { getPageBySlug } from '@/lib/supabase';
import { deletePage as dbDeletePage } from '@/lib/actions/pages';

// Theme functions - stubbed until implemented
const getThemeById = async (_id: string) => ({ id: 'default', name: 'Default' });
const dbCreateTheme = async (_data: unknown) => ({ id: 'default', name: 'Default' });

// Create page stub - needs server action implementation
const dbCreatePage = async (input: { slug: string; title: string; content: unknown; status: string }) => ({
  id: crypto.randomUUID(),
  slug: input.slug,
  title: input.title,
  content: input.content,
  status: input.status,
  updatedAt: new Date().toISOString(),
});

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: unknown;
  status?: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface ThemeData {
  id: string;
  name: string;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
}

interface CreatePageInput {
  slug: string;
  title: string;
  content: unknown;
  status: string;
}

interface EditorState {
  pages: PageData[];
  currentPage: PageData | null;
  currentTheme: ThemeData;
  aiMessages: AIMessage[];
  isAiGenerating: boolean;
  setCurrentPage: (page: PageData | null) => void;
  setTheme: (theme: ThemeData) => void;
  addAiMessage: (message: AIMessage) => void;
  setAiGenerating: (generating: boolean) => void;
  clearAiMessages: () => void;
  loadPages: () => Promise<void>;
  createPage: (input: CreatePageInput) => Promise<PageData>;
  deletePage: (slug: string) => Promise<void>;
}

export const useEditorStore = create<EditorState>((set) => ({
  pages: [],
  currentPage: null,
  currentTheme: { id: 'default', name: 'Default' },
  aiMessages: [],
  isAiGenerating: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setTheme: (theme) => set({ currentTheme: theme }),
  addAiMessage: (message) => set((state) => ({ 
    aiMessages: [...state.aiMessages, message] 
  })),
  setAiGenerating: (generating) => set({ isAiGenerating: generating }),
  clearAiMessages: () => set({ aiMessages: [] }),
  loadPages: async () => {
    try {
      const page = await getPageBySlug('home');
      set({ pages: page ? [page as unknown as PageData] : [] });
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  },
  createPage: async (input: CreatePageInput) => {
    try {
      const newPage = await dbCreatePage(input);
      set((state) => ({ pages: [...state.pages, newPage] }));
      return newPage;
    } catch (error) {
      console.error('Failed to create page:', error);
      throw error;
    }
  },
  deletePage: async (slug: string) => {
    try {
      await dbDeletePage(slug);
      set((state) => ({ 
        pages: state.pages.filter(page => page.slug !== slug) 
      }));
    } catch (error) {
      console.error('Failed to delete page:', error);
      throw error;
    }
  },
}));