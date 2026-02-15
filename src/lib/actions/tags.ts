'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { Tag, TagWithCount } from '@/types/database'

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
