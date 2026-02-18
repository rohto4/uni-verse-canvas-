import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Post, Project, InProgress, Tag } from '@/types/database'

interface BackupResult {
  posts?: Post[]
  projects?: Project[]
  in_progress?: InProgress[]
  tags?: Tag[]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const type = body.type || 'full'
    const format = body.format || 'json'

    const supabase = await createServerClient()

    const result: BackupResult = {}

    if (type === 'full' || type === 'posts') {
      const { data: posts } = await supabase.from('posts').select('*')
      result.posts = (posts || []) as Post[]
    }
    if (type === 'full' || type === 'projects') {
      const { data: projects } = await supabase.from('projects').select('*')
      result.projects = (projects || []) as Project[]
    }
    if (type === 'full' || type === 'in_progress') {
      const { data: inProgress } = await supabase.from('in_progress').select('*')
      result.in_progress = (inProgress || []) as InProgress[]
    }
    if (type === 'full' || type === 'tags') {
      const { data: tags } = await supabase.from('tags').select('*')
      result.tags = (tags || []) as Tag[]
    }

    if (format === 'json') {
      const json = JSON.stringify(result, null, 2)
      const filename = `backup_${type}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`
      return new Response(json, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // For markdown, only support posts export as simple conversion
    if (format === 'markdown' && (type === 'posts' || type === 'full')) {
      const posts = result.posts as Post[]
      const md = posts.map((p: Post) => `# ${p.title}\n\n${p.excerpt || ''}\n\n---\n`).join('\n')
      const filename = `posts_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.md`
      return new Response(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Backup export failed:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
