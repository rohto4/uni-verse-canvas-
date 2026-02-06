import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data
const posts = [
  {
    id: "1",
    title: "Next.js 15の新機能を試してみた",
    slug: "nextjs-15-features",
    excerpt: "Next.js 15がリリースされたので、主要な新機能を実際に試してみました。App RouterやServer Actionsの改善点など、実践的な内容をまとめています。",
    tags: ["Next.js", "React", "Web開発"],
    publishedAt: "2024-01-15",
    viewCount: 1234,
  },
  {
    id: "2",
    title: "TypeScriptの型パズルを解いてみる",
    slug: "typescript-type-puzzle",
    excerpt: "TypeScriptの高度な型機能を使った型パズルに挑戦してみました。Conditional Types、Template Literal Types、Mapped Typesを駆使しています。",
    tags: ["TypeScript", "プログラミング"],
    publishedAt: "2024-01-12",
    viewCount: 856,
  },
  {
    id: "3",
    title: "Supabaseで認証機能を実装する",
    slug: "supabase-auth-guide",
    excerpt: "Supabase Authを使った認証機能の実装方法を解説します。Google OAuth、メール認証、Row Level Securityの設定まで網羅しています。",
    tags: ["Supabase", "認証", "バックエンド"],
    publishedAt: "2024-01-10",
    viewCount: 2341,
  },
  {
    id: "4",
    title: "Tiptapでリッチテキストエディタを作る",
    slug: "tiptap-rich-editor",
    excerpt: "Tiptapを使ってカスタマイズ可能なリッチテキストエディタを作成する方法を紹介します。拡張機能の作り方も解説しています。",
    tags: ["Tiptap", "React", "エディタ"],
    publishedAt: "2024-01-08",
    viewCount: 1567,
  },
  {
    id: "5",
    title: "Tailwind CSSのベストプラクティス",
    slug: "tailwind-best-practices",
    excerpt: "Tailwind CSSを使った効率的なスタイリング方法とベストプラクティスをまとめました。コンポーネント設計からパフォーマンス最適化まで。",
    tags: ["Tailwind CSS", "CSS", "デザイン"],
    publishedAt: "2024-01-05",
    viewCount: 3456,
  },
]

const allTags = [
  { name: "Next.js", count: 5 },
  { name: "TypeScript", count: 8 },
  { name: "React", count: 12 },
  { name: "Supabase", count: 3 },
  { name: "Tailwind CSS", count: 4 },
  { name: "Web開発", count: 7 },
  { name: "プログラミング", count: 6 },
]

export const metadata = {
  title: "読み物",
  description: "技術記事や日々の学びを記録しています。",
}

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">読み物</h1>
          <p className="text-muted-foreground">
            技術記事や日々の学びを記録しています。
          </p>
        </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="記事を検索..."
              className="pl-10"
            />
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
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
                    <span>{post.publishedAt}</span>
                    <span>{post.viewCount.toLocaleString()} views</span>
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

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled>
              前へ
            </Button>
            <Button variant="outline" className="bg-primary/10">
              1
            </Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">
              次へ
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-80">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">タグで絞り込み</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag.name}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                    >
                      {tag.name}
                      <span className="ml-1 text-muted-foreground">({tag.count})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
      </div>
    </div>
  )
}
