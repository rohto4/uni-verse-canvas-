"use client"

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

const COOKIE_PREFIX = 'post_viewed_'
const ONE_DAY_SECONDS = 60 * 60 * 24

function hasCookie(name: string) {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').some((cookie) => cookie.startsWith(`${name}=`))
}

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; Max-Age=${ONE_DAY_SECONDS}; Path=/; SameSite=Lax`
}

export function PostViewCount({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    if (!postId) return

    const cookieName = `${COOKIE_PREFIX}${postId}`
    if (hasCookie(cookieName)) return

    setCookie(cookieName, '1')

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount((prev) => prev + 1)

    fetch('/api/posts/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId }),
    }).catch(() => {})
  }, [postId])

  return (
    <span className="flex items-center gap-1">
      <Eye className="h-4 w-4" />
      {count.toLocaleString()} views
    </span>
  )
}
