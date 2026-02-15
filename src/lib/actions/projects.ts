import { createServerClient } from '@/lib/supabase/server'
import type { Project, ProjectWithTags, Tag, Database } from '@/types/database'

type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

type ProjectTag = {
    project_id: string;
    tag: Tag;
}

export interface GetProjectsParams {
  status?: 'completed' | 'archived' | 'registered' | Array<'completed' | 'archived' | 'registered'>;
  tags?: string[];
  limit?: number;
  page?: number;
}

export interface PaginatedProjects {
  projects: ProjectWithTags[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getProjects(params: GetProjectsParams): Promise<PaginatedProjects> {
  const supabase = await createServerClient()

  const {
    status,
    tags = [],
    limit = 20,
    page = 1,
  } = params

  let query = supabase
    .from('projects')
    .select('*, tags:project_tags(tag:tags(*))', { count: 'exact' })

  query = query.order('created_at', { ascending: false })

  if (status) {
    if (Array.isArray(status)) {
      query = query.in('status', status)
    } else {
      query = query.eq('status', status)
    }
  }

  // tag filter (AND)
  if (tags && tags.length > 0) {
    const tagSlugs = tags.map((t: string) => t.toLowerCase())
    const { data: tagData } = await supabase.from('tags').select('id,slug').in('slug', tagSlugs)
    if (tagData && tagData.length > 0) {
      const tagIds = tagData.map((t) => t.id as string)
      const { data: projectTags } = await supabase.from('project_tags').select('project_id').in('tag_id', tagIds)
      if (projectTags) {
        const counts = (projectTags as Array<{project_id: string}>).reduce((acc: Record<string, number>, pt: {project_id: string}) => { acc[pt.project_id] = (acc[pt.project_id] || 0) + 1; return acc }, {})
        const matching = Object.entries(counts).filter(([, c]) => c === tagIds.length).map(([id]) => id)
        if (matching.length === 0) {
            return {
                projects: [],
                pagination: { currentPage: page, totalPages: 0, totalCount: 0, hasNext: false, hasPrev: false },
            };
        }
        query = query.in('id', matching)
      }
    }
  }

  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) {
    console.error('Error fetching projects:', error)
    return {
        projects: [],
        pagination: { currentPage: page, totalPages: 0, totalCount: 0, hasNext: false, hasPrev: false },
    };
  }

  const projects: ProjectWithTags[] = ((data as Array<Project & { tags: ProjectTag[] }>) || []).map((p) => {
    return {
      ...p,
      tags: (p.tags as ProjectTag[]).map(pt => pt.tag).filter(Boolean)
    }
  })

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    projects,
    pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    }
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithTags | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`*, tags:project_tags(tag:tags(*))`)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching project by slug:', error)
    return null
  }

  const project = data as Project & { tags: ProjectTag[] }

  return {
    ...project,
    tags: (project.tags as ProjectTag[]).map((pt) => pt.tag).filter(Boolean),
  }
}

export async function getProjectById(id: string): Promise<ProjectWithTags | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`*, tags:project_tags(tag:tags(*))`)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project by id:', error)
    return null
  }

  const project = data as Project & { tags: ProjectTag[] }
  return {
    ...project,
    tags: (project.tags as ProjectTag[]).map((pt) => pt.tag).filter(Boolean),
  }
}

export async function createProject(input: ProjectInsert): Promise<Project | null> {
  const supabase = await createServerClient()

  try {
    const { data, error } = await supabase
      .from('projects')
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

export async function updateProject(id: string, input: ProjectUpdate): Promise<Project | null> {
  const supabase = await createServerClient()

  try {
    const { data, error } = await supabase
      .from('projects')
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
