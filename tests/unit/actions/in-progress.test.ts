import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryMock, createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import {
  createInProgress,
  deleteInProgress,
  getInProgressById,
  getInProgressItems,
  updateInProgress,
} from '@/lib/actions/in-progress'
import { revalidatePath } from 'next/cache'

describe('in-progress actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns list of in-progress items', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { select: [{ data: [{ id: 'ip1', completedProject: { id: 'pr1' } }] }] },
    })

    const result = await getInProgressItems()
    expect(result).toHaveLength(1)
    expect(result[0].completedProject?.id).toBe('pr1')
  })

  it('returns empty list on errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      in_progress: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getInProgressItems('paused')
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns empty list when data is undefined', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { select: [{ data: undefined }] },
    })

    const result = await getInProgressItems()
    expect(result).toEqual([])
  })

  it('returns item by id', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { select: [{ data: { id: 'ip1', completedProject: null } }] },
    })

    const result = await getInProgressById('ip1')
    expect(result?.id).toBe('ip1')
  })

  it('returns null for missing item', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      in_progress: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getInProgressById('missing')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('creates item and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { insert: [{ data: [{ id: 'ip1' }] }] },
    })

    const result = await createInProgress({
      title: 'Test',
      description: 'Desc',
      status: 'in_progress',
      progress_rate: 20,
      started_at: null,
      completed_at: null,
      completed_project_id: null,
      notes: null,
    })

    expect(result?.id).toBe('ip1')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/in-progress')
  })

  it('creates item when insert returns object', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { insert: [{ data: { id: 'ip2' } }] },
    })

    const result = await createInProgress({
      title: 'Test',
      description: 'Desc',
      status: 'in_progress',
      progress_rate: 20,
      started_at: null,
      completed_at: null,
      completed_project_id: null,
      notes: null,
    })

    expect(result?.id).toBe('ip2')
  })

  it('returns null on create error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      in_progress: { insert: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await createInProgress({
      title: 'Test',
      description: 'Desc',
      status: 'in_progress',
      progress_rate: 20,
      started_at: null,
      completed_at: null,
      completed_project_id: null,
      notes: null,
    })

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('updates item and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { update: [{ data: [{ id: 'ip1' }] }] },
    })

    const result = await updateInProgress('ip1', { status: 'completed' })
    expect(result?.id).toBe('ip1')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/in-progress')
  })

  it('updates item when update returns object', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { update: [{ data: { id: 'ip2' } }] },
    })

    const result = await updateInProgress('ip2', { status: 'completed' })
    expect(result?.id).toBe('ip2')
  })

  it('returns null on update error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      in_progress: { update: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await updateInProgress('ip1', { status: 'paused' })
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('deletes item and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { delete: [{ error: null }] },
    })

    await deleteInProgress('ip1')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/in-progress')
  })

  it('throws on delete error', async () => {
    mockSupabase = {
      from: vi.fn(() => ({
        delete: vi.fn(() => createQueryMock([{ error: { message: 'fail' } }]))
      })),
    }

    await expect(deleteInProgress('ip1')).rejects.toThrow('fail')
  })
})
