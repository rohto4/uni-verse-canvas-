import Link from "next/link"
import { ArrowRight, Sparkles, BookOpen, Folder, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GradientAccent } from "@/components/common"

const recentPosts = [
  {
    id: "1",
    title: "Next.js 15の新機能を試してみた",
    slug: "nextjs-15-features",
    excerpt: "Next.js 15がリリースされたので、主要な新機能を実際に試してみました。",
    tags: ["Next.js", "React"],
    publishedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "TypeScriptの型パズルを解いてみる",
    slug: "typescript-type-puzzle",
    excerpt: "TypeScriptの高度な型機能を使った型パズルに挑戦してみました。",
    tags: ["TypeScript"],
    publishedAt: "2024-01-12",
  },
  {
    id: "3",
    title: "Supabaseで認証機能を実装する",
    slug: "supabase-auth-guide",
    excerpt: "Supabase Authを使った認証機能の実装方法を解説します。",
    tags: ["Supabase", "認証"],
    publishedAt: "2024-01-10",
  },
]

const recentProjects = [
  {
    id: "1",
    title: "UniVerse Canvas",
    slug: "universe-canvas",
    description: "個人用ポートフォリオ＆ブログシステム",
    tags: ["Next.js", "Supabase", "Tiptap"],
  },
  {
    id: "2",
    title: "Task Manager",
    slug: "task-manager",
    description: "シンプルなタスク管理アプリ",
    tags: ["React", "Firebase"],
  },
  {
    id: "3",
    title: "CLI Tool",
    slug: "cli-tool",
    description: "開発効率化のためのCLIツール",
    tags: ["Node.js", "TypeScript"],
  },
]

const inProgressItems = [
  {
    id: "1",
    title: "AI チャットボット開発",
    status: "in_progress" as const,
    progressRate: 65,
  },
  {
    id: "2",
    title: "モバイルアプリ（Flutter）",
    status: "paused" as const,
    progressRate: 30,
  },
]

const statusLabels = { not_started: { label: "未着手", className: "bg-muted text-muted-foreground" }, paused: { label: "中断中", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }, in_progress: { label: "進行中", className: "bg-primary/20 text-primary" }, completed: { label: "完了", className: "bg-accent text-accent-foreground" } }

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 lg:py-32 bg-sky">
        <GradientAccent position="bottom" type="section" thickness="2px" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Your Universe, Your Canvas</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              自分だけの宇宙を
              <br />
              <span className="text-primary">自由に描く</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              技術記事、プロジェクト、日々の学びを記録する場所。
              <br className="hidden sm:block" />
              思考を整理し、成長の軌跡を残していきます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/posts">
                  <BookOpen className="h-5 w-5" />
                  読み物を見る
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/works">
                  <Folder className="h-5 w-5" />
                  作ったものを見る
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-universe py-16 space-y-16">
        <section className="cloud-section py-12 max-w-7xl mx-auto">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">最新の読み物</h2>
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link href="/posts">
                すべて見る
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/posts/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {post.publishedAt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </section>

        <section className="cloud-section py-12 max-w-7xl mx-auto">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">最近の作ったもの</h2>
              <Button asChild variant="outline" size="sm" className="gap-1">
                <Link href="/works">
                  すべて見る
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      <Link href={`/works#${project.slug}`} className="hover:text-primary transition-colors">
                        {project.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="cloud-section py-12 max-w-7xl mx-auto">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                進行中のこと
              </h2>
              <Button asChild variant="outline" size="sm" className="gap-1">
                <Link href="/progress">
                  すべて見る
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgressItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge className={statusLabels[item.status].className}>
                        {statusLabels[item.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">進捗</span>
                        <span className="font-medium">{item.progressRate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${item.progressRate}%`,
                            background: "var(--card-accent-gradient)",
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
