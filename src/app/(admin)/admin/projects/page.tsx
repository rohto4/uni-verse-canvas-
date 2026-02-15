import Link from 'next/link'
import { Plus, Edit, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getProjects } from '@/lib/actions/projects'

export const metadata = {
  title: 'プロジェクト管理 - Admin',
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '進行中'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default async function AdminProjectsPage() {
  const { projects } = await getProjects({ status: 'completed' })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">プロジェクト管理</h1>
          <p className="text-muted-foreground mt-1">作ったものの管理・編集</p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {project.demo_url && (
                  <Button asChild variant="ghost" size="icon">
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" size="icon">
                  <Link href={`/admin/projects/${project.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
