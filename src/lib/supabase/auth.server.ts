import 'server-only'

import { createAdminClient, createServerClient } from './server'

/**
 * Server-side: Retrieves the current session.
 */
export async function getSessionServer() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Server-side: Retrieves the current user.
 */
export async function getUserServer() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Server-side: Checks if a user is an administrator.
 */
export async function isAdminByUid(uid: string): Promise<boolean> {
  if (!uid) return false

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    // @ts-expect-error - admins table not yet in schema
    .from('admins')
    .select('user_id')
    .eq('user_id', uid)
    .limit(1)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error checking admin status:', error)
    }
    return false
  }

  return !!data
}
