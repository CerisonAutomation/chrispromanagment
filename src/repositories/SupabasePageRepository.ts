// =============================================================================
// SUPABASE PAGE REPOSITORY - CQRS Implementation
// =============================================================================
import type { Page, PageId, Slug, Result } from '@/types';
import { ok, err, AppError } from '@/types';
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
        .eq('id', id)
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
        .eq('status', status)
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
        .upsert({
          id: page.id,
          slug: page.slug,
          title: page.title,
          data: JSON.stringify(page.data),
          status: page.status,
          updated_at: new Date(page.updatedAt).toISOString(),
        })
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
        .eq('id', id);

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
      const { data, error } = await this.supabase
        .from('cms_pages')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
      const { data, error } = await this.supabase
        .from('cms_pages')
        .update({ 
          status: 'draft',
          published_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
      data: JSON.parse(data.data),
      status: data.status,
      createdAt: new Date(data.created_at).getTime() as Timestamp,
      updatedAt: new Date(data.updated_at).getTime() as Timestamp,
    };
  }
}
