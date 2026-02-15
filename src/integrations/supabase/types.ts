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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cms_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          user_email: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          user_email?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_email?: string | null
        }
        Relationships: []
      }
      cms_components: {
        Row: {
          category: string
          created_at: string
          default_props: Json
          description: string | null
          id: string
          is_global: boolean | null
          name: string
          preview_image: string | null
          schema: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          default_props?: Json
          description?: string | null
          id?: string
          is_global?: boolean | null
          name: string
          preview_image?: string | null
          schema?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_props?: Json
          description?: string | null
          id?: string
          is_global?: boolean | null
          name?: string
          preview_image?: string | null
          schema?: Json
          updated_at?: string
        }
        Relationships: []
      }
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
      cms_media_albums: {
        Row: {
          album_type: string
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          album_type?: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          album_type?: string
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_media_items: {
        Row: {
          album_id: string | null
          alt_text: string | null
          caption: string | null
          created_at: string
          duration: number | null
          file_size: number | null
          height: number | null
          id: string
          media_type: string
          mime_type: string | null
          sort_order: number | null
          thumbnail_url: string | null
          url: string
          width: number | null
        }
        Insert: {
          album_id?: string | null
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          duration?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          media_type?: string
          mime_type?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          url: string
          width?: number | null
        }
        Update: {
          album_id?: string | null
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          duration?: number | null
          file_size?: number | null
          height?: number | null
          id?: string
          media_type?: string
          mime_type?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_media_items_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "cms_media_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          created_at: string
          description: string | null
          doc: Json
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          slug: string
          status: string
          template: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          doc?: Json
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          slug: string
          status?: string
          template?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          doc?: Json
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          template?: string | null
          title?: string
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
      cms_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          doc: Json
          id: string
          name: string
          thumbnail: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          doc?: Json
          id?: string
          name: string
          thumbnail?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          doc?: Json
          id?: string
          name?: string
          thumbnail?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
