import { describe, expect, it, vi } from 'vitest'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

import { uploadFile } from '@/lib/actions/storage'

describe('storage actions', () => {
  it('returns error when file is missing', async () => {
    mockSupabase = { storage: { from: vi.fn() } }

    const formData = new FormData()
    const result = await uploadFile(formData)

    expect(result.url).toBeNull()
    expect(result.error).toBe('ファイルが見つかりません。')
  })

  it('returns error when upload fails', async () => {
    const upload = vi.fn().mockResolvedValue({ error: { message: 'fail' } })
    const getPublicUrl = vi.fn()
    mockSupabase = {
      storage: {
        from: vi.fn(() => ({ upload, getPublicUrl })),
      },
    }

    const formData = new FormData()
    formData.set('file', new File(['data'], 'test.png'))

    const result = await uploadFile(formData)

    expect(result.url).toBeNull()
    expect(result.error).toBe('画像のアップロードに失敗しました。')
  })

  it('uploads file with sanitized name', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn/example.png' } })
    mockSupabase = {
      storage: {
        from: vi.fn(() => ({ upload, getPublicUrl })),
      },
    }

    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000)

    const formData = new FormData()
    formData.set('file', new File(['data'], 'Test Image.png'))

    const result = await uploadFile(formData)

    expect(upload).toHaveBeenCalledWith('1700000000000-Test_Image.png', expect.any(File))
    expect(result.url).toBe('https://cdn/example.png')
    nowSpy.mockRestore()
  })
})
