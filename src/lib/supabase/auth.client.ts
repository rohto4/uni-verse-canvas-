"use client"

import { supabase } from './client'

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
