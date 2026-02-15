'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { InProgress, InProgressWithProject, Project } from '@/types/database'
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

export type UpdateInProgressInput = Partial<CreateInProgressInput>

export async function getInProgressItems(
  status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
): Promise<InProgressWithProject[]> {
  const supabase = await createServerClient()

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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[] || []).map((item) => ({
    ...item,
    completedProject: item.completedProject as Project | undefined,
  })) as InProgressWithProject[]
}

export async function getInProgressById(id: string): Promise<InProgressWithProject | null> {
  const supabase = await createServerClient()

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = data as any
  return {
    ...item,
    completedProject: item.completedProject as Project | undefined,
  } as InProgressWithProject
}

export async function createInProgress(input: CreateInProgressInput): Promise<InProgress | null> {
  const supabase = await createServerClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('in_progress') as any)
    .insert(input)
    .select()
    
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
  const supabase = await createServerClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const supabase = await createServerClient()

  const { error } = await supabase.from('in_progress').delete().eq('id', id)

  if (error) {
    console.error('Error deleting in-progress item:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/in-progress')
}
