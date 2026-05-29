// =============================================================================
// SUPABASE PAGE REPOSITORY - CQRS Implementation
// =============================================================================
import type { Page, PageId, Slug, Result, Timestamp } from '@/types';
import { ok, err, AppError } from '@/types';
import type { PageRepository } from './interfaces';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Supabase implementation of PageRepository
 * Handles all data access for Pages aggregate
 */
export class SupabasePageRepository implements PageRepository {
  private supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

  // ─── Queries (Read Operations) ────────────────────────────────

  async findById(id: PageId): Promise<Result<Page, Error>> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        .select('*')
        .eq('id', id as string)
        .single();

      if (error) {
        return err(new AppError('NOT_FOUND', `Page with id ${id} not found`, 404));
      }

      return ok(this.mapToDomain(data));
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to fetch page by id', 500, error));
    }
  }

  async findBySlug(slug: Slug): Promise<Result<Page | null, Error>> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return ok(null); // No rows returned
        }
        return err(new AppError('INTERNAL_ERROR', error.message, 500));
      }

      return ok(this.mapToDomain(data));
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to fetch page by slug', 500, error));
    }
  }

  async findAll(): Promise<Result<Page[], Error>> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        return err(new AppError('INTERNAL_ERROR', error.message, 500));
      }

      return ok(data.map(this.mapToDomain));
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to fetch all pages', 500, error));
    }
  }

  async findPublished(): Promise<Result<Page[], Error>> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        .select('*')
        .eq('published', true)
        .order('updated_at', { ascending: false });

      if (error) {
        return err(new AppError('INTERNAL_ERROR', error.message, 500));
      }

      return ok(data.map(this.mapToDomain));
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to fetch published pages', 500, error));
    }
  }

  async findByStatus(status: Page['status']): Promise<Result<Page[], Error>> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        .select('*')
        .eq('published', status === 'published')
        .order('updated_at', { ascending: false });

      if (error) {
        return err(new AppError('INTERNAL_ERROR', error.message, 500));
      }

      return ok(data.map(this.mapToDomain));
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to fetch pages by status', 500, error));
    }
  }

  // ─── Commands (Write Operations) ────────────────────────────────

  async save(page: Page): Promise<Result<Page, Error>> {
    try {
      const { data, error } = await this.supabase
        .from('cms_pages')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert({
          id: page.id as string,
          slug: page.slug as string,
          title: page.title,
          data: JSON.stringify(page.data),
          published: page.status === 'published',
          updated_at: new Date(page.updatedAt).toISOString(),
        } as any)
        .select()
        .single();

      if (error) {
        return err(new AppError('CONFLICT', error.message, 409));
      }

      return ok(this.mapToDomain(data));
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to save page', 500, error));
    }
  }

  async delete(id: PageId): Promise<Result<void, Error>> {
    try {
      const { error } = await this.supabase
        .from('cms_pages')
        .delete()
        .eq('id', id as string);

      if (error) {
        return err(new AppError('INTERNAL_ERROR', error.message, 500));
      }

      return ok(undefined);
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to delete page', 500, error));
    }
  }

  async publish(id: PageId): Promise<Result<Page, Error>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = this.supabase as any;
      const { data, error } = await sb
        .from('cms_pages')
        .update({ published: true, updated_at: new Date().toISOString() })
        .eq('id', id as string)
        .select()
        .single();

      if (error) {
        return err(new AppError('INTERNAL_ERROR', error.message, 500));
      }

      return ok(this.mapToDomain(data));
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to publish page', 500, error));
    }
  }

  async unpublish(id: PageId): Promise<Result<Page, Error>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = this.supabase as any;
      const { data, error } = await sb
        .from('cms_pages')
        .update({ published: false, updated_at: new Date().toISOString() })
        .eq('id', id as string)
        .select()
        .single();

      if (error) {
        return err(new AppError('INTERNAL_ERROR', error.message, 500));
      }

      return ok(this.mapToDomain(data));
    } catch (error) {
      return err(new AppError('INTERNAL_ERROR', 'Failed to unpublish page', 500, error));
    }
  }

  // ─── Private Helpers ────────────────────────────────────────────

  private mapToDomain(data: any): Page {
    return {
      id: data.id as PageId,
      slug: data.slug as Slug,
      title: data.title,
      data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data,
      status: data.published ? 'published' : 'draft',
      createdAt: new Date(data.created_at).getTime() as Timestamp,
      updatedAt: new Date(data.updated_at ?? data.created_at).getTime() as Timestamp,
    };
  }
}
