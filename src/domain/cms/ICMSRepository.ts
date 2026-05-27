/**
 * CMS Repository Interface
 * Defines contract for CMS and content management data access operations
 */

import { IRepository, PaginationOptions, PaginatedResult } from '@/core/repository-pattern';
import {
  CMSContent,
  CMSBlock,
  CMSMedia,
  CMSSettings,
  CMSTag,
  CMSContentFilter,
} from './models';

/**
 * Extended repository interface for CMS-specific operations
 */
export interface ICMSRepository extends IRepository<CMSContent, string> {
  // Content operations
  findBySlug(slug: string): Promise<CMSContent | null>;
  findByType(type: string): Promise<CMSContent[]>;
  findByFilter(filter: CMSContentFilter): Promise<CMSContent[]>;
  searchContent(searchTerm: string, filter?: CMSContentFilter): Promise<CMSContent[]>;
  paginateByFilter(options: PaginationOptions, filter: CMSContentFilter): Promise<PaginatedResult<CMSContent>>;
  publishContent(id: string): Promise<CMSContent>;
  archiveContent(id: string): Promise<CMSContent>;
  scheduleContent(id: string, publishAt: string): Promise<CMSContent>;
  
  // Tag operations
  addTagToContent(contentId: string, tagId: string): Promise<void>;
  removeTagFromContent(contentId: string, tagId: string): Promise<void>;
  getContentTags(contentId: string): Promise<CMSTag[]>;
  getAllTags(): Promise<CMSTag[]>;
  
  // Block operations
  findBlocks(parentId?: string): Promise<CMSBlock[]>;
  findBlockById(id: string): Promise<CMSBlock | null>;
  createBlock(block: Omit<CMSBlock, 'id' | 'createdAt' | 'updatedAt'>): Promise<CMSBlock>;
  updateBlock(id: string, updates: Partial<CMSBlock>): Promise<CMSBlock>;
  deleteBlock(id: string): Promise<boolean>;
  reorderBlocks(parentId: string, blockOrder: string[]): Promise<void>;
  
  // Media operations
  findMedia(filter?: { mimeType?: string; uploadedBy?: string }): Promise<CMSMedia[]>;
  findMediaById(id: string): Promise<CMSMedia | null>;
  uploadMedia(file: File, metadata?: Record<string, unknown>): Promise<CMSMedia>;
  deleteMedia(id: string): Promise<boolean>;
  
  // Settings operations
  getSetting(key: string): Promise<CMSSettings | null>;
  setSetting(key: string, value: string, type?: 'string' | 'number' | 'boolean' | 'json'): Promise<CMSSettings>;
  getAllSettings(): Promise<CMSSettings[]>;
  deleteSetting(key: string): Promise<boolean>;
  
  // Version/History operations
  getContentHistory(contentId: string): Promise<CMSContent[]>;
  restoreContent(contentId: string, versionId: string): Promise<CMSContent>;
}
