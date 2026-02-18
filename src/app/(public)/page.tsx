import Link from "next/link"
import { ArrowRight, Sparkles, BookOpen, Folder, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GradientAccent } from "@/components/common"
import { getPosts } from "@/lib/actions/posts"
import { getProjects } from "@/lib/actions/projects"
import { getInProgressItems } from "@/lib/actions/in-progress"
import { getPage } from "@/lib/actions/pages"

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

type HomeMetadata = {
  heroBadge?: string
  heroTitle?: string
  heroSubtitle?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  sections?: {
    postsTitle?: string
    projectsTitle?: string
    inProgressTitle?: string
  }
}

const defaultMetadata = {
  heroBadge: "Your Universe, Your Canvas",
  heroTitle: "自分だけの宇宙を\n自由に描く",
  heroSubtitle: "技術記事、プロジェクト、日々の学びを記録する場所。\n思考を整理し、成長の軌跡を残していきます。",
  primaryCtaLabel: "読み物を見る",
  primaryCtaHref: "/posts",
  secondaryCtaLabel: "作ったものを見る",
  secondaryCtaHref: "/works",
  sections: {
    postsTitle: "最新の読み物",
    projectsTitle: "最近の作ったもの",
    inProgressTitle: "進行中のこと",
  },
}

export default async function HomePage() {
  const [homePage, { posts: recentPosts }, { projects: recentProjects }, inProgressItems] = await Promise.all([
    getPage('home'),
    getPosts({ limit: 3, status: 'published' }),
    getProjects({ limit: 3 }),
    getInProgressItems('in_progress').then(items => items.slice(0, 2)),
  ])

  const metadata = (homePage?.metadata || {}) as HomeMetadata
  const heroBadge = metadata.heroBadge || defaultMetadata.heroBadge
  const heroTitle = metadata.heroTitle || defaultMetadata.heroTitle
  const heroSubtitle = metadata.heroSubtitle || defaultMetadata.heroSubtitle
  const primaryCtaLabel = metadata.primaryCtaLabel || defaultMetadata.primaryCtaLabel
  const primaryCtaHref = metadata.primaryCtaHref || defaultMetadata.primaryCtaHref
  const secondaryCtaLabel = metadata.secondaryCtaLabel || defaultMetadata.secondaryCtaLabel
  const secondaryCtaHref = metadata.secondaryCtaHref || defaultMetadata.secondaryCtaHref
  const sectionTitles = {
    posts: metadata.sections?.postsTitle || defaultMetadata.sections.postsTitle,
    projects: metadata.sections?.projectsTitle || defaultMetadata.sections.projectsTitle,
    inProgress: metadata.sections?.inProgressTitle || defaultMetadata.sections.inProgressTitle,
  }
  const heroTitleLines = heroTitle.split("\n")
  const heroSubtitleLines = heroSubtitle.split("\n")

  return (
    <div className="min-h-screen">
      <section className="relative py-20 lg:py-32 bg-sky">
        <GradientAccent position="bottom" type="section" thickness="2px" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{heroBadge}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {heroTitleLines.map((line, index, arr) => (
                <span key={`${line}-${index}`}>
                  {index === arr.length - 1 ? (
                    <span className="text-primary">{line}</span>
                  ) : (
                    line
                  )}
                  {index < arr.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {heroSubtitleLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < heroSubtitleLines.length - 1 && <br className="hidden sm:block" />}
                </span>
              ))}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href={primaryCtaHref}>
                  < BookOpen className="h-5 w-5" />
                  {primaryCtaLabel}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href={secondaryCtaHref}>
                  <Folder className="h-5 w-5" />
                  {secondaryCtaLabel}
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
            <h2 className="text-2xl font-bold">{sectionTitles.posts}</h2>
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link href="/posts">
                すべて見る
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={`${post.title}を読む`}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs" style={{ backgroundColor: tag.color, color: '#fff' }}>
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
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
              </Link>
            ))}
          </div>
        </div>
        </section>

        <section className="cloud-section py-12 max-w-7xl mx-auto">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">{sectionTitles.projects}</h2>
              <Button asChild variant="outline" size="sm" className="gap-1">
                <Link href="/works">
                  すべて見る
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/works/${project.slug}`}
                className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={`${project.title}の詳細を見る`}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                      {project.title}
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
              </Link>
            ))}
          </div>
        </div>
        </section>

        <section className="cloud-section py-12 max-w-7xl mx-auto">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                {sectionTitles.inProgress}
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
                      <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                        <div
                          className="h-full w-full"
                          style={{
                            background: "var(--card-accent-gradient)",
                          }}
                        />
                        <div
                          className="absolute inset-y-0 right-0 bg-muted"
                          style={{ width: `${Math.max(0, 100 - item.progress_rate)}%` }}
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
