import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PostWithTags } from '@/types/database'

interface PostsListProps {
  posts: PostWithTags[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function PostsList({ posts }: PostsListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">記事が見つかりませんでした。</p>
        <p className="text-sm text-muted-foreground mt-2">
          フィルタ条件を変更してみてください。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
            <CardTitle>
              <Link
                href={`/posts/${post.slug}`}
                className="hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span>{formatDate(post.published_at || post.created_at)}</span>
              <span>{post.view_count.toLocaleString()} views</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
