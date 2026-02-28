import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type TrackViewPayload = {
  postId?: string
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  // CSRF: reject requests from external origins
  const host = request.headers.get('host')
  const origin = request.headers.get('origin')
  if (origin && host && !origin.includes(host)) {
    return NextResponse.json({ success: false }, { status: 403 })
  }

  let payload: TrackViewPayload

  try {
    payload = (await request.json()) as TrackViewPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const postId = payload.postId
  if (!postId || typeof postId !== 'string') {
    return NextResponse.json({ success: false, error: 'postId is required' }, { status: 400 })
  }

  // Validate postId is a proper UUID to prevent injection/DoS
  if (!UUID_REGEX.test(postId)) {
    return NextResponse.json({ success: false, error: 'Invalid postId' }, { status: 400 })
  }

  const supabase = await createServerClient()

  const { data: currentPost, error: fetchError } = await supabase
    .from('posts')
    .select('view_count')
    .eq('id', postId)
    .single()

  if (fetchError || !currentPost) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }

  const nextCount = (currentPost.view_count || 0) + 1
  const { error: updateError } = await supabase
    .from('posts')
    .update({ view_count: nextCount })
    .eq('id', postId)

  if (updateError) {
    return NextResponse.json({ success: false, error: 'Failed to update view count' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
