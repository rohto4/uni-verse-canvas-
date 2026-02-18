/**
 * AUTO-GENERATED TYPE DEFINITIONS
 * Generated from: supabase/migrations/20260208000000_initial_schema.sql
 *
 * This file provides accurate Supabase Database types for proper type inference.
 */

import type { JSONContent } from '@tiptap/core'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: JSONContent
          excerpt: string | null
          status: 'draft' | 'scheduled' | 'published'
          published_at: string | null
          cover_image: string | null
          ogp_image: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: JSONContent
          excerpt?: string | null
          status?: 'draft' | 'scheduled' | 'published'
          published_at?: string | null
          cover_image?: string | null
          ogp_image?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: JSONContent
          excerpt?: string | null
          status?: 'draft' | 'scheduled' | 'published'
          published_at?: string | null
          cover_image?: string | null
          ogp_image?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          content: JSONContent | null
          demo_url: string | null
          github_url: string | null
          public_link_type: 'download' | 'website' | null
          public_link_url: string | null
          cover_image: string | null
          start_date: string | null
          end_date: string | null
          status: 'completed' | 'archived' | 'registered'
          steps_count: number | null
          used_ai: string[] | null
          gallery_images: string[] | null
          tech_stack: Record<string, number> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          content?: JSONContent | null
          demo_url?: string | null
          github_url?: string | null
          public_link_type?: 'download' | 'website' | null
          public_link_url?: string | null
          cover_image?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'completed' | 'archived' | 'registered'
          steps_count?: number | null
          used_ai?: string[] | null
          gallery_images?: string[] | null
          tech_stack?: Record<string, number> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          content?: JSONContent | null
          demo_url?: string | null
          github_url?: string | null
          public_link_type?: 'download' | 'website' | null
          public_link_url?: string | null
          cover_image?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'completed' | 'archived' | 'registered'
          steps_count?: number | null
          used_ai?: string[] | null
          gallery_images?: string[] | null
          tech_stack?: Record<string, number> | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      in_progress: {
        Row: {
          id: string
          title: string
          description: string
          status: 'not_started' | 'paused' | 'in_progress' | 'completed'
          progress_rate: number
          started_at: string | null
          completed_at: string | null
          completed_project_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
          progress_rate?: number
          started_at?: string | null
          completed_at?: string | null
          completed_project_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
          progress_rate?: number
          started_at?: string | null
          completed_at?: string | null
          completed_project_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_progress_completed_project_id_fkey"
            columns: ["completed_project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      pages: {
        Row: {
          page_type: 'home' | 'about' | 'links'
          title: string
          content: JSONContent
          metadata: JSONContent
          created_at: string
          updated_at: string
        }
        Insert: {
          page_type: 'home' | 'about' | 'links'
          title: string
          content: JSONContent
          metadata?: JSONContent
          created_at?: string
          updated_at?: string
        }
        Update: {
          page_type?: 'home' | 'about' | 'links'
          title?: string
          content?: JSONContent
          metadata?: JSONContent
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
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
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      post_links: {
        Row: {
          from_post_id: string
          to_post_id: string
          link_type: string
        }
        Insert: {
          from_post_id: string
          to_post_id: string
          link_type?: string
        }
        Update: {
          from_post_id?: string
          to_post_id?: string
          link_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_links_from_post_id_fkey"
            columns: ["from_post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_links_to_post_id_fkey"
            columns: ["to_post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
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
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_project_links_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
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
