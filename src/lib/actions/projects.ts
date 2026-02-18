import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project, ProjectWithTags, Tag, Database } from '@/types/database'

type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']
type ProjectTagInsert = Database['public']['Tables']['project_tags']['Insert']

type ProjectTag = {
    project_id: string;
    tag: Tag;
}

export function normalizeTagIds(tags?: string[]): string[] {
  if (!tags) return []
  return Array.from(new Set(tags)).filter((tagId) => tagId)
}

export interface GetProjectsParams {
  status?: 'completed' | 'archived' | 'registered' | Array<'completed' | 'archived' | 'registered'>;
  tags?: string[];
  limit?: number;
  page?: number;
}

export interface CreateProjectInput extends ProjectInsert {
  tags?: string[]
}

export interface UpdateProjectInput extends ProjectUpdate {
  tags?: string[]
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

function stripPublicLinkFields<T extends Record<string, unknown>>(data: T) {
  const { public_link_type, public_link_url, ...rest } = data
  return rest as T
}

function isMissingPublicLinkColumn(error: unknown) {
  const err = error as { code?: string; message?: string }
  return err?.code === 'PGRST204' && err?.message?.includes('public_link_')
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

export async function createProject(input: CreateProjectInput): Promise<ProjectWithTags | null> {
  const supabase = await createServerClient()
  const { tags = [], ...projectData } = input

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      if (isMissingPublicLinkColumn(error)) {
        const retryData = stripPublicLinkFields(projectData)
        const { data: retryDataResult, error: retryError } = await supabase
          .from('projects')
          .insert(retryData)
          .select()
          .single()
        if (retryError) {
          console.error('Error creating project:', retryError)
          return null
        }
        const createdProject = retryDataResult as Project
        const uniqueTagIds = normalizeTagIds(tags)
        if (uniqueTagIds.length > 0) {
          const projectTags: ProjectTagInsert[] = uniqueTagIds.map((tagId) => ({
            project_id: createdProject.id,
            tag_id: tagId,
          }))
          const { error: tagError } = await supabase
            .from('project_tags')
            .insert(projectTags)
          if (tagError) {
            console.error('Failed to add project tags, rolling back:', tagError)
            await supabase.from('projects').delete().eq('id', createdProject.id)
            return null
          }
        }
        return await getProjectById(createdProject.id)
      }

      console.error('Error creating project:', error)
      return null
    }

    const createdProject = data as Project

    const uniqueTagIds = normalizeTagIds(tags)
    if (uniqueTagIds.length > 0) {
      const projectTags: ProjectTagInsert[] = uniqueTagIds.map((tagId) => ({
        project_id: createdProject.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase
        .from('project_tags')
        .insert(projectTags)

      if (tagError) {
        console.error('Failed to add project tags, rolling back:', tagError)
        await supabase.from('projects').delete().eq('id', createdProject.id)
        return null
      }
    }

    return await getProjectById(createdProject.id)
  } catch (err) {
    console.error('Error creating project:', err)
    return null
  }
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<ProjectWithTags | null> {
  const supabase = await createServerClient()
  const { tags, ...projectData } = input

  const { data: currentProject, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !currentProject) {
    console.error('Error fetching project for update:', fetchError)
    return null
  }

  const { data: currentTags } = await supabase
    .from('project_tags')
    .select('tag_id')
    .eq('project_id', id)

  const oldTagIds = (currentTags as Array<{ tag_id: string }> | null)?.map((t) => t.tag_id) || []

  try {
    const { data, error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (isMissingPublicLinkColumn(error)) {
        const retryData = stripPublicLinkFields(projectData)
        const { data: retryProject, error: retryError } = await supabase
          .from('projects')
          .update(retryData)
          .eq('id', id)
          .select()
          .single()
        if (retryError) {
          console.error('Error updating project:', retryError)
          return null
        }
        const updatedProject = retryProject as Project
        if (tags !== undefined) {
          const { error: deleteTagsError } = await supabase
            .from('project_tags')
            .delete()
            .eq('project_id', id)

          if (deleteTagsError) {
            throw new Error('タグ更新の前処理に失敗しました')
          }

          const uniqueTagIds = normalizeTagIds(tags)
          if (uniqueTagIds.length > 0) {
            const projectTags: ProjectTagInsert[] = uniqueTagIds.map((tagId) => ({
              project_id: id,
              tag_id: tagId,
            }))

            const { error: insertTagsError } = await supabase
              .from('project_tags')
              .insert(projectTags)

            if (insertTagsError) {
              console.error('Failed to update project tags, rolling back:', insertTagsError)
              await supabase.from('projects').update(currentProject).eq('id', id)

              if (oldTagIds.length > 0) {
                const rollbackTags: ProjectTagInsert[] = oldTagIds.map((tagId) => ({
                  project_id: id,
                  tag_id: tagId,
                }))
                await supabase.from('project_tags').insert(rollbackTags)
              }

              throw new Error('タグの更新に失敗したため、変更を元に戻しました')
            }
          }
        }

        return await getProjectById(updatedProject.id)
      }

      console.error('Error updating project:', error)
      return null
    }

    const updatedProject = data as Project

    if (tags !== undefined) {
      const { error: deleteTagsError } = await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', id)

      if (deleteTagsError) {
        throw new Error('タグ更新の前処理に失敗しました')
      }

      const uniqueTagIds = normalizeTagIds(tags)
      if (uniqueTagIds.length > 0) {
        const projectTags: ProjectTagInsert[] = uniqueTagIds.map((tagId) => ({
          project_id: id,
          tag_id: tagId,
        }))

        const { error: insertTagsError } = await supabase
          .from('project_tags')
          .insert(projectTags)

        if (insertTagsError) {
          console.error('Failed to update project tags, rolling back:', insertTagsError)
          await supabase.from('projects').update(currentProject).eq('id', id)

          if (oldTagIds.length > 0) {
            const rollbackTags: ProjectTagInsert[] = oldTagIds.map((tagId) => ({
              project_id: id,
              tag_id: tagId,
            }))
            await supabase.from('project_tags').insert(rollbackTags)
          }

          throw new Error('タグの更新に失敗したため、変更を元に戻しました')
        }
      }
    }

    return await getProjectById(updatedProject.id)
  } catch (err) {
    console.error('Error updating project:', err)
    return null
  }
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()

  try {
    const { error: progressError } = await supabase
      .from('in_progress')
      .update({ completed_project_id: null })
      .eq('completed_project_id', id)

    if (progressError) {
      throw progressError
    }

    const { error: linkError } = await supabase
      .from('post_project_links')
      .delete()
      .eq('project_id', id)

    if (linkError) {
      throw linkError
    }

    const { error: tagError } = await supabase
      .from('project_tags')
      .delete()
      .eq('project_id', id)

    if (tagError) {
      throw tagError
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    revalidatePath('/works')
    revalidatePath('/progress')
    revalidatePath('/admin/projects')
    revalidatePath('/admin/in-progress')
    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: 'プロジェクトの削除に失敗しました' }
  }
}
