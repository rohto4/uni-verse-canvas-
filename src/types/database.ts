/**
 * Re-export generated Database type
 * This file now serves as a single source of truth for all database types
 */
export type { Database } from './database.generated'
import type { Database } from './database.generated'

// Extract table row types from Database
export type Post = Database['public']['Tables']['posts']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type InProgress = Database['public']['Tables']['in_progress']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Page = Database['public']['Tables']['pages']['Row']

// Helper types with relations
export interface PostWithTags extends Post {
  tags: Tag[]
}

export interface PostWithRelations extends Post {
  tags: Tag[]
  relatedPosts: Post[]
  relatedProjects: Project[]
}

export interface ProjectWithTags extends Project {
  tags: Tag[]
}

export interface InProgressWithProject extends InProgress {
  completedProject?: Project
}

export interface TagWithCount extends Tag {
  postCount: number
  projectCount: number
}
