import { beforeEach, describe, expect, it, vi } from 'vitest'

let mockServerClient: any
let mockAdminClient: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockServerClient),
  createAdminClient: vi.fn(() => mockAdminClient),
}))

vi.mock('server-only', () => ({}))

import { getSessionServer, getUserServer, isAdminByUid } from '@/lib/supabase/auth.server'

describe('supabase auth server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns current session', async () => {
    mockServerClient = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
      },
    }

    const session = await getSessionServer()
    expect(session?.user.id).toBe('u1')
  })

  it('returns current user', async () => {
    mockServerClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u2' } } }),
      },
    }

    const user = await getUserServer()
    expect(user?.id).toBe('u2')
  })

  it('returns false for empty uid', async () => {
    const result = await isAdminByUid('')
    expect(result).toBe(false)
  })

  it('returns false when admin lookup missing', async () => {
    mockAdminClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            })),
          })),
        })),
      })),
    }

    const result = await isAdminByUid('u1')
    expect(result).toBe(false)
  })

  it('returns false on admin lookup error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockAdminClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { code: 'ERR' } }),
            })),
          })),
        })),
      })),
    }

    const result = await isAdminByUid('u1')
    expect(result).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns true when admin is found', async () => {
    mockAdminClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: { user_id: 'u1' }, error: null }),
            })),
          })),
        })),
      })),
    }

    const result = await isAdminByUid('u1')
    expect(result).toBe(true)
  })
})
