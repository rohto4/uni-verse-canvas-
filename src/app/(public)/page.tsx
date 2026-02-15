import Link from "next/link"
import { ArrowRight, Sparkles, BookOpen, Folder, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GradientAccent } from "@/components/common"
import { getPosts } from "@/lib/actions/posts"
import { getProjects } from "@/lib/actions/projects"
import { getInProgressItems } from "@/lib/actions/in-progress"

const statusLabels: Record<string, { label: string, className: string }> = { 
  not_started: { label: "未着手", className: "bg-muted text-muted-foreground" }, 
  paused: { label: "中断中", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }, 
  in_progress: { label: "進行中", className: "bg-primary/20 text-primary" }, 
  completed: { label: "完了", className: "bg-accent text-accent-foreground" } 
}

function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function HomePage() {
  const [{ posts: recentPosts }, { projects: recentProjects }, inProgressItems] = await Promise.all([
    getPosts({ limit: 3, status: 'published' }),
    getProjects({ limit: 3 }),
    getInProgressItems('in_progress').then(items => items.slice(0, 2))
  ])

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
                  < BookOpen className="h-5 w-5" />
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
                      <Badge key={tag.id} variant="secondary" className="text-xs" style={{ backgroundColor: tag.color, color: '#fff' }}>
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/posts/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {formatDate(post.published_at)}
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
                      <Link href={`/works/${project.slug}`} className="hover:text-primary transition-colors">
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
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
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
                      <Badge className={statusLabels[item.status]?.className || ""}>
                        {statusLabels[item.status]?.label || item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">進捗</span>
                        <span className="font-medium">{item.progress_rate}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${item.progress_rate}%`,
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
