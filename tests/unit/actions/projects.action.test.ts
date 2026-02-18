import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import {
  createProject,
  deleteProject,
  getProjectById,
  getProjectBySlug,
  getProjects,
  normalizeTagIds,
  updateProject,
} from '@/lib/actions/projects'

describe('projects actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes tag ids', () => {
    expect(normalizeTagIds(['a', 'b', 'a', ''])).toEqual(['a', 'b'])
    expect(normalizeTagIds(undefined)).toEqual([])
  })

  it('returns empty list when tag matching yields none', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1' }, { id: 't2' }] }] },
      project_tags: { select: [{ data: [{ project_id: 'p1', tag_id: 't1' }] }] },
      projects: { select: [{ data: [], count: 0 }] },
    })

    const result = await getProjects({ tags: ['tag1', 'tag2'] })

    expect(result.projects).toEqual([])
    expect(result.pagination.totalCount).toBe(0)
  })

  it('returns projects when tag data is empty', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [] }] },
      projects: { select: [{ data: [], count: 0 }] },
    })

    const result = await getProjects({ tags: ['tag1'] })
    expect(result.projects).toEqual([])
  })

  it('returns paginated projects', async () => {
    mockSupabase = createSupabaseMock({
      projects: {
        select: [
          {
            data: [
              { id: 'p1', tags: [{ tag: { id: 't1' } }] },
              { id: 'p2', tags: [] },
            ],
            count: 2,
          },
        ],
      },
    })

    const result = await getProjects({ status: 'completed', page: 1, limit: 1 })

    expect(result.projects).toHaveLength(2)
    expect(result.pagination.totalPages).toBe(2)
  })

  it('returns projects when tag filter matches', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1' }] }] },
      project_tags: { select: [{ data: [{ project_id: 'p1', tag_id: 't1' }] }] },
      projects: { select: [{ data: [{ id: 'p1', tags: [] }], count: 1 }] },
    })

    const result = await getProjects({ tags: ['tag1'] })
    expect(result.projects).toHaveLength(1)
    expect(result.pagination.totalCount).toBe(1)
  })

  it('returns projects when tag data exists but project tags are missing', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1' }] }] },
      project_tags: { select: [{ data: undefined }] },
      projects: { select: [{ data: [], count: 0 }] },
    })

    const result = await getProjects({ tags: ['tag1'] })
    expect(result.projects).toEqual([])
  })

  it('supports status arrays', async () => {
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: [], count: 0 }] },
    })

    const result = await getProjects({ status: ['completed', 'archived'] })
    expect(result.projects).toEqual([])
  })

  it('returns empty list on getProjects error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getProjects({})
    expect(result.projects).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns empty list when projects data is undefined', async () => {
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: undefined, count: 0 }] },
    })

    const result = await getProjects({})
    expect(result.projects).toEqual([])
  })

  it('returns null on slug error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getProjectBySlug('missing')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns project by slug with tags', async () => {
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: { id: 'p1', tags: [{ tag: { id: 't1' } }] } }] },
    })

    const result = await getProjectBySlug('slug')
    expect(result?.tags).toHaveLength(1)
  })

  it('returns null on id error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getProjectById('missing')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns project by id with tags', async () => {
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: { id: 'p1', tags: [{ tag: { id: 't1' } }] } }] },
    })

    const result = await getProjectById('p1')
    expect(result?.tags).toHaveLength(1)
  })

  it('creates project with tags', async () => {
    mockSupabase = createSupabaseMock({
      projects: {
        insert: [{ data: { id: 'p1' } }],
        select: [{ data: { id: 'p1', tags: [] } }],
      },
      project_tags: { insert: [{ error: null }] },
    })

    const result = await createProject({ id: 'p1', title: 'Test', tags: ['t1'] } as any)

    expect(result?.id).toBe('p1')
  })

  it('creates project without tags', async () => {
    mockSupabase = createSupabaseMock({
      projects: {
        insert: [{ data: { id: 'p2' } }],
        select: [{ data: { id: 'p2', tags: [] } }],
      },
    })

    const result = await createProject({ id: 'p2', title: 'Test', tags: [] } as any)
    expect(result?.id).toBe('p2')
  })

  it('returns null when create fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: { insert: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await createProject({ id: 'p1', title: 'Test', tags: [] } as any)
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns null when create throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = {
      from: vi.fn(() => {
        throw new Error('boom')
      }),
    }

    const result = await createProject({ id: 'p1', title: 'Test', tags: [] } as any)
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rolls back when tag insert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: { insert: [{ data: { id: 'p1' } }], delete: [{ error: null }] },
      project_tags: { insert: [{ error: { code: 'ERR' } }] },
    })

    const result = await createProject({ id: 'p1', title: 'Test', tags: ['t1'] } as any)

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns null when update cannot fetch current project', async () => {
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await updateProject('p1', { title: 'New' })
    expect(result).toBeNull()
  })

  it('returns null when update fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: {
        select: [{ data: { id: 'p1' } }],
        update: [{ data: null, error: { code: 'ERR' } }],
      },
      project_tags: { select: [{ data: [] }] },
    })

    const result = await updateProject('p1', { title: 'New' })
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns null when tag delete fails during update', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: {
        select: [{ data: { id: 'p1' } }],
        update: [{ data: { id: 'p1' } }],
      },
      project_tags: {
        select: [{ data: [] }],
        delete: [{ error: { code: 'ERR' } }],
      },
    })

    const result = await updateProject('p1', { tags: ['t1'] })
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns null when tag insert fails during update', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: {
        select: [{ data: { id: 'p1' } }],
        update: [{ data: { id: 'p1' } }],
      },
      project_tags: {
        select: [{ data: [{ tag_id: 't1' }] }],
        delete: [{ error: null }],
        insert: [{ error: { code: 'ERR' } }],
      },
    })

    const result = await updateProject('p1', { tags: ['t2'] })
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('updates project with tags', async () => {
    mockSupabase = createSupabaseMock({
      projects: {
        select: [{ data: { id: 'p1' } }, { data: { id: 'p1', tags: [] } }],
        update: [{ data: { id: 'p1' } }],
      },
      project_tags: {
        select: [{ data: [] }],
        delete: [{ error: null }],
        insert: [{ error: null }],
      },
    })

    const result = await updateProject('p1', { tags: ['t1'] })
    expect(result?.id).toBe('p1')
  })

  it('updates project with empty tags without insert', async () => {
    mockSupabase = createSupabaseMock({
      projects: {
        select: [{ data: { id: 'p1' } }, { data: { id: 'p1', tags: [] } }],
        update: [{ data: { id: 'p1' } }],
      },
      project_tags: {
        select: [{ data: null }],
        delete: [{ error: null }],
      },
    })

    const result = await updateProject('p1', { tags: [] })
    expect(result?.id).toBe('p1')
  })

  it('returns null when tag insert fails without old tags', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      projects: {
        select: [{ data: { id: 'p1' } }, { data: { id: 'p1', tags: [] } }],
        update: [{ data: { id: 'p1' } }],
      },
      project_tags: {
        select: [{ data: [] }],
        delete: [{ error: null }],
        insert: [{ error: { code: 'ERR' } }],
      },
    })

    const result = await updateProject('p1', { tags: ['t1'] })
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('updates project without tags', async () => {
    mockSupabase = createSupabaseMock({
      projects: {
        select: [{ data: { id: 'p1' } }, { data: { id: 'p1', tags: [] } }],
        update: [{ data: { id: 'p1' } }],
      },
      project_tags: { select: [{ data: [] }] },
    })

    const result = await updateProject('p1', { title: 'Updated' })
    expect(result?.id).toBe('p1')
  })

  it('deletes project and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { update: [{ error: null }] },
      post_project_links: { delete: [{ error: null }] },
      project_tags: { delete: [{ error: null }] },
      projects: { delete: [{ error: null }] },
    })

    const result = await deleteProject('p1')
    expect(result.success).toBe(true)
  })

  it('returns error when delete fails', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { update: [{ error: { code: 'ERR' } }] },
    })

    const result = await deleteProject('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('プロジェクトの削除に失敗しました')
  })

  it('returns error when project link delete fails', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { update: [{ error: null }] },
      post_project_links: { delete: [{ error: { message: 'fail' } }] },
    })

    const result = await deleteProject('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('プロジェクトの削除に失敗しました')
  })

  it('returns error when project tag delete fails', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { update: [{ error: null }] },
      post_project_links: { delete: [{ error: null }] },
      project_tags: { delete: [{ error: { message: 'fail' } }] },
    })

    const result = await deleteProject('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('プロジェクトの削除に失敗しました')
  })

  it('returns error when project delete fails', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { update: [{ error: null }] },
      post_project_links: { delete: [{ error: null }] },
      project_tags: { delete: [{ error: null }] },
      projects: { delete: [{ error: { message: 'fail' } }] },
    })

    const result = await deleteProject('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('プロジェクトの削除に失敗しました')
  })
})
