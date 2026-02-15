import { createServerClient } from '@/lib/supabase/server'

export interface DashboardStats {
  counts: {
    posts: number
    projects: number
    inProgress: number
    tags: number
  }
  totalViews: number
  recentActivities: Array<{
    id: string
    type: 'post' | 'project'
    title: string
    date: string
  }>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerClient()

  const [
    { count: postCount },
    { count: projectCount },
    { count: inProgressCount },
    { count: tagCount },
    { data: postsForViews },
    { data: recentPosts },
    { data: recentProjects }
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('in_progress').select('*', { count: 'exact', head: true }),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('view_count'),
    supabase.from('posts').select('id, title, published_at').order('published_at', { ascending: false }).limit(3),
    supabase.from('projects').select('id, title, created_at').order('created_at', { ascending: false }).limit(3)
  ])

  const totalViews = ((postsForViews as Array<{ view_count: number }>) || []).reduce((acc, p) => acc + (p.view_count || 0), 0)

  const recentActivities: DashboardStats['recentActivities'] = [
    ...((recentPosts as Array<{ id: string; title: string; published_at: string | null }>) || []).map(p => ({ id: p.id, type: 'post' as const, title: p.title, date: p.published_at || '' })),
    ...((recentProjects as Array<{ id: string; title: string; created_at: string }>) || []).map(p => ({ id: p.id, type: 'project' as const, title: p.title, date: p.created_at || '' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return {
    counts: {
      posts: postCount || 0,
      projects: projectCount || 0,
      inProgress: inProgressCount || 0,
      tags: tagCount || 0
    },
    totalViews,
    recentActivities
  }
}

/**
 * Development helper to clear demo/sample data.
 * This is protected: it will refuse to run in production and requires a service role key.
 */
export async function resetDemoData(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('resetDemoData cannot be run in production')
  }

  const supabase = await createServerClient()

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from(t) as any).delete().neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      console.error(`Failed to truncate table ${t}:`, error)
      throw new Error(error.message || `Failed to clear table ${t}`)
    }
  }

  return true
}
