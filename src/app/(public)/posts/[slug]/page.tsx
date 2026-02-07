import Link from "next/link"
import { ArrowLeft, Calendar, Eye, Clock, Share2, Twitter, Facebook, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const post = {
  id: "1",
  title: "Next.js 15の新機能を試してみた",
  slug: "nextjs-15-features",
  content: `
    <h2>はじめに</h2>
    <p>Next.js 15がリリースされました。今回のアップデートでは、パフォーマンスの大幅な改善と、開発者体験の向上に焦点が当てられています。</p>

    <h2>主な新機能</h2>
    <h3>1. Partial Prerendering (PPR)</h3>
    <p>PPRは、静的コンテンツと動的コンテンツを1つのページ内でシームレスに組み合わせることができる新機能です。</p>
    <pre><code>export const experimental_ppr = true;</code></pre>

    <h3>2. Server Actionsの改善</h3>
    <p>Server Actionsがより安定し、エラーハンドリングが改善されました。</p>

    <h3>3. Turbopackの安定化</h3>
    <p>開発サーバーでTurbopackがデフォルトで使用されるようになり、ビルド速度が大幅に向上しました。</p>

    <h2>まとめ</h2>
    <p>Next.js 15は、これまでのバージョンと比較して大きな進化を遂げています。特にPPRは、これからのWebアプリケーション開発のスタンダードになる可能性を秘めています。</p>
  `,
  excerpt: "Next.js 15がリリースされたので、主要な新機能を実際に試してみました。",
  tags: ["Next.js", "React", "Web開発"],
  publishedAt: "2024-01-15",
  updatedAt: "2024-01-16",
  viewCount: 1234,
  readingTime: 5,
}

const tableOfContents = [
  { id: "introduction", title: "はじめに", level: 2 },
  { id: "main-features", title: "主な新機能", level: 2 },
  { id: "ppr", title: "1. Partial Prerendering (PPR)", level: 3 },
  { id: "server-actions", title: "2. Server Actionsの改善", level: 3 },
  { id: "turbopack", title: "3. Turbopackの安定化", level: 3 },
  { id: "conclusion", title: "まとめ", level: 2 },
]

const relatedPosts = [
  {
    id: "2",
    title: "TypeScriptの型パズルを解いてみる",
    slug: "typescript-type-puzzle",
    tags: ["TypeScript"],
  },
  {
    id: "4",
    title: "Tiptapでリッチテキストエディタを作る",
    slug: "tiptap-rich-editor",
    tags: ["Tiptap", "React"],
  },
]

export const metadata = {
  title: "Next.js 15の新機能を試してみた",
  description: "Next.js 15がリリースされたので、主要な新機能を実際に試してみました。",
}

export default function PostDetailPage() {
  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section container mx-auto py-8 px-6 md:px-12 lg:px-16">
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href="/posts" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            読み物一覧に戻る
          </Link>
        </Button>

        <div className="flex flex-col lg:flex-row gap-8">
        <article className="flex-1">
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime}分で読めます
              </span>
            </div>
          </header>

          <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-8 flex items-center justify-center">
            <span className="text-muted-foreground">カバー画像</span>
          </div>

          <div
            className="tiptap prose prose-lg dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Separator className="my-8" />

          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              シェア
            </span>
            <Button variant="outline" size="icon">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <LinkIcon className="h-4 w-4" />
            </Button>
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
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-medium">{relatedPost.title}</h3>
                </Link>
              ))}
            </CardContent>
          </Card>
        </article>

        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">目次</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-1 text-sm hover:text-primary transition-colors ${
                        item.level === 3 ? "pl-4 text-muted-foreground" : "font-medium"
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>
        </div>
      </div>
    </div>
  )
}
