'use client'

import { useMemo } from 'react'
import type { JSONContent } from '@tiptap/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Heading {
  id: string
  level: number
  text: string
}

interface TableOfContentsProps {
  content: JSONContent
}

// Helper to create a slug from text
const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Recursive function to extract headings
const getHeadings = (node: JSONContent): Heading[] => {
  if (node.type === 'heading' && (node.attrs?.level === 2 || node.attrs?.level === 3)) {
    const text = node.content?.map(n => n.text || '').join('') || ''
    return [{
      id: slugify(text),
      level: node.attrs.level,
      text: text,
    }]
  }
  if (!node.content) {
    return []
  }
  return node.content.flatMap(getHeadings)
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    if (!content) return []
    return getHeadings(content)
  }, [content])

  if (headings.length === 0) {
    return null // Don't render if no headings
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">目次</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-2">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block text-sm hover:text-primary transition-colors ${
                heading.level === 3 ? 'pl-4 text-muted-foreground' : 'font-medium'
              }`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                })
              }}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}
