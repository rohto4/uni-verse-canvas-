import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { exportData, importData } from '@/lib/actions/backup'
import { revalidatePath } from 'next/cache'

describe('backup actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports data from all tables', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: [{ id: 'p1' }] }] },
      projects: { select: [{ data: [{ id: 'pr1' }] }] },
      in_progress: { select: [{ data: [{ id: 'ip1' }] }] },
      tags: { select: [{ data: [{ id: 't1' }] }] },
      post_tags: { select: [{ data: [{ id: 'pt1' }] }] },
      project_tags: { select: [{ data: [{ id: 'prt1' }] }] },
      post_links: { select: [{ data: [{ id: 'pl1' }] }] },
      post_project_links: { select: [{ data: [{ id: 'ppl1' }] }] },
      pages: { select: [{ data: [{ id: 'pg1' }] }] },
    })

    const result = await exportData()

    expect(result.data.posts).toHaveLength(1)
    expect(result.data.projects).toHaveLength(1)
    expect(result.data.in_progress).toHaveLength(1)
    expect(result.data.tags).toHaveLength(1)
    expect(result.data.post_tags).toHaveLength(1)
    expect(result.data.project_tags).toHaveLength(1)
    expect(result.data.post_links).toHaveLength(1)
    expect(result.data.post_project_links).toHaveLength(1)
    expect(result.data.pages).toHaveLength(1)
  })

  it('exports empty arrays when tables return null', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: undefined }] },
      projects: { select: [{ data: undefined }] },
      in_progress: { select: [{ data: undefined }] },
      tags: { select: [{ data: undefined }] },
      post_tags: { select: [{ data: undefined }] },
      project_tags: { select: [{ data: undefined }] },
      post_links: { select: [{ data: undefined }] },
      post_project_links: { select: [{ data: undefined }] },
      pages: { select: [{ data: undefined }] },
    })

    const result = await exportData()

    expect(result.data.posts).toEqual([])
    expect(result.data.projects).toEqual([])
    expect(result.data.in_progress).toEqual([])
    expect(result.data.tags).toEqual([])
    expect(result.data.post_tags).toEqual([])
    expect(result.data.project_tags).toEqual([])
    expect(result.data.post_links).toEqual([])
    expect(result.data.post_project_links).toEqual([])
    expect(result.data.pages).toEqual([])
  })

  it('imports data with upserts and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      tags: { upsert: [{}] },
      posts: { upsert: [{}] },
      projects: { upsert: [{}] },
      in_progress: { upsert: [{}] },
      pages: { upsert: [{}] },
      post_tags: { upsert: [{}] },
      project_tags: { upsert: [{}] },
      post_links: { upsert: [{}] },
      post_project_links: { upsert: [{}] },
    })

    const result = await importData({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        tags: [{ id: 't1' } as any],
        posts: [{ id: 'p1' } as any],
        projects: [{ id: 'pr1' } as any],
        in_progress: [{ id: 'ip1' } as any],
        pages: [{ id: 'pg1' } as any],
        post_tags: [{ id: 'pt1' } as any],
        project_tags: [{ id: 'prt1' } as any],
        post_links: [{ id: 'pl1' } as any],
        post_project_links: [{ id: 'ppl1' } as any],
      },
    })

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('imports empty data and still revalidates', async () => {
    mockSupabase = createSupabaseMock()

    const result = await importData({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {},
    })

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('rejects invalid backup data', async () => {
    mockSupabase = createSupabaseMock()

    await expect(
      importData({ version: '1.0', exportedAt: new Date().toISOString(), data: undefined as any })
    ).rejects.toThrow('Invalid backup data')
  })

  it('returns a failure result on import errors', async () => {
    mockSupabase = {
      from: vi.fn(() => {
        throw new Error('boom')
      }),
    }

    const result = await importData({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: { tags: [{ id: 't1' } as any] },
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('boom')
  })

  it('returns unknown error when import throws non-error', async () => {
    mockSupabase = {
      from: vi.fn(() => {
        throw 'boom'
      }),
    }

    const result = await importData({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: { tags: [{ id: 't1' } as any] },
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unknown error')
  })
})
