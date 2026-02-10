'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { InProgress, InProgressWithProject } from '@/types/database'
import { revalidatePath } from 'next/cache'

export interface CreateInProgressInput {
  title: string
  description: string
  status: 'not_started' | 'paused' | 'in_progress' | 'completed'
  progress_rate: number
  started_at: string | null
  completed_at: string | null
  completed_project_id: string | null
  notes: string | null
}

export interface UpdateInProgressInput extends Partial<CreateInProgressInput> {}

export async function getInProgressItems(
  status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
): Promise<InProgressWithProject[]> {
  const supabase = createServerClient()

  let query = supabase
    .from('in_progress')
    .select(`
      *,
      completedProject:completed_project_id(*)
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching in-progress items:', error)
    return []
  }

  return ((data as any[]) || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
    progress_rate: item.progress_rate,
    started_at: item.started_at,
    completed_at: item.completed_at,
    completed_project_id: item.completed_project_id,
    notes: item.notes,
    created_at: item.created_at,
    updated_at: item.updated_at,
    completedProject: item.completedProject || undefined,
  }))
}

export async function getInProgressById(id: string): Promise<InProgressWithProject | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('in_progress')
    .select(`
      *,
      completedProject:completed_project_id(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching in-progress item:', error)
    return null
  }

  const itemData = data as any

  return {
    id: itemData.id,
    title: itemData.title,
    description: itemData.description,
    status: itemData.status,
    progress_rate: itemData.progress_rate,
    started_at: itemData.started_at,
    completed_at: itemData.completed_at,
    completed_project_id: itemData.completed_project_id,
    notes: itemData.notes,
    created_at: itemData.created_at,
    updated_at: itemData.updated_at,
    completedProject: itemData.completedProject || undefined,
  }
}

export async function createInProgress(input: CreateInProgressInput): Promise<InProgress | null> {
  const supabase = createServerClient()

  const { data, error } = await (supabase.from('in_progress') as any)
    .insert(input)
    .select()
    // may return array; don't force .single() to avoid coercion errors when RLS blocks
    

  if (error) {
    console.error('Error creating in-progress item:', error)
    return null
  }

  const created = Array.isArray(data) ? data[0] : data

  revalidatePath('/admin/in-progress')
  return created as InProgress
}

export async function updateInProgress(
  id: string,
  input: UpdateInProgressInput
): Promise<InProgress | null> {
  const supabase = createServerClient()

  const { data, error } = await (supabase.from('in_progress') as any)
    .update(input)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating in-progress item:', error)
    return null
  }

  const updated = Array.isArray(data) ? data[0] : data

  revalidatePath('/admin/in-progress')
  return updated as InProgress
}

export async function deleteInProgress(id: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase.from('in_progress').delete().eq('id', id)

  if (error) {
    console.error('Error deleting in-progress item:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/in-progress')
}
