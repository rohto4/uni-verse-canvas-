import { beforeEach, describe, expect, it, vi } from 'vitest'

const { signInWithOAuth, signOut } = vi.hoisted(() => ({
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth,
      signOut,
    },
  },
}))

import { signInWithGoogle, signOut as signOutClient } from '@/lib/supabase/auth.client'

describe('supabase auth client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost', href: '' },
      writable: true,
    })
  })

  it('signs in with Google', async () => {
    signInWithOAuth.mockResolvedValue({ data: { provider: 'google' }, error: null })

    const result = await signInWithGoogle()

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost/api/auth/callback' },
    })
    expect(result.data).toEqual({ provider: 'google' })
  })

  it('signs out and redirects', async () => {
    signOut.mockResolvedValue({ error: null })

    const result = await signOutClient()

    expect(result.error).toBeNull()
    expect(window.location.href).toBe('/')
  })

  it('returns error when sign out fails', async () => {
    signOut.mockResolvedValue({ error: { message: 'fail' } })

    const result = await signOutClient()

    expect(result.error).toEqual({ message: 'fail' })
    expect(window.location.href).toBe('')
  })
})
