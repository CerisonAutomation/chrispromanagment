/**
 * Media Asset Pipeline - Complete asset management system
 * Million-Times-Better Architecture
 */

import { Result } from '@/lib/types-index';

// ============================================================================
// TYPES
// ============================================================================

export interface Asset {
  id: string;
  filename: string;
  originalUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  folder?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  usageCount: number;
}

export interface AssetVariant {
  id: string;
  assetId: string;
  url: string;
  width: number;
  height: number;
  format: 'webp' | 'avif' | 'jpg' | 'png';
  size: number;
}

export interface AssetFolder {
  id: string;
  name: string;
  parentId?: string;
  assetCount: number;
  createdAt: Date;
}

export interface AssetUploadOptions {
  file: File;
  folder?: string;
  altText?: string;
  tags?: string[];
  generateVariants?: boolean;
  onProgress?: (progress: number) => void;
}

export interface AssetProcessingOptions {
  webp: boolean;
  avif: boolean;
  responsiveSizes: number[];
  quality: number;
  lazyBlur: boolean;
}

export interface AssetSearchOptions {
  query?: string;
  folder?: string;
  tags?: string[];
  mimeTypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: 'name' | 'date' | 'size';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PresignedUpload {
  uploadUrl: string;
  assetId: string;
  fields: Record<string, string>;
  expiresAt: Date;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PROCESSING_OPTIONS: AssetProcessingOptions = {
  webp: true,
  avif: true,
  responsiveSizes: [320, 640, 960, 1280, 1920],
  quality: 85,
  lazyBlur: true,
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateAssetId(): string {
  return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function getMimeCategory(mimeType: string): 'image' | 'video' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'document';
  return 'other';
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function isValidFileType(mimeType: string): boolean {
  return [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_DOCUMENT_TYPES,
  ].includes(mimeType);
}

// ============================================================================
// MAIN PIPELINE CLASS
// ============================================================================

export class MediaAssetPipeline {
  private baseUrl: string;
  private processingOptions: AssetProcessingOptions;
  private cache: Map<string, Asset> = new Map();
  private folders: Map<string, AssetFolder> = new Map();

  constructor(baseUrl: string = '/api/media', options?: Partial<AssetProcessingOptions>) {
    this.baseUrl = baseUrl;
    this.processingOptions = { ...DEFAULT_PROCESSING_OPTIONS, ...options };
  }

  // ========================================================================
  // UPLOAD METHODS
  // ========================================================================

  /**
   * Get presigned URL for direct upload (S3/R2)
   */
  async getPresignedUpload(
    filename: string,
    mimeType: string
  ): Promise<Result<PresignedUpload, Error>> {
    try {
      if (!isValidFileType(mimeType)) {
        return Result.err(new Error(`Invalid file type: ${mimeType}`));
      }

      const response = await fetch(`${this.baseUrl}/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, mimeType }),
      });

      if (!response.ok) {
        return Result.err(new Error(`Failed to get presigned URL: ${response.statusText}`));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(options: AssetUploadOptions): Promise<Result<Asset, Error>> {
    const { file, folder, altText, tags, onProgress } = options;

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return Result.err(new Error(`File too large. Max size: ${formatFileSize(MAX_FILE_SIZE)}`));
    }

    if (!isValidFileType(file.type)) {
      return Result.err(new Error(`Invalid file type: ${file.type}`));
    }

    try {
      // Get presigned URL
      const presignedResult = await this.getPresignedUpload(file.name, file.type);
      if (presignedResult.isErr()) {
        return Result.err(presignedResult.err);
      }

      const { uploadUrl, assetId, fields } = presignedResult.ok;

      // Upload to storage
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        return Result.err(new Error(`Upload failed: ${uploadResponse.statusText}`));
      }

      // Create asset record
      const asset: Asset = {
        id: assetId,
        filename: file.name,
        originalUrl: `${this.baseUrl}/download/${assetId}`,
        mimeType: file.type,
        size: file.size,
        altText,
        folder,
        tags: tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user', // Would come from auth
        usageCount: 0,
      };

      // Get image dimensions if image
      if (getFileCategory(file.type) === 'image') {
        const dimensions = await this.getImageDimensions(file);
        asset.width = dimensions.width;
        asset.height = dimensions.height;
      }

      // Cache locally
      this.cache.set(asset.id, asset);

      // Trigger processing
      if (this.processingOptions.webp || this.processingOptions.avif) {
        this.processAsset(asset.id);
      }

      return Result.ok(asset);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Upload failed'));
    }
  }

  /**
   * Chunked upload for large files
   */
  async chunkedUpload(
    file: File,
    options: Omit<AssetUploadOptions, 'file'>
  ): Promise<Result<Asset, Error>> {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    const assetId = generateAssetId();
    let uploadedSize = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('assetId', assetId);
      formData.append('chunkIndex', String(chunkIndex));
      formData.append('totalChunks', String(totalChunks));

      const response = await fetch(`${this.baseUrl}/chunk`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return Result.err(new Error(`Chunk ${chunkIndex} upload failed`));
      }

      uploadedSize += chunk.size;
      options.onProgress?.(Math.round((uploadedSize / file.size) * 100));
    }

    // Finalize upload
    const finalizeResult = await this.finalizeChunkedUpload(assetId, file.name, file.type);
    return finalizeResult;
  }

  private async finalizeChunkedUpload(
    assetId: string,
    filename: string,
    mimeType: string
  ): Promise<Result<Asset, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, filename, mimeType }),
      });

      if (!response.ok) {
        return Result.err(new Error('Finalization failed'));
      }

      const asset = await response.json();
      this.cache.set(asset.id, asset);
      return Result.ok(asset);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Finalization failed'));
    }
  }

  // ========================================================================
  // PROCESSING METHODS
  // ========================================================================

  /**
   * Process asset (generate variants, optimize)
   */
  async processAsset(assetId: string): Promise<Result<AssetVariant[], Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          options: this.processingOptions,
        }),
      });

      if (!response.ok) {
        return Result.err(new Error('Processing failed'));
      }

      const variants = await response.json();
      return Result.ok(variants);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Processing failed'));
    }
  }

  /**
   * Batch process multiple assets
   */
  async batchProcess(assetIds: string[]): Promise<Result<AssetVariant[], Error>> {
    const results = await Promise.allSettled(
      assetIds.map(id => this.processAsset(id))
    );

    const variants: AssetVariant[] = [];
    const errors: Error[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.isOk()) {
        variants.push(...result.value.ok());
      } else if (result.status === 'rejected') {
        errors.push(new Error(`Failed to process ${assetIds[index]}`));
      }
    });

    if (errors.length > 0 && variants.length === 0) {
      return Result.err(errors[0]);
    }

    return Result.ok(variants);
  }

  // ========================================================================
  // RETRIEVAL METHODS
  // ========================================================================

  /**
   * Get asset by ID
   */
  async getAsset(assetId: string): Promise<Result<Asset, Error>> {
    // Check cache first
    if (this.cache.has(assetId)) {
      return Result.ok(this.cache.get(assetId)!);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${assetId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return Result.err(new Error('Asset not found'));
        }
        return Result.err(new Error('Failed to fetch asset'));
      }

      const asset = await response.json();
      this.cache.set(assetId, asset);
      return Result.ok(asset);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to fetch asset'));
    }
  }

  /**
   * Get responsive image URL for specific width
   */
  getResponsiveUrl(assetId: string, width: number, format: 'webp' | 'avif' | 'jpg' = 'webp'): string {
    return `${this.baseUrl}/download/${assetId}?w=${width}&fmt=${format}`;
  }

  /**
   * Get srcset for responsive images
   */
  getSrcSet(assetId: string): string {
    return this.processingOptions.responsiveSizes
      .map(size => `${this.getResponsiveUrl(assetId, size)} ${size}w`)
      .join(', ');
  }

  /**
   * Get blur placeholder (LQIP)
   */
  async getBlurPlaceholder(assetId: string): Promise<Result<string, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/${assetId}/blur`);
      
      if (!response.ok) {
        return Result.err(new Error('Failed to get blur placeholder'));
      }

      const data = await response.json();
      return Result.ok(data.blurDataUrl);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to get blur'));
    }
  }

  // ========================================================================
  // SEARCH & FILTER
  // ========================================================================

  /**
   * Search assets with filters
   */
  async searchAssets(options: AssetSearchOptions): Promise<Result<{ assets: Asset[]; total: number }, Error>> {
    try {
      const params = new URLSearchParams({
        page: String(options.page),
        limit: String(options.limit),
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
      });

      if (options.query) params.set('q', options.query);
      if (options.folder) params.set('folder', options.folder);
      if (options.tags?.length) params.set('tags', options.tags.join(','));
      if (options.mimeTypes?.length) params.set('mimeTypes', options.mimeTypes.join(','));

      const response = await fetch(`${this.baseUrl}/search?${params}`);

      if (!response.ok) {
        return Result.err(new Error('Search failed'));
      }

      const data = await response.json();
      return Result.ok(data);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Search failed'));
    }
  }

  /**
   * Get assets by folder
   */
  async getFolderAssets(folderId: string, page = 1, limit = 20): Promise<Result<Asset[], Error>> {
    return this.searchAssets({
      folder: folderId,
      page,
      limit,
      sortBy: 'date',
      sortOrder: 'desc',
    }).then(result => result.map(data => data.assets));
  }

  // ========================================================================
  // MANAGEMENT METHODS
  // ========================================================================

  /**
   * Update asset metadata
   */
  async updateAsset(
    assetId: string,
    updates: Partial<Pick<Asset, 'altText' | 'caption' | 'folder' | 'tags'>>
  ): Promise<Result<Asset, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        return Result.err(new Error('Update failed'));
      }

      const asset = await response.json();
      this.cache.set(assetId, asset);
      return Result.ok(asset);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Update failed'));
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId: string): Promise<Result<void, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        return Result.err(new Error('Delete failed'));
      }

      this.cache.delete(assetId);
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Delete failed'));
    }
  }

  /**
   * Bulk delete assets
   */
  async bulkDelete(assetIds: string[]): Promise<Result<number, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds }),
      });

      if (!response.ok) {
        return Result.err(new Error('Bulk delete failed'));
      }

      const data = await response.json();
      assetIds.forEach(id => this.cache.delete(id));
      return Result.ok(data.deletedCount);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Bulk delete failed'));
    }
  }

  // ========================================================================
  // FOLDER MANAGEMENT
  // ========================================================================

  /**
   * Create folder
   */
  async createFolder(name: string, parentId?: string): Promise<Result<AssetFolder, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId }),
      });

      if (!response.ok) {
        return Result.err(new Error('Failed to create folder'));
      }

      const folder = await response.json();
      this.folders.set(folder.id, folder);
      return Result.ok(folder);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to create folder'));
    }
  }

  /**
   * Get folder tree
   */
  async getFolderTree(): Promise<Result<AssetFolder[], Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/folders/tree`);

      if (!response.ok) {
        return Result.err(new Error('Failed to get folder tree'));
      }

      const folders = await response.json();
      return Result.ok(folders);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to get folder tree'));
    }
  }

  /**
   * Delete folder
   */
  async deleteFolder(folderId: string, moveAssetsTo?: string): Promise<Result<void, Error>> {
    try {
      const response = await fetch(`${this.baseUrl}/folders/${folderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moveAssetsTo }),
      });

      if (!response.ok) {
        return Result.err(new Error('Failed to delete folder'));
      }

      this.folders.delete(folderId);
      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to delete folder'));
    }
  }

  // ========================================================================
  // USAGE TRACKING
  // ========================================================================

  /**
   * Track asset usage (where it's being used)
   */
  async trackUsage(assetId: string, location: string): Promise<Result<void, Error>> {
    try {
      // Update usage count locally for quick access
      const asset = this.cache.get(assetId);
      if (asset) {
        asset.usageCount++;
      }

      // Fire and forget - don't block UI
      fetch(`${this.baseUrl}/${assetId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      }).catch(() => {});

      return Result.ok(undefined);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Tracking failed'));
    }
  }

  /**
   * Find unused assets
   */
  async findUnusedAssets(olderThanDays: number = 30): Promise<Result<Asset[], Error>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const response = await fetch(`${this.baseUrl}/unused?olderThan=${cutoffDate.toISOString()}`);

      if (!response.ok) {
        return Result.err(new Error('Failed to find unused assets'));
      }

      const assets = await response.json();
      return Result.ok(assets);
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Failed to find unused assets'));
    }
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; hits: number } {
    return {
      size: this.cache.size,
      hits: 0, // Could add hit tracking
    };
  }
}

// ============================================================================
// REACT HOOK
// ============================================================================

let pipelineInstance: MediaAssetPipeline | null = null;

export function getMediaPipeline(): MediaAssetPipeline {
  if (!pipelineInstance) {
    pipelineInstance = new MediaAssetPipeline();
  }
  return pipelineInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const MediaAssetPipelineConfig = {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  DEFAULT_PROCESSING_OPTIONS,
};

export default MediaAssetPipeline;