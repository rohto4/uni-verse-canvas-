import { supabase } from './client'
import { createServerClient, createAdminClient } from './server'

/**
 * Client-side: Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })
  return { data, error }
}

/**
 * Client-side: Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (!error) {
    window.location.href = '/'
  }
  return { error }
}

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
  
  // Use admin client (service role) to check admins table
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
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
