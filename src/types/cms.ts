// =============================================================================
// CMS DOMAIN TYPES
// Page management, versions, drafts, themes.
// =============================================================================
import type { PuckData } from './puck';

export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SyncStatus = 'synced' | 'pending' | 'error';

export interface PageData {
  id?: string;
  slug: string;
  title: string;
  status: PageStatus;
  content: PuckData | null;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  data: PuckData;
  title: string;
  createdAt: number;
  description?: string;
}

export interface LocalDraft {
  pageId: string;
  slug: string;
  data: PuckData;
  title: string;
  lastModified: number;
  syncStatus: SyncStatus;
}

// ─── Theme Types ──────────────────────────────────────────────────────────────

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  card: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
}

export interface ThemeData {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

// ─── Page List ────────────────────────────────────────────────────────────────

export interface PageListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  updatedAt: string;
}
