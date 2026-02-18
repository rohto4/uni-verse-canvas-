import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryMock, createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createTag, deleteTag, getTagBySlug, getTags, getTagsWithCount, updateTag } from '@/lib/actions/tags'
import { revalidatePath } from 'next/cache'

describe('tag actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns tags list', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1' }] }] },
    })

    const result = await getTags()
    expect(result).toHaveLength(1)
  })

  it('returns empty list when tag data is undefined', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: undefined }] },
    })

    const result = await getTags()
    expect(result).toEqual([])
  })

  it('returns empty list on tag errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getTags()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns tags with counts', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1', name: 'Tag1' }, { id: 't2', name: 'Tag2' }] }] },
      post_tags: { select: [{ count: 2 }, { count: 0 }] },
      project_tags: { select: [{ count: 1 }, { count: 3 }] },
    })

    const result = await getTagsWithCount()

    expect(result[0].postCount).toBe(2)
    expect(result[0].projectCount).toBe(1)
    expect(result[1].postCount).toBe(0)
    expect(result[1].projectCount).toBe(3)
  })

  it('defaults project count to zero when missing', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1', name: 'Tag1' }] }] },
      post_tags: { select: [{ count: 1 }] },
      project_tags: { select: [{ count: undefined }] },
    })

    const result = await getTagsWithCount()
    expect(result[0].projectCount).toBe(0)
  })

  it('returns empty list when tag fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getTagsWithCount()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns null for missing tag', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getTagBySlug('missing')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns tag by slug', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: { id: 't1', name: 'Tag1', slug: 'tag1' } }] },
    })

    const result = await getTagBySlug('tag1')
    expect(result?.id).toBe('t1')
  })

  it('rejects invalid create input', async () => {
    mockSupabase = createSupabaseMock()

    const result = await createTag({ name: '', slug: 'valid-slug', color: '#6B7280' })
    expect(result.success).toBe(false)
  })

  it('creates tag and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      tags: { insert: [{ data: { id: 't1', name: 'Tag1', slug: 'tag1' } }] },
    })

    const result = await createTag({ name: 'Tag1', slug: 'tag1', color: '#6B7280' })

    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('t1')
    expect(revalidatePath).toHaveBeenCalledWith('/posts')
    expect(revalidatePath).toHaveBeenCalledWith('/works')
  })

  it('creates tag with default color', async () => {
    mockSupabase = createSupabaseMock({
      tags: { insert: [{ data: { id: 't2', name: 'Tag2', slug: 'tag2' } }] },
    })

    const result = await createTag({ name: 'Tag2', slug: 'tag2', color: '' } as any)
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('t2')
  })

  it('returns duplicate error on create', async () => {
    mockSupabase = createSupabaseMock({
      tags: { insert: [{ data: null, error: { code: '23505' } }] },
    })

    const result = await createTag({ name: 'Tag1', slug: 'tag1', color: '#6B7280' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('同じタグ名またはスラッグが既に存在します')
  })

  it('returns error on create failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      tags: { insert: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await createTag({ name: 'Tag1', slug: 'tag1', color: '#6B7280' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの作成に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rejects invalid update input', async () => {
    mockSupabase = createSupabaseMock()

    const result = await updateTag('t1', { slug: 'bad slug' })
    expect(result.success).toBe(false)
  })

  it('updates tag and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      tags: { update: [{ data: { id: 't1', name: 'Tag1', slug: 'tag1' } }] },
    })

    const result = await updateTag('t1', { name: 'Tag1', slug: 'tag1' })
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('t1')
    expect(revalidatePath).toHaveBeenCalledWith('/posts')
    expect(revalidatePath).toHaveBeenCalledWith('/works')
  })

  it('updates tag with nullable description and default color', async () => {
    mockSupabase = createSupabaseMock({
      tags: { update: [{ data: { id: 't3', name: 'Tag3', slug: 'tag3' } }] },
    })

    const result = await updateTag('t3', { description: null, color: '' })
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('t3')
  })

  it('updates tag with empty color', async () => {
    mockSupabase = createSupabaseMock({
      tags: { update: [{ data: { id: 't4', name: 'Tag4', slug: 'tag4' } }] },
    })

    const result = await updateTag('t4', { color: '' })
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('t4')
  })

  it('updates tag with explicit color', async () => {
    mockSupabase = createSupabaseMock({
      tags: { update: [{ data: { id: 't5', name: 'Tag5', slug: 'tag5' } }] },
    })

    const result = await updateTag('t5', { color: '#123456' })
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('t5')
  })

  it('passes color through update payload', async () => {
    const update = vi.fn((payload: any) => {
      expect(payload.color).toBe('#123456')
      return createQueryMock([{ data: { id: 't6', name: 'Tag6', slug: 'tag6' }, error: null }])
    })

    mockSupabase = {
      from: vi.fn(() => ({ update })),
    }

    const result = await updateTag('t6', { color: '#123456' })
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('t6')
  })

  it('defaults color when empty string is provided', async () => {
    const update = vi.fn((payload: any) => {
      expect(payload.color).toBe('#6B7280')
      return createQueryMock([{ data: { id: 't7', name: 'Tag7', slug: 'tag7' }, error: null }])
    })

    mockSupabase = {
      from: vi.fn(() => ({ update })),
    }

    const result = await updateTag('t7', { color: '' })
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('t7')
  })

  it('returns duplicate error on update', async () => {
    mockSupabase = createSupabaseMock({
      tags: { update: [{ data: null, error: { code: '23505' } }] },
    })

    const result = await updateTag('t1', { name: 'Tag1', slug: 'tag1' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('同じタグ名またはスラッグが既に存在します')
  })

  it('returns error on update failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      tags: { update: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await updateTag('t1', { name: 'Tag1' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの更新に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('deletes tag and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      post_tags: { delete: [{ error: null }] },
      project_tags: { delete: [{ error: null }] },
      tags: { delete: [{ error: null }] },
    })

    const result = await deleteTag('t1')
    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/posts')
    expect(revalidatePath).toHaveBeenCalledWith('/works')
  })

  it('returns error on delete failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_tags: { delete: [{ error: { code: 'ERR' } }] },
    })

    const result = await deleteTag('t1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの削除に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns error when project tag delete fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_tags: { delete: [{ error: null }] },
      project_tags: { delete: [{ error: { code: 'ERR' } }] },
    })

    const result = await deleteTag('t1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの削除に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns error when tag delete fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_tags: { delete: [{ error: null }] },
      project_tags: { delete: [{ error: null }] },
      tags: { delete: [{ error: { code: 'ERR' } }] },
    })

    const result = await deleteTag('t1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの削除に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })
})
