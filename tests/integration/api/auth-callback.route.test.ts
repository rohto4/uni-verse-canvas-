import { describe, expect, it, vi } from 'vitest'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

import { GET } from '@/app/api/auth/callback/route'

describe('auth callback route', () => {
  it('redirects to next on successful exchange', async () => {
    mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    }

    const request = new Request('http://localhost/api/auth/callback?code=abc&next=/admin')
    const response = await GET(request)

    expect(response.headers.get('location')).toBe('http://localhost/admin')
  })

  it('redirects to login on exchange error', async () => {
    mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: { message: 'fail' } }),
      },
    }

    const request = new Request('http://localhost/api/auth/callback?code=abc')
    const response = await GET(request)

    expect(response.headers.get('location')).toBe('http://localhost/login?error=auth_failed')
  })

  it('redirects to login when code is missing', async () => {
    mockSupabase = { auth: { exchangeCodeForSession: vi.fn() } }

    const request = new Request('http://localhost/api/auth/callback')
    const response = await GET(request)

    expect(response.headers.get('location')).toBe('http://localhost/login?error=auth_failed')
  })
})
