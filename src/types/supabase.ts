/**
 * Auto-generated Supabase types.
 * Regenerate with: npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      cms_pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          data: string;
          theme: string;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          data: string;
          theme?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          data?: string;
          theme?: string;
          published?: boolean;
          updated_at?: string;
        };
      };
      cms_page_versions: {
        Row: {
          id: string;
          page_id: string;
          data: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          page_id: string;
          data: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          page_id?: string;
          data?: string;
          created_by?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
