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
      guesty_listings_cache: {
        Row: {
          id: string;
          listing_id: string;
          data: Json;
          synced_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          data: Json;
          synced_at?: string;
        };
        Update: {
          listing_id?: string;
          data?: Json;
          synced_at?: string;
        };
      };
      guesty_reservations: {
        Row: {
          id: string;
          reservation_id: string;
          listing_id: string;
          guest_name: string;
          check_in: string;
          check_out: string;
          status: string;
          data: Json;
          synced_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          listing_id: string;
          guest_name: string;
          check_in: string;
          check_out: string;
          status: string;
          data: Json;
          synced_at?: string;
        };
        Update: {
          reservation_id?: string;
          listing_id?: string;
          guest_name?: string;
          check_in?: string;
          check_out?: string;
          status?: string;
          data?: Json;
          synced_at?: string;
        };
      };
      guesty_guests: {
        Row: {
          id: string;
          guest_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          data: Json;
          synced_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          data: Json;
          synced_at?: string;
        };
        Update: {
          guest_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          data?: Json;
          synced_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
