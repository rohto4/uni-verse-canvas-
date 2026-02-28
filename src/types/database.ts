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
      admins: {
        Row: {
          created_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      in_progress: {
        Row: {
          completed_at: string | null
          completed_project_id: string | null
          created_at: string | null
          description: string
          id: string
          notes: string | null
          progress_rate: number | null
          started_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_project_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          progress_rate?: number | null
          started_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_project_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          progress_rate?: number | null
          started_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "in_progress_completed_project_id_fkey"
            columns: ["completed_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: Json
          created_at: string | null
          metadata: Json | null
          page_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          metadata?: Json | null
          page_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          metadata?: Json | null
          page_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      post_links: {
        Row: {
          from_post_id: string
          link_type: string | null
          to_post_id: string
        }
        Insert: {
          from_post_id: string
          link_type?: string | null
          to_post_id: string
        }
        Update: {
          from_post_id?: string
          link_type?: string | null
          to_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_links_from_post_id_fkey"
            columns: ["from_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_links_to_post_id_fkey"
            columns: ["to_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_project_links: {
        Row: {
          post_id: string
          project_id: string
        }
        Insert: {
          post_id: string
          project_id: string
        }
        Update: {
          post_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_project_links_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_project_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: Json
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          ogp_image: string | null
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          content: Json
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          ogp_image?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          content?: Json
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          ogp_image?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          content: Json | null
          cover_image: string | null
          created_at: string | null
          demo_url: string | null
          description: string
          end_date: string | null
          gallery_images: string[] | null
          github_url: string | null
          id: string
          public_link_type: string | null
          public_link_url: string | null
          slug: string
          start_date: string | null
          status: string | null
          steps_count: number | null
          tech_stack: Json | null
          title: string
          updated_at: string | null
          used_ai: Json | null
        }
        Insert: {
          content?: Json | null
          cover_image?: string | null
          created_at?: string | null
          demo_url?: string | null
          description: string
          end_date?: string | null
          gallery_images?: string[] | null
          github_url?: string | null
          id?: string
          public_link_type?: string | null
          public_link_url?: string | null
          slug: string
          start_date?: string | null
          status?: string | null
          steps_count?: number | null
          tech_stack?: Json | null
          title: string
          updated_at?: string | null
          used_ai?: Json | null
        }
        Update: {
          content?: Json | null
          cover_image?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string
          end_date?: string | null
          gallery_images?: string[] | null
          github_url?: string | null
          id?: string
          public_link_type?: string | null
          public_link_url?: string | null
          slug?: string
          start_date?: string | null
          status?: string | null
          steps_count?: number | null
          tech_stack?: Json | null
          title?: string
          updated_at?: string | null
          used_ai?: Json | null
        }
        Relationships: []
      }
      qiita_cache: {
        Row: {
          cached_at: string | null
          likes_count: number | null
          published_at: string | null
          qiita_id: string
          title: string
          url: string
        }
        Insert: {
          cached_at?: string | null
          likes_count?: number | null
          published_at?: string | null
          qiita_id: string
          title: string
          url: string
        }
        Update: {
          cached_at?: string | null
          likes_count?: number | null
          published_at?: string | null
          qiita_id?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
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

// ─── Convenience type aliases ────────────────────────────────────────────────
// Row types for each table
export type Post = Tables<'posts'>
export type Project = Tables<'projects'>
export type Tag = Tables<'tags'>
export type InProgress = Tables<'in_progress'>
export type Page = Tables<'pages'>
export type Admin = Tables<'admins'>

// Join types used across the app
export type PostWithTags = Post & {
  tags: Tag[]
}

export type ProjectWithTags = Project & {
  tags: Tag[]
}

export type TagWithCount = Tag & {
  postCount: number
  projectCount?: number
}

export type InProgressWithProject = InProgress & {
  project?: Project | null
  completedProject?: Project | null
}
