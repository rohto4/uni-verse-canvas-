import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getPostBySlug, getRelatedPosts } from '@/lib/actions/posts'
import { PostContent } from '@/components/posts/PostContent'
import { TableOfContents } from '@/components/posts/TableOfContents'

import { ShareButtons } from '@/components/posts/ShareButtons'

// Function to format date
function formatDate(dateString: string | null): string {
  if (!dateString) return '日付なし'
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Generate dynamic metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) {
    return {
      title: '記事が見つかりません',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://uni-verse-canvas.vercel.app'
  const ogImage = post.ogp_image || post.cover_image || `${siteUrl}/og-image.png`

  return {
    title: `${post.title} | UniVerse Canvas`,
    description: post.excerpt || 'UniVerse Canvasの読み物記事です。',
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/posts/${post.slug}`,
      siteName: 'UniVerse Canvas',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  }
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.id, 3)

  const readingTime = Math.ceil((post.content?.toString() || "").length / 600) // Simple reading time calculation

  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section container mx-auto py-8 px-6 md:px-12 lg:px-16">
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href="/posts" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            読み物一覧に戻る
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row gap-12">
          <article className="flex-1">
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" style={{ backgroundColor: tag.color, color: '#fff' }}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.published_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.view_count.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {readingTime}分で読めます
                </span>
              </div>
            </header>

            {post.cover_image && (
                <div className="aspect-video bg-muted rounded-lg mb-8 overflow-hidden relative">
                    <Image src={post.cover_image} alt={post.title} fill className="object-cover" priority />
                </div>
            )}

            {post.excerpt && (
              <div className="mb-8 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-muted-foreground italic">{post.excerpt}</p>
              </div>
            )}
            
            <PostContent content={post.content} />

            <Separator className="my-8" />

            <div className="mb-8">
              <ShareButtons url={`/posts/${post.slug}`} title={post.title} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>関連記事</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                        <Link
                        key={relatedPost.id}
                        href={`/posts/${relatedPost.slug}`}
                        className="block p-4 rounded-lg hover:bg-secondary transition-colors"
                        >
                        <div className="flex flex-wrap gap-2 mb-2">
                            {relatedPost.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                                {tag.name}
                            </Badge>
                            ))}
                        </div>
                        <h3 className="font-medium">{relatedPost.title}</h3>
                        </Link>
                    ))}
                </CardContent>
            </Card>

          </article>

          <aside className="hidden lg:block lg:w-72">
            <div className="sticky top-24">
              <TableOfContents content={post.content} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
