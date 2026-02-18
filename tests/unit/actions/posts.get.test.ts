import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSupabaseMock } from '../../helpers/supabase'

let mockSupabase: any

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}))

import {
  getPostById,
  getPostBySlug,
  getPostRelations,
  getPosts,
  getRelatedPosts,
  getRelatedPostsForProject,
  getRelatedPostsByTagsWithRandom,
} from '@/lib/actions/posts'

describe('posts queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns posts with tag filter and search', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1' }, { id: 't2' }] }] },
      post_tags: { select: [{ data: [{ post_id: 'p1' }, { post_id: 'p1' }] }] },
      posts: {
        select: [
          [
            { count: 1 },
            { data: [{ id: 'p1', tags: [{ tag: { id: 't1' } }] }], error: null },
          ],
        ],
      },
    })

    const result = await getPosts({ tags: ['Tag'], search: 'hello', sort: 'latest' })

    expect(result.posts).toHaveLength(1)
    expect(result.pagination.totalCount).toBe(1)
  })

  it('returns posts for non-published status', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          [
            { count: 0 },
            { data: [], error: null },
          ],
        ],
      },
    })

    const result = await getPosts({ status: 'draft', sort: 'oldest' })
    expect(result.posts).toEqual([])
  })

  it('supports popular sort', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          [
            { count: 0 },
            { data: [], error: null },
          ],
        ],
      },
    })

    const result = await getPosts({ sort: 'popular' })
    expect(result.posts).toEqual([])
  })

  it('returns posts when tag list resolves empty', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [] }] },
      posts: {
        select: [
          [
            { count: 1 },
            { data: [{ id: 'p1', tags: [] }], error: null },
          ],
        ],
      },
    })

    const result = await getPosts({ tags: ['missing'] })
    expect(result.posts).toHaveLength(1)
  })

  it('returns empty when tag matching yields none', async () => {
    mockSupabase = createSupabaseMock({
      tags: { select: [{ data: [{ id: 't1' }] }] },
      post_tags: { select: [{ data: [] }] },
      posts: { select: [[{ count: 0 }, { data: [], error: null }]] },
    })

    const result = await getPosts({ tags: ['tag'] })
    expect(result.posts).toEqual([])
  })

  it('returns empty list on query error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: { select: [[{ count: 0 }, { data: null, error: { code: 'ERR' } }]] },
    })

    const result = await getPosts()
    expect(result.posts).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns post by slug and tolerates view count error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'posts') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  then: (resolve: (value: unknown) => void) =>
                    Promise.resolve({ data: { id: 'p1', tags: [] }, error: null }).then(resolve),
                })),
              })),
            })),
            update: vi.fn(() => {
              throw new Error('update failed')
            }),
          }
        }
        return { select: vi.fn() }
      }),
    }

    const result = await getPostBySlug('slug')
    expect(result?.id).toBe('p1')
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns post by slug with tags', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [{ data: { id: 'p1', tags: [{ tag: { id: 't1' } }], view_count: 0 } }],
        update: [{ error: null }],
      },
    })

    const result = await getPostBySlug('slug')
    expect(result?.tags).toHaveLength(1)
  })

  it('returns null on post by slug error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getPostBySlug('missing')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns null on post by id error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getPostById('missing')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns post by id with tags', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: { id: 'p1', tags: [{ tag: { id: 't1' } }] } }] },
    })

    const result = await getPostById('p1')
    expect(result?.tags).toHaveLength(1)
  })

  it('returns empty related posts when current post has no tags', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: { tags: [] } }] },
    })

    const result = await getRelatedPosts('p1')
    expect(result).toEqual([])
  })

  it('returns empty related posts when no related tags', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: { tags: [{ tag_id: 't1' }] } }] },
      post_tags: { select: [{ data: [] }] },
    })

    const result = await getRelatedPosts('p1')
    expect(result).toEqual([])
  })

  it('returns empty related posts on error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      posts: { select: [{ data: { tags: [{ tag_id: 't1' }] } }, { data: null, error: { code: 'ERR' } }] },
      post_tags: { select: [{ data: [{ post_id: 'p2' }] }] },
    })

    const result = await getRelatedPosts('p1')
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns related posts', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          { data: { tags: [{ tag_id: 't1' }, { tag_id: 't2' }] } },
          { data: [{ id: 'p2', tags: [{ tag: { id: 't1' } }] }], error: null },
        ],
      },
      post_tags: { select: [{ data: [{ post_id: 'p2' }, { post_id: 'p2' }] }] },
    })

    const result = await getRelatedPosts('p1', 1)
    expect(result).toHaveLength(1)
  })

  it('sorts related posts by tag counts', async () => {
    mockSupabase = createSupabaseMock({
      posts: {
        select: [
          { data: { tags: [{ tag_id: 't1' }] } },
          { data: [{ id: 'p2', tags: [{ tag: { id: 't1' } }] }, { id: 'p3', tags: [] }], error: null },
        ],
      },
      post_tags: { select: [{ data: [{ post_id: 'p2' }, { post_id: 'p2' }, { post_id: 'p3' }] }] },
    })

    const result = await getRelatedPosts('p1', 2)
    expect(result).toHaveLength(2)
  })

  it('returns manual related posts when links exist', async () => {
    mockSupabase = createSupabaseMock({
      post_links: { select: [{ data: [{ to_post_id: 'p2' }, { to_post_id: 'p1' }] }] },
      posts: { select: [{ data: [{ id: 'p1', tags: [{ tag: { id: 't1' } }] }, { id: 'p2', tags: [] }], error: null }] },
    })

    const result = await getRelatedPosts('p1', 2)
    expect(result.map((post) => post.id)).toEqual(['p2', 'p1'])
  })

  it('returns fallback when manual related posts error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_links: { select: [{ data: [{ to_post_id: 'p2' }] }] },
      posts: { select: [{ data: null, error: { code: 'ERR' } }, { data: { tags: [] } }] },
    })

    const result = await getRelatedPosts('p1', 2)
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns related posts for project', async () => {
    mockSupabase = createSupabaseMock({
      post_project_links: { select: [{ data: [{ post_id: 'p2' }, { post_id: 'p1' }] }] },
      posts: { select: [{ data: [{ id: 'p1', tags: [{ tag: { id: 't1' } }] }, { id: 'p2', tags: [] }], error: null }] },
    })

    const result = await getRelatedPostsForProject('pr1', 2)
    expect(result.map((post) => post.id)).toEqual(['p2', 'p1'])
  })

  it('returns empty list when project has no related posts', async () => {
    mockSupabase = createSupabaseMock({
      post_project_links: { select: [{ data: [] }] },
    })

    const result = await getRelatedPostsForProject('pr1', 2)
    expect(result).toEqual([])
  })

  it('returns empty list when related posts for project errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_project_links: { select: [{ data: [{ post_id: 'p1' }] }] },
      posts: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getRelatedPostsForProject('pr1', 1)
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns post relations', async () => {
    mockSupabase = createSupabaseMock({
      post_links: { select: [{ data: [{ to_post_id: 'p2' }, { to_post_id: 'p3' }] }] },
      post_project_links: { select: [{ data: [{ project_id: 'pr1' }] }] },
    })

    const result = await getPostRelations('p1')
    expect(result.relatedPostIds).toEqual(['p2', 'p3'])
    expect(result.relatedProjectIds).toEqual(['pr1'])
  })

  it('returns latest posts when tagIds are empty', async () => {
    mockSupabase = createSupabaseMock({
      posts: { select: [[{ count: 1 }, { data: [{ id: 'p1', tags: [] }], error: null }]] },
    })

    const result = await getRelatedPostsByTagsWithRandom([], 1)
    expect(result).toHaveLength(1)
  })

  it('returns latest posts when no related tag matches', async () => {
    mockSupabase = createSupabaseMock({
      post_tags: { select: [{ data: [] }] },
      posts: { select: [[{ count: 1 }, { data: [{ id: 'p1', tags: [] }], error: null }]] },
    })

    const result = await getRelatedPostsByTagsWithRandom(['t1'], 1)
    expect(result).toHaveLength(1)
  })

  it('returns empty list on related posts error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockSupabase = createSupabaseMock({
      post_tags: { select: [{ data: [{ post_id: 'p2' }] }] },
      posts: { select: [{ data: null, error: { code: 'ERR' } }] },
    })

    const result = await getRelatedPostsByTagsWithRandom(['t1'], 1)
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('returns random related posts', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)

    mockSupabase = createSupabaseMock({
      post_tags: { select: [{ data: [{ post_id: 'p2' }, { post_id: 'p3' }] }] },
      posts: { select: [{ data: [{ id: 'p2', tags: [{ tag: { id: 't1' } }] }], error: null }] },
    })

    const result = await getRelatedPostsByTagsWithRandom(['t1'], 1, 2)
    expect(result).toHaveLength(1)
  })
})
