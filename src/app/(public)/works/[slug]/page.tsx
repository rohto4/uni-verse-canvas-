import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ExternalLink, Github, Zap, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getProjectBySlug } from '@/lib/actions/projects'
import { ProjectGallery } from '@/components/projects/ProjectGallery'
import { TechStackChart } from '@/components/projects/TechStackChart'
import { ProjectContent } from '@/components/projects/ProjectContent'
import { RelatedPosts } from '@/components/projects/RelatedPosts'

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '進行中'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatSteps(steps: number | null): string {
  if (!steps) return 'N/A'
  if (steps >= 100000) return `${(steps / 1000).toFixed(0)}k steps`
  if (steps >= 10000) return `${(steps / 1000).toFixed(1)}k steps`
  return `${steps.toLocaleString()} steps`
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return { title: 'Project Not Found' }
  }

  return {
    title: `${project.title} - 作ったもの`,
    description: project.description,
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-7xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            href="/works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 作ったもの一覧に戻る
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{project.description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" style={{ color: tag.color }}>
                {tag.name}
              </Badge>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">プロジェクト情報</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  開発期間
                </div>
                <div className="font-semibold">
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  開発規模
                </div>
                <div className="font-semibold">{formatSteps(project.steps_count)}</div>
              </div>

              {project.used_ai && project.used_ai.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    使用した生成AI
                  </div>
                  <div className="font-semibold text-sm">
                    {project.used_ai.join(', ')}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {project.demo_url && (
                  <Button asChild size="sm" className="flex-1">
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Demo
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-1" />
                      Code
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {project.gallery_images && project.gallery_images.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">スクリーンショット</h2>
            <ProjectGallery images={project.gallery_images} alt={project.title} />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">詳細説明</h2>
            {project.content ? (
              <ProjectContent content={project.content} />
            ) : (
              <p className="text-muted-foreground">詳細説明はまだ記載されていません。</p>
            )}
          </div>

          {project.tech_stack && Object.keys(project.tech_stack).length > 0 && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">技術スタック</CardTitle>
                </CardHeader>
                <CardContent>
                  <TechStackChart data={project.tech_stack} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Separator className="my-12" />

        <RelatedPosts tags={project.tags} limit={3} />
      </div>
    </div>
  )
}
