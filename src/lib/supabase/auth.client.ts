"use client"

import { getSupabaseClient } from './client'

/**
 * Client-side: Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = getSupabaseClient()
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
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (!error) {
    window.location.href = '/'
  }
  return { error }
}
