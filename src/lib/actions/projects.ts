import { createServerClient } from '@/lib/supabase/server'
import type { Project, ProjectWithTags } from '@/types/database'

/**
 * getProjects supports two call styles for backward compatibility:
 * - getProjects({ status, tags, limit, page }): returns ProjectWithTags[]
 * - getProjects(limit, page): returns { projects, totalCount }
 */
export async function getProjects(paramsOrLimit?: any, pageArg: number = 1): Promise<any> {
  const supabase = createServerClient()

  // numeric call: getProjects(limit, page)
  if (typeof paramsOrLimit === 'number') {
    const limit = paramsOrLimit
    const page = pageArg || 1
    let query = supabase.from('projects').select('*, tags:project_tags(tag:tags(*))', { count: 'exact' }).order('created_at', { ascending: false })
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    const { data, error, count } = await query
    if (error) {
      console.error('Error fetching projects:', error)
      return { projects: [], totalCount: 0 }
    }
    const projects = ((data as any[]) || []).map((p: any) => ({ ...p, tags: (p.tags || []).map((pt: any) => pt.tag).filter(Boolean) }))
    return { projects, totalCount: count || 0 }
  }

  // object call: getProjects({ status, tags, limit, page }) -> return array
  const params = paramsOrLimit || {}
  const {
    status,
    tags = [],
    limit = 20,
    page = 1,
  } = params

  let query = supabase
    .from('projects')
    .select('*, tags:project_tags(tag:tags(*))')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  // tag filter (AND)
  if (tags && tags.length > 0) {
    // get tag ids from slugs or ids
    const tagSlugs = tags.map((t: string) => t.toLowerCase())
    const { data: tagData } = await supabase.from('tags').select('id,slug').in('slug', tagSlugs)
    if (tagData && tagData.length > 0) {
      const tagIds = (tagData as any[]).map((t: any) => t.id)
      const { data: projectTags } = await supabase.from('project_tags').select('project_id').in('tag_id', tagIds)
      if (projectTags) {
        const counts = (projectTags as any[]).reduce((acc: Record<string, number>, pt: any) => { acc[pt.project_id] = (acc[pt.project_id] || 0) + 1; return acc }, {})
        const matching = Object.entries(counts).filter(([_, c]) => c === tagIds.length).map(([id]) => id)
        if (matching.length === 0) return []
        query = query.in('id', matching)
      }
    }
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query
  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return ((data as any[]) || []).map((p: any) => ({ ...p, tags: (p.tags || []).map((pt: any) => pt.tag).filter(Boolean) }))
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithTags | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`*, tags:project_tags(tag:tags(*))`)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching project by slug:', error)
    return null
  }

  const project = data as any

  return {
    ...project,
    tags: (project.tags || []).map((pt: any) => pt.tag).filter(Boolean),
  }
}

export async function getProjectById(id: string): Promise<ProjectWithTags | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`*, tags:project_tags(tag:tags(*))`)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project by id:', error)
    return null
  }

  const project = data as any
  return {
    ...project,
    tags: (project.tags || []).map((pt: any) => pt.tag).filter(Boolean),
  }
}

export async function createProject(input: Partial<Project>): Promise<Project | null> {
  const supabase = createServerClient()

  try {
    const { data, error } = await (supabase.from('projects') as any)
      .insert(input)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return null
    }

    return data as Project
  } catch (err) {
    console.error('Error creating project:', err)
    return null
  }
}

export async function updateProject(id: string, input: Partial<Project>): Promise<Project | null> {
  const supabase = createServerClient()

  try {
    const { data, error } = await (supabase.from('projects') as any)
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return null
    }

    return data as Project
  } catch (err) {
    console.error('Error updating project:', err)
    return null
  }
}
