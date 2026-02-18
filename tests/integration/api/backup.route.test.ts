import { describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

import { POST } from '@/app/api/backup/route'

describe('backup route', () => {
  it('returns json backup', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: [{ id: 'p1' }] }] },
      projects: { select: [{ data: [] }] },
      in_progress: { select: [{ data: [] }] },
      tags: { select: [{ data: [] }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'full', format: 'json' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.posts).toHaveLength(1)
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('uses default type and format', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: [] }] },
      projects: { select: [{ data: [] }] },
      in_progress: { select: [{ data: [] }] },
      tags: { select: [{ data: [] }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.posts).toEqual([])
  })

  it('returns markdown export for posts', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: [{ title: 'Hello', excerpt: 'World' }] }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'posts', format: 'markdown' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toContain('# Hello')
    expect(response.headers.get('Content-Type')).toBe('text/markdown')
  })

  it('returns markdown export for full type', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: [{ title: 'Hello', excerpt: '' }] }] },
      projects: { select: [{ data: [] }] },
      in_progress: { select: [{ data: [] }] },
      tags: { select: [{ data: [] }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'full', format: 'markdown' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toContain('# Hello')
  })

  it('returns project-only backup', async () => {
    mockSupabase = createSupabaseMock({
      projects: { select: [{ data: [{ id: 'pr1' }] }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'projects', format: 'json' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.projects).toHaveLength(1)
  })

  it('returns empty arrays when data is undefined', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: undefined }] },
      projects: { select: [{ data: undefined }] },
      in_progress: { select: [{ data: undefined }] },
      tags: { select: [{ data: undefined }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'full', format: 'json' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.posts).toEqual([])
    expect(body.projects).toEqual([])
    expect(body.in_progress).toEqual([])
    expect(body.tags).toEqual([])
  })

  it('returns in-progress-only backup', async () => {
    mockSupabase = createSupabaseMock({
      in_progress: { select: [{ data: [{ id: 'ip1' }] }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'in_progress', format: 'json' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.in_progress).toHaveLength(1)
  })

  it('returns tags-only backup', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1' }] }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'tags', format: 'json' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.tags).toHaveLength(1)
  })

  it('returns markdown export when posts are missing', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: undefined }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'posts', format: 'markdown' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toBe('')
  })

  it('returns success for unsupported format', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: [] }] },
      projects: { select: [{ data: [] }] },
      in_progress: { select: [{ data: [] }] },
      tags: { select: [{ data: [] }] },
    })

    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: JSON.stringify({ type: 'full', format: 'xml' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns error on invalid payload', async () => {
    const request = new Request('http://localhost/api/backup', {
      method: 'POST',
      body: '{bad json}',
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
  })

  it('returns error when request throws non-error', async () => {
    const response = await POST({ json: () => { throw 'boom' } } as any)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe('boom')
  })
})
