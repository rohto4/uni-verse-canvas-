import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRelatedPostsByTagsWithRandom } from '@/lib/actions/posts'
import type { Tag } from '@/types/database'

interface RelatedPostsProps {
  tags: Tag[]
  limit?: number
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export async function RelatedPosts({ tags, limit = 3 }: RelatedPostsProps) {
  const tagIds = tags.map(tag => tag.id)
  const relatedPosts = await getRelatedPostsByTagsWithRandom(tagIds, limit)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">関連記事</h2>
        <Link
          href="/posts"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          もっと見る →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Link key={post.id} href={`/posts/${post.slug}`} className="block">
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt || 'No excerpt available.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
