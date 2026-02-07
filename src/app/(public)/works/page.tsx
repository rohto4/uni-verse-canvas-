import Link from "next/link"
import { ExternalLink, Github, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const projects = [
  {
    id: "1",
    title: "UniVerse Canvas",
    slug: "universe-canvas",
    description: "個人用ポートフォリオ＆ブログシステム。Next.js 15、Supabase、Tiptapを使用した高機能CMS。",
    tags: ["Next.js", "Supabase", "Tiptap", "TypeScript", "Tailwind CSS"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/universe-canvas",
    startDate: "2024-01",
    endDate: "進行中",
    coverImage: null,
  },
  {
    id: "2",
    title: "Task Manager Pro",
    slug: "task-manager-pro",
    description: "チーム向けのタスク管理アプリケーション。リアルタイム同期、カンバンボード、Slack連携機能付き。",
    tags: ["React", "Firebase", "Redux", "Material-UI"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/task-manager",
    startDate: "2023-08",
    endDate: "2023-12",
    coverImage: null,
  },
  {
    id: "3",
    title: "CLI Toolkit",
    slug: "cli-toolkit",
    description: "開発効率化のためのCLIツールキット。プロジェクト生成、コードスニペット管理、デプロイ自動化機能。",
    tags: ["Node.js", "TypeScript", "Commander.js"],
    demoUrl: null,
    githubUrl: "https://github.com/example/cli-toolkit",
    startDate: "2023-05",
    endDate: "2023-07",
    coverImage: null,
  },
  {
    id: "4",
    title: "Weather Dashboard",
    slug: "weather-dashboard",
    description: "天気情報を可視化するダッシュボード。複数地域の天気予報、グラフ表示、アラート機能。",
    tags: ["Vue.js", "Chart.js", "OpenWeather API"],
    demoUrl: "https://example.com",
    githubUrl: null,
    startDate: "2023-02",
    endDate: "2023-04",
    coverImage: null,
  },
  {
    id: "5",
    title: "Portfolio Template",
    slug: "portfolio-template",
    description: "開発者向けのポートフォリオテンプレート。カスタマイズ可能なデザイン、ダークモード対応。",
    tags: ["Astro", "Tailwind CSS", "MDX"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/portfolio-template",
    startDate: "2022-11",
    endDate: "2023-01",
    coverImage: null,
  },
  {
    id: "6",
    title: "E-commerce API",
    slug: "ecommerce-api",
    description: "REST API for e-commerce platform. 商品管理、注文処理、決済連携、在庫管理機能。",
    tags: ["NestJS", "PostgreSQL", "Stripe", "Docker"],
    demoUrl: null,
    githubUrl: "https://github.com/example/ecommerce-api",
    startDate: "2022-06",
    endDate: "2022-10",
    coverImage: null,
  },
]

const allTags = [
  "Next.js", "React", "Vue.js", "TypeScript", "Node.js",
  "Supabase", "Firebase", "PostgreSQL", "Tailwind CSS",
]

export const metadata = {
  title: "作ったもの",
  description: "これまでに制作したプロジェクトの一覧です。",
}

export default function WorksPage() {
  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">作ったもの</h1>
          <p className="text-muted-foreground">
            これまでに制作したプロジェクトの一覧です。
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant="secondary" className="cursor-pointer bg-primary/20 text-primary">
            すべて
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow" id={project.slug}>
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">プロジェクト画像</span>
              </div>

              <CardHeader className="flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>{project.startDate} - {project.endDate}</span>
                </div>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tags.length - 4}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {project.demoUrl && (
                    <Button asChild variant="default" size="sm" className="flex-1">
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Demo
                      </a>
                    </Button>
                  )}
                  {project.githubUrl && (
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        Code
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
