import type { JSONContent } from '@tiptap/core'

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      in_progress: {
        Row: InProgress
        Insert: Omit<InProgress, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InProgress, 'id' | 'created_at'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'>
        Update: Partial<Omit<Tag, 'id' | 'created_at'>>
      }
      pages: {
        Row: Page
        Insert: Omit<Page, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Page, 'created_at'>>
      }
      post_tags: {
        Row: { post_id: string; tag_id: string }
        Insert: { post_id: string; tag_id: string }
        Update: never
      }
      project_tags: {
        Row: { project_id: string; tag_id: string }
        Insert: { project_id: string; tag_id: string }
        Update: never
      }
      post_links: {
        Row: { from_post_id: string; to_post_id: string; link_type: string }
        Insert: { from_post_id: string; to_post_id: string; link_type?: string }
        Update: never
      }
      post_project_links: {
        Row: { post_id: string; project_id: string }
        Insert: { post_id: string; project_id: string }
        Update: never
      }
    }
  }
}

export interface Post {
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

export interface PostWithTags extends Post {
  tags: Tag[]
}

export interface PostWithRelations extends Post {
  tags: Tag[]
  relatedPosts: Post[]
  relatedProjects: Project[]
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  content: JSONContent | null
  demo_url: string | null
  github_url: string | null
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

export interface ProjectWithTags extends Project {
  tags: Tag[]
}

export interface InProgress {
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

export interface InProgressWithProject extends InProgress {
  completedProject?: Project
}

export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  created_at: string
}

export interface TagWithCount extends Tag {
  postCount: number
  projectCount: number
}

export interface Page {
  page_type: 'home' | 'about' | 'links'
  title: string
  content: JSONContent
  metadata: JSONContent
  created_at: string
  updated_at: string
}
