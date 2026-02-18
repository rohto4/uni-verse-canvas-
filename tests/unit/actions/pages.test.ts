import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { getAllPages, getPage, upsertPage } from '@/lib/actions/pages'
import { revalidatePath } from 'next/cache'

describe('pages actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null for missing page', async () => {
    mockSupabase = createSupabaseMock({
      pages: { select: [{ data: null, error: { code: 'PGRST116' } }] },
    })

    const result = await getPage('about')
    expect(result).toBeNull()
  })

  it('returns page data when present', async () => {
    mockSupabase = createSupabaseMock({
      pages: { select: [{ data: { id: 'p1', page_type: 'about' } }] },
    })

    const result = await getPage('about')
    expect(result).toEqual({ id: 'p1', page_type: 'about' })
  })

  it('logs and returns null for page errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      pages: { select: [{ data: null, error: { code: 'OTHER' } }] },
    })

    const result = await getPage('links')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns all pages', async () => {
    mockSupabase = createSupabaseMock({
      pages: { select: [{ data: [{ id: 'p1' }] }] },
    })

    const result = await getAllPages()
    expect(result).toHaveLength(1)
  })

  it('returns empty array when list data is undefined', async () => {
    mockSupabase = createSupabaseMock({
      pages: { select: [{ data: undefined }] },
    })

    const result = await getAllPages()
    expect(result).toEqual([])
  })

  it('returns empty array on list error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      pages: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getAllPages()
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('upserts and revalidates about page', async () => {
    mockSupabase = createSupabaseMock({
      pages: { upsert: [{ data: { id: 'p1' } }] },
    })

    const result = await upsertPage({
      page_type: 'about',
      title: 'About',
      content: {},
      metadata: {},
    })

    expect(result).toEqual({ id: 'p1' })
    expect(revalidatePath).toHaveBeenCalledWith('/about')
  })

  it('upserts and revalidates links page', async () => {
    mockSupabase = createSupabaseMock({
      pages: { upsert: [{ data: { id: 'p2' } }] },
    })

    const result = await upsertPage({
      page_type: 'links',
      title: 'Links',
      content: {},
      metadata: {},
    })

    expect(result).toEqual({ id: 'p2' })
    expect(revalidatePath).toHaveBeenCalledWith('/links')
  })

  it('upserts and revalidates home page', async () => {
    mockSupabase = createSupabaseMock({
      pages: { upsert: [{ data: { id: 'p3' } }] },
    })

    const result = await upsertPage({
      page_type: 'home',
      title: 'Home',
      content: {},
      metadata: {},
    })

    expect(result).toEqual({ id: 'p3' })
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('returns null on upsert error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      pages: { upsert: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await upsertPage({
      page_type: 'home',
      title: 'Home',
      content: {},
      metadata: {},
    })

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })
})
