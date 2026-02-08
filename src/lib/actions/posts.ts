'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { PostWithTags } from '@/types/database'

export interface GetPostsParams {
  page?: number
  limit?: number
  tags?: string[]
  search?: string
  sort?: 'latest' | 'oldest' | 'popular'
  status?: 'published' | 'draft' | 'scheduled'
}

export interface PaginatedPosts {
  posts: PostWithTags[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function getPosts(params: GetPostsParams = {}): Promise<PaginatedPosts> {
  const {
    page = 1,
    limit = 10,
    tags = [],
    search = '',
    sort = 'latest',
    status = 'published',
  } = params

  const supabase = createServerClient()

  // Build base query
  let query = supabase
    .from('posts')
    .select(`
      *,
      tags:post_tags(
        tag:tags(*)
      )
    `, { count: 'exact' })

  // Status filter - for published, also check scheduled posts
  if (status === 'published') {
    query = query.or(`status.eq.published,and(status.eq.scheduled,published_at.lte.${new Date().toISOString()})`)
  } else {
    query = query.eq('status', status)
  }

  // Tag filter (AND search - post must have ALL specified tags)
  if (tags.length > 0) {
    const tagSlugs = tags.map(t => t.toLowerCase())

    // First get tag IDs from slugs
    const { data: tagData } = await supabase
      .from('tags')
      .select('id, slug')
      .in('slug', tagSlugs)

    if (tagData && tagData.length > 0) {
      const tagIds = (tagData as any[]).map((t: any) => t.id)

      // Get posts that have ALL the specified tags
      const { data: postTagData } = await supabase
        .from('post_tags')
        .select('post_id')
        .in('tag_id', tagIds)

      if (postTagData) {
        // Count occurrences of each post_id
        const postCounts = (postTagData as any[]).reduce((acc: Record<string, number>, pt: any) => {
          acc[pt.post_id] = (acc[pt.post_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Filter posts that have all tags (count equals number of requested tags)
        const matchingPostIds = Object.entries(postCounts)
          .filter(([_, count]) => count === tagIds.length)
          .map(([postId, _]) => postId)

        if (matchingPostIds.length === 0) {
          // No posts match all tags
          return {
            posts: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalCount: 0,
              hasNext: false,
              hasPrev: false,
            },
          }
        }

        query = query.in('id', matchingPostIds)
      }
    }
  }

  // Search filter (title, excerpt, and content)
  if (search) {
    // Limit search length to prevent performance issues
    const searchTerm = search.slice(0, 20)
    query = query.or(`title.ilike.*${searchTerm}*,excerpt.ilike.*${searchTerm}*,content::text.ilike.*${searchTerm}*`)
  }

  // Sorting
  switch (sort) {
    case 'oldest':
      query = query.order('published_at', { ascending: true })
      break
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
    case 'latest':
    default:
      query = query.order('published_at', { ascending: false })
      break
  }

  // Get total count
  const { count: totalCount } = await query

  // Pagination
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return {
      posts: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalCount: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  }

  const posts: PostWithTags[] = ((data as any[]) || []).map((post: any) => ({
    ...post,
    tags: post.tags.map((pt: any) => pt.tag).filter(Boolean),
  }))

  const totalPages = Math.ceil((totalCount || 0) / limit)

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: totalCount || 0,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

export async function getPostBySlug(slug: string): Promise<PostWithTags | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      tags:post_tags(
        tag:tags(*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  const postData = data as any

  // Increment view count in background
  try {
    await supabase
      .from('posts')
      .update({ view_count: (postData.view_count || 0) + 1 } as any)
      .eq('id', postData.id)
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }

  return {
    ...postData,
    tags: postData.tags.map((pt: any) => pt.tag).filter(Boolean),
  }
}

export async function getRelatedPosts(postId: string, limit: number = 3): Promise<PostWithTags[]> {
  const supabase = createServerClient()

  const { data: currentPost } = await supabase
    .from('posts')
    .select(`
      tags:post_tags(
        tag_id
      )
    `)
    .eq('id', postId)
    .single()

  const currentPostData = currentPost as any
  if (!currentPostData || !currentPostData.tags.length) {
    return []
  }

  const tagIds = currentPostData.tags.map((pt: any) => pt.tag_id)

  const { data: relatedPostTags } = await supabase
    .from('post_tags')
    .select('post_id')
    .in('tag_id', tagIds)
    .neq('post_id', postId)

  if (!relatedPostTags || relatedPostTags.length === 0) {
    return []
  }

  const postCounts = (relatedPostTags as any[]).reduce((acc: Record<string, number>, pt: any) => {
    acc[pt.post_id] = (acc[pt.post_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const relatedPostIds = Object.entries(postCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([postId, _]) => postId)

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      tags:post_tags(
        tag:tags(*)
      )
    `)
    .in('id', relatedPostIds)
    .eq('status', 'published')
    .limit(limit)

  if (error) {
    console.error('Error fetching related posts:', error)
    return []
  }

  return ((data as any[]) || []).map((post: any) => ({
    ...post,
    tags: post.tags.map((pt: any) => pt.tag).filter(Boolean),
  }))
}

export async function getRelatedPostsByTagsWithRandom(
  tagIds: string[],
  limit: number = 3,
  candidateLimit: number = 10
): Promise<PostWithTags[]> {
  const supabase = createServerClient()

  if (tagIds.length === 0) {
    const result = await getPosts({ limit, sort: 'latest', status: 'published' })
    return result.posts
  }

  const { data: relatedPostTags } = await supabase
    .from('post_tags')
    .select('post_id')
    .in('tag_id', tagIds)

  if (!relatedPostTags || relatedPostTags.length === 0) {
    const result = await getPosts({ limit, sort: 'latest', status: 'published' })
    return result.posts
  }

  const postCounts = (relatedPostTags as any[]).reduce((acc: Record<string, number>, pt: any) => {
    acc[pt.post_id] = (acc[pt.post_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const candidatePostIds = Object.entries(postCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, candidateLimit)
    .map(([postId, _]) => postId)

  const shuffled = candidatePostIds.sort(() => Math.random() - 0.5)
  const selectedPostIds = shuffled.slice(0, limit)

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      tags:post_tags(
        tag:tags(*)
      )
    `)
    .in('id', selectedPostIds)
    .eq('status', 'published')

  if (error) {
    console.error('Error fetching related posts:', error)
    return []
  }

  return ((data as any[]) || []).map((post: any) => ({
    ...post,
    tags: post.tags.map((pt: any) => pt.tag).filter(Boolean),
  }))
}
