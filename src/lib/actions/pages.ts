'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { Page } from '@/types/database'

export async function getPage(pageType: 'home' | 'about' | 'links'): Promise<Page | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('page_type', pageType)
    .single()

  if (error) {
    console.error(`Error fetching ${pageType} page:`, error)
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
