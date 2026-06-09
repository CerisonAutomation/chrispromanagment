export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cms_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_visible: boolean
          section_key: string
          section_label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          section_key: string
          section_label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          section_key?: string
          section_label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cms_images: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          image_key: string
          section_key: string | null
          url: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          image_key: string
          section_key?: string | null
          url: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          image_key?: string
          section_key?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_images_section_key_fkey"
            columns: ["section_key"]
            isOneToOne: false
            referencedRelation: "cms_content"
            referencedColumns: ["section_key"]
          },
        ]
      }
      cms_page_seo: {
        Row: {
          canonical_url: string | null
          created_at: string
          id: string
          json_ld: Json | null
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          og_type: string | null
          page_slug: string
          robots: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          json_ld?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          og_type?: string | null
          page_slug: string
          robots?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          json_ld?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          og_type?: string | null
          page_slug?: string
          robots?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_settings: {
        Row: {
          created_at: string
          id: string
          setting_group: string
          setting_key: string
          setting_label: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_group?: string
          setting_key: string
          setting_label?: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_group?: string
          setting_key?: string
          setting_label?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      cms_sync_log: {
        Row: {
          action: string
          created_at: string
          id: string
          payload: Json | null
          source: string
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          payload?: Json | null
          source: string
          status?: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          payload?: Json | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      cms_versions: {
        Row: {
          content_count: number
          created_at: string
          created_by: string | null
          id: string
          image_count: number
          label: string
          note: string | null
          published_at: string | null
          setting_count: number
          snapshot: Json
          status: string
        }
        Insert: {
          content_count?: number
          created_at?: string
          created_by?: string | null
          id?: string
          image_count?: number
          label?: string
          note?: string | null
          published_at?: string | null
          setting_count?: number
          snapshot: Json
          status?: string
        }
        Update: {
          content_count?: number
          created_at?: string
          created_by?: string | null
          id?: string
          image_count?: number
          label?: string
          note?: string | null
          published_at?: string | null
          setting_count?: number
          snapshot?: Json
          status?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          phone: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: never
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: never
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: number
          max_uses: number | null
          usage_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: never
          max_uses?: number | null
          usage_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: never
          max_uses?: number | null
          usage_count?: number
        }
        Relationships: []
      }
      guesty_response_cache: {
        Row: {
          action: string
          cache_key: string
          fetched_at: string
          payload: Json
          status_code: number
        }
        Insert: {
          action: string
          cache_key: string
          fetched_at?: string
          payload: Json
          status_code?: number
        }
        Update: {
          action?: string
          cache_key?: string
          fetched_at?: string
          payload?: Json
          status_code?: number
        }
        Relationships: []
      }
      guesty_token_refresh_log: {
        Row: {
          created_at: string
          error: string | null
          expires_at: string | null
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          expires_at?: string | null
          id?: string
          status: string
        }
        Update: {
          created_at?: string
          error?: string | null
          expires_at?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      guesty_token_vault: {
        Row: {
          access_token: string
          expires_at: string
          id: number
          last_refreshed_at: string
          refresh_count: number
          scope: string | null
        }
        Insert: {
          access_token: string
          expires_at: string
          id?: number
          last_refreshed_at?: string
          refresh_count?: number
          scope?: string | null
        }
        Update: {
          access_token?: string
          expires_at?: string
          id?: number
          last_refreshed_at?: string
          refresh_count?: number
          scope?: string | null
        }
        Relationships: []
      }
      owner_inquiries: {
        Row: {
          additional_info: string | null
          bathrooms: string | null
          bedrooms: string | null
          created_at: string
          currently_listed: string | null
          email: string
          expected_revenue: string | null
          id: number
          location: string | null
          max_guests: string | null
          name: string
          phone: string | null
          property_type: string | null
          services_interested: string | null
          status: string
        }
        Insert: {
          additional_info?: string | null
          bathrooms?: string | null
          bedrooms?: string | null
          created_at?: string
          currently_listed?: string | null
          email: string
          expected_revenue?: string | null
          id?: never
          location?: string | null
          max_guests?: string | null
          name: string
          phone?: string | null
          property_type?: string | null
          services_interested?: string | null
          status?: string
        }
        Update: {
          additional_info?: string | null
          bathrooms?: string | null
          bedrooms?: string | null
          created_at?: string
          currently_listed?: string | null
          email?: string
          expected_revenue?: string | null
          id?: never
          location?: string | null
          max_guests?: string | null
          name?: string
          phone?: string | null
          property_type?: string | null
          services_interested?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_coupon: {
        Args: { _code: string }
        Returns: {
          code: string
          discount_type: string
          discount_value: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
