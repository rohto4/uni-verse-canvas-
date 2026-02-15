'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { Post, PostWithTags, Tag } from '@/types/database'
import { revalidatePath } from 'next/cache'

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

type PostTag = {
  post_id: string;
  tag: Tag;
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

  const supabase = await createServerClient()

  // Build base query
  let query = supabase
    .from('posts')
    .select(`
      *,
      tags:post_tags(
        tag:tags(*)
      )
    `, { count: 'exact' }) as any // eslint-disable-line @typescript-eslint/no-explicit-any

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
      const tagIds = tagData.map((t) => t.id as string)

      // Get posts that have ALL the specified tags
      const { data: postTagData } = await supabase
        .from('post_tags')
        .select('post_id')
        .in('tag_id', tagIds)

      if (postTagData) {
        // Count occurrences of each post_id
        const postCounts = postTagData.reduce((acc: Record<string, number>, pt: { post_id: string }) => {
          acc[pt.post_id] = (acc[pt.post_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Filter posts that have all tags (count equals number of requested tags)
        const matchingPostIds = Object.entries(postCounts)
          .filter(([, count]) => count === tagIds.length)
          .map(([postId]) => postId)

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

  const posts: PostWithTags[] = ((data as Array<Post & { tags: PostTag[] }>) || []).map((post) => ({
    ...post,
    tags: (post.tags as PostTag[]).map(pt => pt.tag).filter(Boolean),
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
  const supabase = await createServerClient()

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

  const postData = data as Post & { tags: PostTag[] }

  // Increment view count in background
  try {
    await supabase
      .from('posts')
      .update({ view_count: (postData.view_count || 0) + 1 })
      .eq('id', postData.id)
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }

  return {
    ...postData,
    tags: (postData.tags as PostTag[]).map((pt) => pt.tag).filter(Boolean),
  }
}

export async function getPostById(id: string): Promise<PostWithTags | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      tags:post_tags(
        tag:tags(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  const postData = data as Post & { tags: PostTag[] }

  return {
    ...postData,
    tags: (postData.tags as PostTag[]).map((pt) => pt.tag).filter(Boolean),
  }
}


export async function getRelatedPosts(postId: string, limit: number = 3): Promise<PostWithTags[]> {
  const supabase = await createServerClient()

  const { data: currentPost } = await supabase
    .from('posts')
    .select(`
      tags:post_tags(
        tag_id
      )
    `)
    .eq('id', postId)
    .single()

  const currentPostData = currentPost as { tags: Array<{ tag_id: string }> }
  if (!currentPostData || !currentPostData.tags.length) {
    return []
  }

  const tagIds = (currentPostData.tags as Array<{ tag_id: string }>).map((pt) => pt.tag_id)

  const { data: relatedPostTags } = await supabase
    .from('post_tags')
    .select('post_id')
    .in('tag_id', tagIds)
    .neq('post_id', postId)

  if (!relatedPostTags || relatedPostTags.length === 0) {
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postCounts = (relatedPostTags as any[]).reduce((acc: Record<string, number>, pt: {post_id: string}) => {
    acc[pt.post_id] = (acc[pt.post_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const relatedPostIds = (Object.entries(postCounts) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([postId]) => postId)

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

  return ((data as Array<Post & { tags: PostTag[] }>) || []).map((post) => ({
    ...post,
    tags: (post.tags as PostTag[]).map((pt) => pt.tag).filter(Boolean),
  }))
}

export async function getRelatedPostsByTagsWithRandom(
  tagIds: string[],
  limit: number = 3,
  candidateLimit: number = 10
): Promise<PostWithTags[]> {
  const supabase = await createServerClient()

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postCounts = (relatedPostTags as any[]).reduce((acc: Record<string, number>, pt: {post_id: string}) => {
    acc[pt.post_id] = (acc[pt.post_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const candidatePostIds = (Object.entries(postCounts) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, candidateLimit)
    .map(([postId]) => postId)

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

  return ((data as Array<Post & { tags: PostTag[] }>) || []).map((post) => ({
    ...post,
    tags: (post.tags as PostTag[]).map((pt) => pt.tag).filter(Boolean),
  }))
}

// --- Schemas & Types ---

// Base schema without refinements so we can derive partial/extended variants
const BasePostSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  slug: z.string().min(1, 'スラグは必須です').regex(/^[a-zA-Z0-9-]+$/, 'スラグは半角英数字とハイフンのみ使用可能です'),
  content: z.any(),
  excerpt: z.string().optional().nullable(),
  status: z.enum(['draft', 'scheduled', 'published']),
  published_at: z.string().optional().nullable(),
  cover_image: z.string().optional().nullable(),
  ogp_image: z.string().optional().nullable(),
})

// Create schema includes tags and a refinement for scheduled posts
const CreatePostSchema = BasePostSchema.extend({
  tags: z.array(z.string()).default([]),
}).refine((data) => {
  if (data.status === 'scheduled') {
    if (!data.published_at) return false
    return new Date(data.published_at) > new Date()
  }
  return true
}, {
  message: '予約投稿の場合は未来の日時を指定してください',
  path: ['published_at'],
})

// Update schema is a partial of the base (no refine) and allows optional tags
const UpdatePostSchema = BasePostSchema.partial().extend({
  tags: z.array(z.string()).optional()
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>

export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// --- Actions ---

export async function createPost(input: CreatePostInput): Promise<ActionResponse<PostWithTags>> {
  const result = CreatePostSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: (result.error.issues[0]).message }
  }

  const { tags, ...postData } = result.data
  const supabase = await createServerClient()

  // 公開日時の自動設定
  let published_at = postData.published_at
  if (postData.status === 'published' && !published_at) {
    published_at = new Date().toISOString()
  }

  try {
    // 1. 記事本体の作成
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error: postError } = await (supabase.from('posts') as any)
      .insert({
        ...postData,
        published_at,
        view_count: 0
      }) 
      .select()
      .single()

    if (postError) {
      if (postError.code === '23505') { // Unique violation
        return { success: false, error: 'このスラグは既に使用されています' }
      }
      throw postError
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdPost = post as any

    // 2. タグの紐付け（トランザクション補償付き）
    if (tags && tags.length > 0) {
      const postTags = tags.map(tagId => ({
        post_id: createdPost.id,
        tag_id: tagId
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: tagError } = await (supabase.from('post_tags') as any)
        .insert(postTags)

      if (tagError) {
        // 補償処理: タグ付けに失敗した場合、作成した記事を削除してロールバックする
        console.error('Failed to add tags, rolling back post creation:', tagError)
        await supabase.from('posts').delete().eq('id', createdPost.id)
        throw new Error('タグの設定に失敗したため、処理を中断しました')
      }
    }

    revalidatePath('/posts')
    
    // 作成された完全なデータを取得して返す
    const newPost = await getPostBySlug(createdPost.slug)
    if (!newPost) throw new Error('Failed to fetch created post')
    
    return { success: true, data: newPost }

  } catch (error) {
    const err = error as Error
    console.error('Error creating post:', err)
    return { success: false, error: err.message || '記事の作成に失敗しました' }
  }
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<ActionResponse<PostWithTags>> {
  const result = UpdatePostSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: (result.error.issues[0]).message }
  }

  const supabase = await createServerClient()
  const { tags, ...updateData } = result.data

  // 現在のデータを取得（ロールバック用）
  const { data: currentPost, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !currentPost) {
    return { success: false, error: '記事が見つかりません' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const postToUpdate = currentPost as any

  // 現在のタグを取得（ロールバック用）
  const { data: currentTags } = await supabase
    .from('post_tags')
    .select('tag_id')
    .eq('post_id', id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oldTagIds = (currentTags as any[])?.map((t) => t.tag_id) || []

  // 公開日時の調整
  let published_at = updateData.published_at
  if (updateData.status === 'published' && postToUpdate.status !== 'published') {
     published_at = postToUpdate.published_at || new Date().toISOString()
  } else if (updateData.status && !published_at) {
     published_at = postToUpdate.published_at
  } else if (updateData.status === undefined && !published_at) {
     published_at = postToUpdate.published_at
  }

  try {
    // 1. 記事本体の更新
    const { data: updatedPostData, error: updateError } = await supabase
      .from('posts')
      .update({
        ...updateData,
        published_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === '23505') {
        return { success: false, error: 'このスラグは既に使用されています' }
      }
      throw updateError
    }

    const updatedPost = updatedPostData as Post

    // 2. タグの更新（トランザクション補償付き）
    if (tags !== undefined) {
      // 一旦全削除して再挿入
      const { error: deleteTagsError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', id)

      if (deleteTagsError) {
        throw new Error('タグ更新の前処理に失敗しました')
      }

      if (tags.length > 0) {
        const postTags: Array<{ post_id: string; tag_id: string }> = tags.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }))

        const { error: insertTagsError } = await supabase
          .from('post_tags')
          .insert(postTags)

        if (insertTagsError) {
          // 補償処理: タグ更新失敗時、記事とタグを元の状態に戻す
          console.error('Failed to update tags, rolling back:', insertTagsError)

          // 記事データのロールバック
          await supabase.from('posts').update(postToUpdate).eq('id', id)

          // タグデータのロールバック（削除してしまったので元に戻す）
          if (oldTagIds.length > 0) {
             const rollbackTags: Array<{ post_id: string; tag_id: string }> = oldTagIds.map((tid: string) => ({ post_id: id, tag_id: tid }))
             await supabase.from('post_tags').insert(rollbackTags)
          }
          
          throw new Error('タグの更新に失敗したため、変更を元に戻しました')
        }
      }
    }

    revalidatePath('/posts')
    revalidatePath(`/posts/${updatedPost.slug}`)

    const resultPost = await getPostBySlug(updatedPost.slug)
    if (!resultPost) throw new Error('Failed to fetch updated post')

    return { success: true, data: resultPost }

  } catch (error) {
    const err = error as Error
    console.error('Error updating post:', err)
    return { success: false, error: err.message || '記事の更新に失敗しました' }
  }
}

export async function deletePost(id: string): Promise<ActionResponse<void>> {
  const supabase = await createServerClient()
  
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      
    if (error) throw error
    
    revalidatePath('/posts')
    return { success: true }
  } catch (error) {
    const err = error as Error;
    console.error('Error deleting post:', err)
    return { success: false, error: err.message || '記事の削除に失敗しました' }
  }
}
