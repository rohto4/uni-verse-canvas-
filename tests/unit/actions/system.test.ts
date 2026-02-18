import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryMock, createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

import { getDashboardStats, resetDemoData } from '@/lib/actions/system'

describe('system actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds dashboard stats', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          { count: 2 },
          { data: [{ view_count: 3 }, { view_count: 2 }] },
          { data: [{ id: 'p1', title: 'Post1', published_at: '2024-01-02' }] },
        ],
      },
      projects: {
        select: [
          { count: 1 },
          { data: [{ id: 'pr1', title: 'Proj1', created_at: '2024-01-01' }] },
        ],
      },
      in_progress: { select: [{ count: 4 }] },
      tags: { select: [{ count: 5 }] },
    })

    const result = await getDashboardStats()

    expect(result.counts.posts).toBe(2)
    expect(result.counts.projects).toBe(1)
    expect(result.counts.inProgress).toBe(4)
    expect(result.counts.tags).toBe(5)
    expect(result.totalViews).toBe(5)
    expect(result.recentActivities).toHaveLength(2)
  })

  it('sorts recent activities by date', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          { count: 1 },
          { data: [{ view_count: 1 }] },
          { data: [{ id: 'p1', title: 'Post1', published_at: '2024-02-01' }] },
        ],
      },
      projects: {
        select: [
          { count: 1 },
          { data: [{ id: 'pr1', title: 'Proj1', created_at: '2024-03-01' }] },
        ],
      },
      in_progress: { select: [{ count: 0 }] },
      tags: { select: [{ count: 0 }] },
    })

    const result = await getDashboardStats()

    expect(result.recentActivities[0].id).toBe('pr1')
    expect(result.recentActivities[1].id).toBe('p1')
  })

  it('builds dashboard stats with empty data', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          { count: null },
          { data: [] },
          { data: [] },
        ],
      },
      projects: {
        select: [
          { count: null },
          { data: [] },
        ],
      },
      in_progress: { select: [{ count: null }] },
      tags: { select: [{ count: null }] },
    })

    const result = await getDashboardStats()

    expect(result.counts.posts).toBe(0)
    expect(result.counts.projects).toBe(0)
    expect(result.counts.inProgress).toBe(0)
    expect(result.counts.tags).toBe(0)
    expect(result.totalViews).toBe(0)
    expect(result.recentActivities).toHaveLength(0)
  })

  it('handles null lists when building activities', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          { count: 1 },
          { data: null },
          { data: null },
        ],
      },
      projects: {
        select: [
          { count: 1 },
          { data: null },
        ],
      },
      in_progress: { select: [{ count: 0 }] },
      tags: { select: [{ count: 0 }] },
    })

    const result = await getDashboardStats()

    expect(result.totalViews).toBe(0)
    expect(result.recentActivities).toEqual([])
  })

  it('defaults view counts and dates when missing', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          { count: 1 },
          { data: [{ view_count: null }] },
          { data: [{ id: 'p1', title: 'Post1', published_at: null }] },
        ],
      },
      projects: {
        select: [
          { count: 1 },
          { data: [{ id: 'pr1', title: 'Proj1', created_at: null }] },
        ],
      },
      in_progress: { select: [{ count: 0 }] },
      tags: { select: [{ count: 0 }] },
    })

    const result = await getDashboardStats()

    expect(result.totalViews).toBe(0)
    expect(result.recentActivities).toHaveLength(2)
  })

  it('refuses to reset demo data in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    await expect(resetDemoData()).rejects.toThrow('resetDemoData cannot be run in production')
    vi.unstubAllEnvs()
  })

  it('resets demo data in non-production', async () => {
    vi.stubEnv('NODE_ENV', 'test')

    mockSupabase = {
      from: vi.fn(() => ({
        delete: vi.fn(() => ({
          neq: vi.fn(() => createQueryMock([{ error: null }])),
        })),
      })),
    }

    const result = await resetDemoData()
    expect(result).toBe(true)
    vi.unstubAllEnvs()
  })

  it('throws when reset fails', async () => {
    vi.stubEnv('NODE_ENV', 'test')

    mockSupabase = {
      from: vi.fn(() => ({
        delete: vi.fn(() => ({
          neq: vi.fn(() => createQueryMock([{ error: { message: 'fail' } }])),
        })),
      })),
    }

    await expect(resetDemoData()).rejects.toThrow('fail')
    vi.unstubAllEnvs()
  })

  it('throws with fallback message when reset error lacks message', async () => {
    vi.stubEnv('NODE_ENV', 'test')

    mockSupabase = {
      from: vi.fn(() => ({
        delete: vi.fn(() => ({
          neq: vi.fn(() => createQueryMock([{ error: { message: '' } }])),
        })),
      })),
    }

    await expect(resetDemoData()).rejects.toThrow('Failed to clear table')
    vi.unstubAllEnvs()
  })
})
