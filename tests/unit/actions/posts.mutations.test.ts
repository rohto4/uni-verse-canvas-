import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryMock, createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { createPost, deletePost, updatePost } from '@/lib/actions/posts'
import { revalidatePath } from 'next/cache'

describe('posts mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects invalid create input', async () => {
    mockSupabase = createSupabaseMock()

    const result = await createPost({
      title: '',
      slug: 'slug',
      content: {},
      status: 'draft',
    } as any)

    expect(result.success).toBe(false)
  })

  it('rejects scheduled post without future published_at', async () => {
    mockSupabase = createSupabaseMock()

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'scheduled',
      published_at: '2020-01-01T00:00:00.000Z',
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('予約投稿の場合は未来の日時を指定してください')
  })

  it('rejects scheduled post when published_at is missing', async () => {
    mockSupabase = createSupabaseMock()

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'scheduled',
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('予約投稿の場合は未来の日時を指定してください')
  })

  it('handles slug uniqueness error', async () => {
    mockSupabase = createSupabaseMock({
      posts: { insert: [{ data: null, error: { code: '23505' } }] },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('このスラグは既に使用されています')
  })

  it('returns error when create fails with non-unique error', async () => {
    mockSupabase = createSupabaseMock({
      posts: { insert: [{ data: null, error: { message: 'fail' } }] },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('fail')
  })

  it('returns fallback error when create fails without message', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: { insert: [{ data: null, error: {} }] },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('記事の作成に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rolls back when tag insert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        insert: [{ data: { id: 'p1', slug: 'slug' } }],
        delete: [{ error: null }],
      },
      post_tags: { insert: [{ error: { code: 'ERR' } }] },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
      tags: ['t1'],
    } as any)

    expect(result.success).toBe(false)
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('creates post with tags successfully', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        insert: [{ data: { id: 'p1', slug: 'slug' } }],
        select: [{ data: { id: 'p1', slug: 'slug', tags: [{ tag: { id: 't1' } }] } }],
        update: [{ error: null }],
      },
      post_tags: { insert: [{ error: null }] },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
      tags: ['t1'],
    } as any)

    expect(result.success).toBe(true)
    expect(result.data?.tags).toHaveLength(1)
  })

  it('returns error when created post cannot be fetched', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        insert: [{ data: { id: 'p1', slug: 'slug' } }],
        select: [{ data: null, error: { code: 'ERR' } }],
      },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to fetch created post')
  })

  it('creates post and auto-sets published_at', async () => {
    const insert = vi.fn((payload: any) => {
      expect(payload.published_at).toBe('2024-01-01T00:00:00.000Z')
      expect(payload.view_count).toBe(0)
      return createQueryMock([{ data: { id: 'p1', slug: 'slug' }, error: null }])
    })

    const select = vi.fn(() =>
      createQueryMock([{ data: { id: 'p1', slug: 'slug', tags: [] }, error: null }])
    )

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return {
            insert,
            select,
            update: vi.fn(() => createQueryMock([{ error: null }])),
            delete: vi.fn(() => createQueryMock([{ error: null }])),
          }
        }
        if (table === 'post_tags') {
          return { insert: vi.fn(() => createQueryMock([{ error: null }])) }
        }
        if (table === 'post_links') {
          return { delete: vi.fn(() => createQueryMock([{ error: null }])) }
        }
        if (table === 'post_project_links') {
          return { delete: vi.fn(() => createQueryMock([{ error: null }])) }
        }
        return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
      }),
    }

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'published',
      tags: [],
    } as any)

    vi.useRealTimers()

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/posts')
  })

  it('creates post with relations', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        insert: [{ data: { id: 'p1', slug: 'slug' } }],
        select: [{ data: { id: 'p1', slug: 'slug', tags: [] } }],
        update: [{ error: null }],
      },
      post_links: {
        delete: [{ error: null }],
        insert: [{ error: null }],
      },
      post_project_links: {
        delete: [{ error: null }],
        insert: [{ error: null }],
      },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
      related_post_ids: ['p2'],
      related_project_ids: ['pr1'],
    } as any)

    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/works')
  })

  it('rolls back when relation delete fails during create', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        insert: [{ data: { id: 'p1', slug: 'slug' } }],
        delete: [{ error: null }],
      },
      post_links: {
        delete: [{ error: null }],
      },
      post_project_links: {
        delete: [{ error: { message: 'fail' } }],
      },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
      related_project_ids: ['pr1'],
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('関連リンクの設定に失敗したため、処理を中断しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rolls back when related post insert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        insert: [{ data: { id: 'p1', slug: 'slug' } }],
        delete: [{ error: null }],
      },
      post_links: {
        delete: [{ error: null }],
        insert: [{ error: { message: 'fail' } }],
      },
      post_project_links: {
        delete: [{ error: null }],
      },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
      related_post_ids: ['p2'],
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('関連リンクの設定に失敗したため、処理を中断しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rolls back when related project insert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        insert: [{ data: { id: 'p1', slug: 'slug' } }],
        delete: [{ error: null }],
      },
      post_links: {
        delete: [{ error: null }],
      },
      post_project_links: {
        delete: [{ error: null }],
        insert: [{ error: { message: 'fail' } }],
      },
    })

    const result = await createPost({
      title: 'Title',
      slug: 'slug',
      content: {},
      status: 'draft',
      related_project_ids: ['pr1'],
    } as any)

    expect(result.success).toBe(false)
    expect(result.error).toBe('関連リンクの設定に失敗したため、処理を中断しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rejects invalid update input', async () => {
    mockSupabase = createSupabaseMock()

    const result = await updatePost('p1', { title: '' })
    expect(result.success).toBe(false)
  })

  it('returns not found for missing post', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await updatePost('p1', { title: 'New' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('記事が見つかりません')
  })

  it('handles slug uniqueness error on update', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft' } }],
        update: [{ data: null, error: { code: '23505' } }],
      },
      post_tags: { select: [{ data: [] }] },
    })

    const result = await updatePost('p1', { title: 'New' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('このスラグは既に使用されています')
  })

  it('returns error when update fails with non-unique error', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }],
        update: [{ data: null, error: { message: 'fail' } }],
      },
      post_tags: { select: [{ data: [] }] },
      post_links: { select: [{ data: [] }] },
      post_project_links: { select: [{ data: [] }] },
    })

    const result = await updatePost('p1', { title: 'New' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('fail')
  })

  it('defaults old tag ids when current tags are null', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }, { data: { id: 'p1', slug: 'slug', tags: [] } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: {
        select: [{ data: null }],
        delete: [{ error: null }],
      },
    })

    const result = await updatePost('p1', { tags: [] })
    expect(result.success).toBe(true)
  })

  it('fails when tag delete fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: {
        select: [{ data: [] }],
        delete: [{ error: { code: 'ERR' } }],
      },
    })

    const result = await updatePost('p1', { tags: ['t1'] })
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグ更新の前処理に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('fails when tag insert fails and rolls back', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: {
        select: [{ data: [{ tag_id: 't1' }] }],
        delete: [{ error: null }],
        insert: [{ error: { code: 'ERR' } }],
      },
    })

    const result = await updatePost('p1', { tags: ['t2'] })
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの更新に失敗したため、変更を元に戻しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rolls back tags when insert fails with old tags', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const insert = vi.fn()
    insert
      .mockImplementationOnce(() => createQueryMock([{ error: { code: 'ERR' } }]))
      .mockImplementationOnce(() => createQueryMock([{ error: null }]))

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return {
            select: vi.fn(() => createQueryMock([{ data: { id: 'p1', status: 'draft', published_at: null } }])),
            update: vi.fn(() => createQueryMock([{ data: { id: 'p1', slug: 'slug' } }])),
          }
        }
        if (table === 'post_tags') {
          return {
            select: vi.fn(() => createQueryMock([{ data: [{ tag_id: 't1' }] }])),
            delete: vi.fn(() => createQueryMock([{ error: null }])),
            insert,
          }
        }
        if (table === 'post_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_project_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
      }),
    }

    const result = await updatePost('p1', { tags: ['t2'] })
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの更新に失敗したため、変更を元に戻しました')
    expect(insert).toHaveBeenCalledTimes(2)
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rolls back without old tags when insert fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: {
        select: [{ data: [] }],
        delete: [{ error: null }],
        insert: [{ error: { code: 'ERR' } }],
      },
    })

    const result = await updatePost('p1', { tags: ['t2'] })
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの更新に失敗したため、変更を元に戻しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rolls back with old tags payload', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const insert = vi.fn()
    insert
      .mockImplementationOnce(() => createQueryMock([{ error: { code: 'ERR' } }]))
      .mockImplementationOnce((payload: any) => {
        expect(payload).toEqual([{ post_id: 'p1', tag_id: 't1' }])
        return createQueryMock([{ error: null }])
      })

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return {
            select: vi.fn(() => createQueryMock([{ data: { id: 'p1', status: 'draft', published_at: null } }])),
            update: vi.fn(() => createQueryMock([{ data: { id: 'p1', slug: 'slug' } }])),
          }
        }
        if (table === 'post_tags') {
          return {
            select: vi.fn(() => createQueryMock([{ data: [{ tag_id: 't1' }] }])),
            delete: vi.fn(() => createQueryMock([{ error: null }])),
            insert,
          }
        }
        if (table === 'post_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_project_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
      }),
    }

    const result = await updatePost('p1', { tags: ['t2'] })
    expect(result.success).toBe(false)
    expect(result.error).toBe('タグの更新に失敗したため、変更を元に戻しました')
    expect(insert).toHaveBeenCalledTimes(2)
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('updates post and revalidates', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }, { data: { id: 'p1', slug: 'slug', tags: [] } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: {
        select: [{ data: [] }],
        delete: [{ error: null }],
        insert: [{ error: null }],
      },
    })

    const result = await updatePost('p1', { tags: ['t1'] })
    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/posts')
    expect(revalidatePath).toHaveBeenCalledWith('/posts/slug')
  })

  it('updates post with empty tags', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }, { data: { id: 'p1', slug: 'slug', tags: [] } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: {
        select: [{ data: [] }],
        delete: [{ error: null }],
      },
    })

    const result = await updatePost('p1', { tags: [] })
    expect(result.success).toBe(true)
  })

  it('updates relations using existing related posts', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }, { data: { id: 'p1', slug: 'slug', tags: [] } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: { select: [{ data: [] }] },
      post_links: {
        select: [{ data: [{ to_post_id: 'p2' }] }],
        delete: [{ error: null }],
        insert: [{ error: null }],
      },
      post_project_links: {
        select: [{ data: [] }],
        delete: [{ error: null }],
      },
    })

    const result = await updatePost('p1', { related_project_ids: [] })
    expect(result.success).toBe(true)
  })

  it('returns error when updated post cannot be fetched', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }, { data: null, error: { code: 'ERR' } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: { select: [{ data: [] }] },
      post_links: { select: [{ data: [] }] },
      post_project_links: { select: [{ data: [] }] },
    })

    const result = await updatePost('p1', { title: 'New' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('Failed to fetch updated post')
  })

  it('returns fallback error when update fails without message', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }],
        update: [{ data: null, error: { message: '' } }],
      },
      post_tags: { select: [{ data: [] }] },
      post_links: { select: [{ data: [] }] },
      post_project_links: { select: [{ data: [] }] },
    })

    const result = await updatePost('p1', { title: 'New' })
    expect(result.success).toBe(false)
    expect(result.error).toBe('記事の更新に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('rolls back when relation update fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', status: 'draft', published_at: null } }],
        update: [{ data: { id: 'p1', slug: 'slug' } }],
      },
      post_tags: { select: [{ data: [] }] },
      post_links: {
        select: [{ data: [] }],
        delete: [{ error: { message: 'fail' } }],
      },
      post_project_links: {
        select: [{ data: [] }],
        delete: [{ error: null }],
      },
    })

    const result = await updatePost('p1', { related_post_ids: ['p2'] })
    expect(result.success).toBe(false)
    expect(result.error).toBe('関連リンクの更新に失敗したため、変更を元に戻しました')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('sets published_at when transitioning to published', async () => {
    const update = vi.fn((payload: any) => {
      expect(payload.published_at).toBe('2024-02-01T00:00:00.000Z')
      return createQueryMock([{ data: { id: 'p1', slug: 'slug' }, error: null }])
    })

    let selectCall = 0
    const select = vi.fn(() => {
      selectCall += 1
      if (selectCall === 1) {
        return createQueryMock([{ data: { id: 'p1', status: 'draft', published_at: null } }])
      }
      return createQueryMock([{ data: { id: 'p1', slug: 'slug', tags: [] }, error: null }])
    })

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return {
            select,
            update,
          }
        }
        if (table === 'post_tags') {
          return {
            select: vi.fn(() => createQueryMock([{ data: [] }])),
            delete: vi.fn(() => createQueryMock([{ error: null }])),
          }
        }
        if (table === 'post_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_project_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
      }),
    }

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-01T00:00:00.000Z'))

    const result = await updatePost('p1', { status: 'published' })

    vi.useRealTimers()

    expect(result.success).toBe(true)
  })

  it('keeps existing published_at when transitioning to published', async () => {
    const update = vi.fn((payload: any) => {
      expect(payload.published_at).toBe('2024-01-01T00:00:00.000Z')
      return createQueryMock([{ data: { id: 'p1', slug: 'slug' }, error: null }])
    })

    let selectCall = 0
    const select = vi.fn(() => {
      selectCall += 1
      if (selectCall === 1) {
        return createQueryMock([{ data: { id: 'p1', status: 'draft', published_at: '2024-01-01T00:00:00.000Z' } }])
      }
      return createQueryMock([{ data: { id: 'p1', slug: 'slug', tags: [] }, error: null }])
    })

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return { select, update }
        }
        if (table === 'post_tags') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])), delete: vi.fn(() => createQueryMock([{ error: null }])) }
        }
        if (table === 'post_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_project_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
      }),
    }

    const result = await updatePost('p1', { status: 'published' })
    expect(result.success).toBe(true)
  })

  it('keeps published_at when status is provided without published_at', async () => {
    const update = vi.fn((payload: any) => {
      expect(payload.published_at).toBe('2024-01-05T00:00:00.000Z')
      return createQueryMock([{ data: { id: 'p1', slug: 'slug' }, error: null }])
    })

    let selectCall = 0
    const select = vi.fn(() => {
      selectCall += 1
      if (selectCall === 1) {
        return createQueryMock([{ data: { id: 'p1', status: 'scheduled', published_at: '2024-01-05T00:00:00.000Z' } }])
      }
      return createQueryMock([{ data: { id: 'p1', slug: 'slug', tags: [] }, error: null }])
    })

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return { select, update }
        }
        if (table === 'post_tags') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_project_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
      }),
    }

    const result = await updatePost('p1', { status: 'draft' })
    expect(result.success).toBe(true)
  })

  it('keeps published_at when status is provided with null published_at', async () => {
    const update = vi.fn((payload: any) => {
      expect(payload.published_at).toBe('2024-01-05T00:00:00.000Z')
      return createQueryMock([{ data: { id: 'p1', slug: 'slug' }, error: null }])
    })

    let selectCall = 0
    const select = vi.fn(() => {
      selectCall += 1
      if (selectCall === 1) {
        return createQueryMock([{ data: { id: 'p1', status: 'draft', published_at: '2024-01-05T00:00:00.000Z' } }])
      }
      return createQueryMock([{ data: { id: 'p1', slug: 'slug', tags: [] }, error: null }])
    })

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return { select, update }
        }
        if (table === 'post_tags') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_project_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
      }),
    }

    const result = await updatePost('p1', { status: 'draft', published_at: null })
    expect(result.success).toBe(true)
  })

  it('keeps published_at when status is undefined', async () => {
    const update = vi.fn((payload: any) => {
      expect(payload.published_at).toBe('2024-01-05T00:00:00.000Z')
      return createQueryMock([{ data: { id: 'p1', slug: 'slug' }, error: null }])
    })

    let selectCall = 0
    const select = vi.fn(() => {
      selectCall += 1
      if (selectCall === 1) {
        return createQueryMock([{ data: { id: 'p1', status: 'draft', published_at: '2024-01-05T00:00:00.000Z' } }])
      }
      return createQueryMock([{ data: { id: 'p1', slug: 'slug', tags: [] }, error: null }])
    })

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return { select, update }
        }
        if (table === 'post_tags') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        if (table === 'post_project_links') {
          return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
        }
        return { select: vi.fn(() => createQueryMock([{ data: [] }])) }
      }),
    }

    const result = await updatePost('p1', { title: 'New' })
    expect(result.success).toBe(true)
  })

  it('deletes post successfully', async () => {
    mockSupabase = createSupabaseMock({
      posts: { delete: [{ error: null }] },
    })

    const result = await deletePost('p1')
    expect(result.success).toBe(true)
    expect(revalidatePath).toHaveBeenCalledWith('/posts')
  })

  it('returns error on delete failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: { delete: [{ error: { message: 'fail' } }] },
    })

    const result = await deletePost('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('fail')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns error when post link delete fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_links: { delete: [{ error: { message: 'fail' } }] },
    })

    const result = await deletePost('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('fail')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns error when project link delete fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_links: { delete: [{ error: null }] },
      post_project_links: { delete: [{ error: { message: 'fail' } }] },
    })

    const result = await deletePost('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('fail')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns error when post tag delete fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_links: { delete: [{ error: null }] },
      post_project_links: { delete: [{ error: null }] },
      post_tags: { delete: [{ error: { message: 'fail' } }] },
    })

    const result = await deletePost('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('fail')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns fallback error when delete fails without message', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_links: { delete: [{ error: null }] },
      post_project_links: { delete: [{ error: null }] },
      post_tags: { delete: [{ error: null }] },
      posts: { delete: [{ error: {} }] },
    })

    const result = await deletePost('p1')
    expect(result.success).toBe(false)
    expect(result.error).toBe('記事の削除に失敗しました')
    expect(consoleSpy).toHaveBeenCalled()
  })
})
