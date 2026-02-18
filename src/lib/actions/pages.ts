'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Page } from '@/types/database'

export type PageType = 'home' | 'about' | 'links'

export interface UpsertPageInput {
  page_type: PageType
  title: string
  content: Record<string, unknown>
  metadata: Record<string, unknown>
}

export async function getPage(pageType: PageType): Promise<Page | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('page_type', pageType)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error(`Error fetching ${pageType} page:`, error)
    }
    return null
  }

  return data
}

export async function getAllPages(): Promise<Page[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('page_type')

  if (error) {
    console.error('Error fetching pages:', error)
    return []
  }

  return data || []
}

export async function upsertPage(input: UpsertPageInput): Promise<Page | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('pages')
    .upsert(input, { onConflict: 'page_type' })
    .select()
    .single()

  if (error) {
    console.error('Error upserting page:', error)
    return null
  }

  if (input.page_type === 'about') {
    revalidatePath('/about')
  }

  if (input.page_type === 'links') {
    revalidatePath('/links')
  }

  if (input.page_type === 'home') {
    revalidatePath('/')
  }

  return data
}
