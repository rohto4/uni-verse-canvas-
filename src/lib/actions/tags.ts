'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { Tag, TagWithCount } from '@/types/database'
import { revalidatePath } from 'next/cache'

export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

const CreateTagSchema = z.object({
  name: z.string().min(1, 'タグ名は必須です').max(50, 'タグ名は50文字以内で入力してください'),
  slug: z.string().min(1, 'スラッグは必須です').regex(/^[a-z0-9-]+$/, 'スラッグは半角英数字とハイフンのみ使用可能です'),
  description: z.string().optional().nullable(),
  color: z.string().optional().default('#6B7280'),
})

const UpdateTagSchema = CreateTagSchema.partial()

export async function getTags(): Promise<Tag[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return data || []
}

export async function getTagsWithCount(): Promise<TagWithCount[]> {
  const supabase = await createServerClient()

  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (tagsError || !tags) {
    console.error('Error fetching tags:', tagsError)
    return []
  }

  // Get counts for each tag
  const tagsWithCount = await Promise.all(
    tags.map(async (tag: Tag) => {
      const [{ count: postCount }, { count: projectCount }] = await Promise.all([
        supabase.from('post_tags').select('*', { count: 'exact', head: true }).eq('tag_id', tag.id),
        supabase.from('project_tags').select('*', { count: 'exact', head: true }).eq('tag_id', tag.id),
      ])

      return {
        ...tag,
        postCount: postCount || 0,
        projectCount: projectCount || 0,
      }
    })
  )

  return tagsWithCount
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching tag:', error)
    return null
  }

  return data
}

export async function createTag(input: z.infer<typeof CreateTagSchema>): Promise<ActionResponse<Tag>> {
  const result = CreateTagSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: result.data.name,
      slug: result.data.slug,
      description: result.data.description ?? null,
      color: result.data.color || '#6B7280',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: '同じタグ名またはスラッグが既に存在します' }
    }
    console.error('Error creating tag:', error)
    return { success: false, error: 'タグの作成に失敗しました' }
  }

  revalidatePath('/posts')
  revalidatePath('/works')
  return { success: true, data: data as Tag }
}

export async function updateTag(id: string, input: z.infer<typeof UpdateTagSchema>): Promise<ActionResponse<Tag>> {
  const result = UpdateTagSchema.safeParse(input)
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message }
  }

  const supabase = await createServerClient()

  const updateData: Partial<Tag> = {}
  if (result.data.name !== undefined) updateData.name = result.data.name
  if (result.data.slug !== undefined) updateData.slug = result.data.slug
  if (result.data.description !== undefined) updateData.description = result.data.description ?? null
  /* c8 ignore next */
  if (result.data.color !== undefined) updateData.color = result.data.color || '#6B7280'

  const { data, error } = await supabase
    .from('tags')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: '同じタグ名またはスラッグが既に存在します' }
    }
    console.error('Error updating tag:', error)
    return { success: false, error: 'タグの更新に失敗しました' }
  }

  revalidatePath('/posts')
  revalidatePath('/works')
  return { success: true, data: data as Tag }
}

export async function deleteTag(id: string): Promise<ActionResponse<void>> {
  const supabase = await createServerClient()

  try {
    const { error: postTagError } = await supabase
      .from('post_tags')
      .delete()
      .eq('tag_id', id)

    if (postTagError) {
      throw postTagError
    }

    const { error: projectTagError } = await supabase
      .from('project_tags')
      .delete()
      .eq('tag_id', id)

    if (projectTagError) {
      throw projectTagError
    }

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    revalidatePath('/posts')
    revalidatePath('/works')
    return { success: true }
  } catch (error) {
    console.error('Error deleting tag:', error)
    return { success: false, error: 'タグの削除に失敗しました' }
  }
}
