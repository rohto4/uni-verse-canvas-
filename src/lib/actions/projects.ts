'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { ProjectWithTags, Project } from '@/types/database'
import type { JSONContent } from '@tiptap/core'

export interface GetProjectsParams {
  status?: 'completed' | 'archived'
  tags?: string[]
}

export interface CreateProjectInput {
  title: string
  slug: string
  description: string
  content: JSONContent | null
  demo_url: string | null
  github_url: string | null
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  status: 'completed' | 'archived'
  steps_count: number | null
  used_ai: string[] | null
  gallery_images: string[] | null
  tech_stack: Record<string, number> | null
  tags: string[]
}

export async function getProjects(params: GetProjectsParams = {}): Promise<ProjectWithTags[]> {
  const { status = 'completed', tags = [] } = params
  const supabase = createServerClient()

  let query = supabase
    .from('projects')
    .select(`
      *,
      tags:project_tags(
        tag:tags(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  // Tag filter (AND search)
  if (tags.length > 0) {
    const tagSlugs = tags.map(t => t.toLowerCase())

    const { data: tagData } = await supabase
      .from('tags')
      .select('id, slug')
      .in('slug', tagSlugs)

    if (tagData && tagData.length > 0) {
      const tagIds = (tagData as any[]).map((t: any) => t.id)

      const { data: projectTagData } = await supabase
        .from('project_tags')
        .select('project_id')
        .in('tag_id', tagIds)

      if (projectTagData) {
        const projectCounts = (projectTagData as any[]).reduce((acc: Record<string, number>, pt: any) => {
          acc[pt.project_id] = (acc[pt.project_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const matchingProjectIds = Object.entries(projectCounts)
          .filter(([_, count]) => count === tagIds.length)
          .map(([projectId, _]) => projectId)

        if (matchingProjectIds.length === 0) {
          return []
        }

        query = query.in('id', matchingProjectIds)
      }
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return ((data as any[]) || []).map((project: any) => ({
    ...project,
    tags: project.tags.map((pt: any) => pt.tag).filter(Boolean),
  }))
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithTags | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      tags:project_tags(
        tag:tags(*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  const projectData = data as any

  return {
    ...projectData,
    tags: projectData.tags.map((pt: any) => pt.tag).filter(Boolean),
  }
}

export async function createProject(input: CreateProjectInput): Promise<ProjectWithTags | null> {
  const supabase = createServerClient()
  const { tags, ...projectData } = input

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      used_ai: input.used_ai ? JSON.stringify(input.used_ai) : null,
      tech_stack: input.tech_stack ? JSON.stringify(input.tech_stack) : null,
    })
    .select()
    .single()

  if (projectError) {
    console.error('Error creating project:', projectError)
    return null
  }

  if (tags.length > 0) {
    const projectTags = tags.map(tagId => ({
      project_id: project.id,
      tag_id: tagId,
    }))

    const { error: tagsError } = await supabase
      .from('project_tags')
      .insert(projectTags)

    if (tagsError) {
      console.error('Error inserting project tags:', tagsError)
    }
  }

  return getProjectBySlug(project.slug)
}

export async function updateProject(
  id: string,
  input: Partial<CreateProjectInput>
): Promise<ProjectWithTags | null> {
  const supabase = createServerClient()
  const { tags, ...projectData } = input

  const updateData: any = { ...projectData }
  if (input.used_ai) {
    updateData.used_ai = JSON.stringify(input.used_ai)
  }
  if (input.tech_stack) {
    updateData.tech_stack = JSON.stringify(input.tech_stack)
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (projectError) {
    console.error('Error updating project:', projectError)
    return null
  }

  if (tags) {
    await supabase.from('project_tags').delete().eq('project_id', id)

    if (tags.length > 0) {
      const projectTags = tags.map(tagId => ({
        project_id: id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase
        .from('project_tags')
        .insert(projectTags)

      if (tagsError) {
        console.error('Error updating project tags:', tagsError)
      }
    }
  }

  return getProjectBySlug(project.slug)
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient()

  await supabase.from('project_tags').delete().eq('project_id', id)

  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
