import { createServerClient } from '@/lib/supabase/server'

/**
 * Development helper to clear demo/sample data.
 * This is protected: it will refuse to run in production and requires a service role key.
 */
export async function resetDemoData(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('resetDemoData cannot be run in production')
  }

  const supabase = createServerClient()

  // Delete in order to respect foreign key constraints
  const tables = [
    'post_project_links',
    'post_links',
    'project_tags',
    'post_tags',
    'in_progress',
    'projects',
    'posts',
    'tags',
    'pages',
  ]

  for (const t of tables) {
    // Delete all rows. Service role key required for this operation.
    const { error } = await (supabase.from(t) as any)
      .delete()

    if (error) {
      console.error(`Failed to truncate table ${t}:`, error)
      throw new Error(error.message || `Failed to clear table ${t}`)
    }
  }

  return true
}
