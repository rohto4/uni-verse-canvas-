import { describe, expect, it, vi } from 'vitest'

const createBrowserClient = vi.fn(() => ({ client: true }))

vi.mock('@supabase/ssr', () => ({
  createBrowserClient,
}))

describe('supabase browser client', () => {
  it('creates browser client from env', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

    const module = await import('@/lib/supabase/client')

    expect(module.supabase).toEqual({ client: true })
    expect(createBrowserClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key')
  })
})
