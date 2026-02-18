import { describe, expect, it, vi } from 'vitest'

const { createServerClientSpy } = vi.hoisted(() => ({
  createServerClientSpy: vi.fn(() => ({ mock: true })),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientSpy,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: vi.fn(() => [{ name: 'sb', value: 'x' }]),
    set: vi.fn(),
  })),
}))

import { createAdminClient, createServerClient } from '@/lib/supabase/server'

describe('supabase server helpers', () => {
  it('creates server client with cookie store', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    const client = await createServerClient()

    expect(client).toEqual({ mock: true })
    expect(createServerClientSpy).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'anon-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    )

    const cookies = (createServerClientSpy.mock.calls[0] as any)[2].cookies
    expect(cookies.getAll()).toEqual([{ name: 'sb', value: 'x' }])
    cookies.setAll([{ name: 'sb', value: 'y', options: {} }])
  })

  it('creates admin client with service key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'

    const client = createAdminClient()

    expect(client).toEqual({ mock: true })
    expect(createServerClientSpy).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'service-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    )

    const cookies = (createServerClientSpy.mock.calls[1] as any)[2].cookies
    expect(cookies.getAll()).toEqual([])
    cookies.setAll([])
  })
})
