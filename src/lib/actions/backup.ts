'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function exportData() {
  const supabase = await createServerClient()
  
  const [
    { data: posts },
    { data: projects },
    { data: inProgress },
    { data: tags },
    { data: postTags },
    { data: projectTags },
    { data: postLinks },
    { data: postProjectLinks },
    { data: pages }
  ] = await Promise.all([
    supabase.from('posts').select('*'),
    supabase.from('projects').select('*'),
    supabase.from('in_progress').select('*'),
    supabase.from('tags').select('*'),
    supabase.from('post_tags').select('*'),
    supabase.from('project_tags').select('*'),
    supabase.from('post_links').select('*'),
    supabase.from('post_project_links').select('*'),
    supabase.from('pages').select('*')
  ])

  const exportObj = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      posts: posts || [],
      projects: projects || [],
      in_progress: inProgress || [],
      tags: tags || [],
      post_tags: postTags || [],
      project_tags: projectTags || [],
      post_links: postLinks || [],
      post_project_links: postProjectLinks || [],
      pages: pages || []
    }
  }

  return exportObj
}

import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']

interface BackupData {
  version: string
  exportedAt: string
  data: {
    tags?: Tables['tags']['Insert'][]
    posts?: Tables['posts']['Insert'][]
    projects?: Tables['projects']['Insert'][]
    in_progress?: Tables['in_progress']['Insert'][]
    pages?: Tables['pages']['Insert'][]
    post_tags?: Tables['post_tags']['Insert'][]
    project_tags?: Tables['project_tags']['Insert'][]
    post_links?: Tables['post_links']['Insert'][]
    post_project_links?: Tables['post_project_links']['Insert'][]
  }
}

export async function importData(jsonData: BackupData) {
  const supabase = await createServerClient()
  const { data } = jsonData

  if (!data) throw new Error('Invalid backup data')

  try {
    // Note: This is a simple import that might conflict with existing IDs.
    // In a real scenario, we might want to UPSERT or clear existing data.
    
    // For this implementation, we use UPSERT based on ID.
    if (data.tags?.length) await supabase.from('tags').upsert(data.tags)
    if (data.posts?.length) await supabase.from('posts').upsert(data.posts)
    if (data.projects?.length) await supabase.from('projects').upsert(data.projects)
    if (data.in_progress?.length) await supabase.from('in_progress').upsert(data.in_progress)
    if (data.pages?.length) await supabase.from('pages').upsert(data.pages)
    if (data.post_tags?.length) await supabase.from('post_tags').upsert(data.post_tags)
    if (data.project_tags?.length) await supabase.from('project_tags').upsert(data.project_tags)
    if (data.post_links?.length) await supabase.from('post_links').upsert(data.post_links)
    if (data.post_project_links?.length) await supabase.from('post_project_links').upsert(data.post_project_links)

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Import error:', error)
    return { success: false, error: errorMessage }
  }
}
