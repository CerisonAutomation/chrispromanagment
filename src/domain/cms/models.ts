/**
 * CMS Domain Models
 * Type-safe domain entities for CMS and content management operations
 */

export interface CMSContent {
  id: string;
  type: CMSContentType;
  title: string;
  slug: string;
  content: string;
  metadata?: Record<string, unknown>;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  status: CMSStatus;
}

export type CMSContentType = 'page' | 'post' | 'block' | 'component' | 'template';
export type CMSStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface CMSContentFilter {
  type?: CMSContentType;
  status?: CMSStatus;
  search?: string;
  createdBy?: string;
  dateFrom?: string;
  dateTo?: string;
  tag?: string;
}

export interface CMSBlock {
  id: string;
  type: string;
  name: string;
  content: Record<string, unknown>;
  config?: Record<string, unknown>;
  styles?: Record<string, unknown>;
  position: number;
  parentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CMSMedia {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  metadata?: Record<string, unknown>;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface CMSSettings {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  updatedAt?: string;
}

export interface CMSTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  count: number;
}

export interface CMSContentCreateInput {
  type: CMSContentType;
  title: string;
  slug?: string;
  content: string;
  metadata?: Record<string, unknown>;
  status?: CMSStatus;
  publishedAt?: string;
  tags?: string[];
}

export interface CMSContentUpdateInput {
  title?: string;
  slug?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  status?: CMSStatus;
  publishedAt?: string;
  tags?: string[];
}
