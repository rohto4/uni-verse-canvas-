import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProjects } from '@/lib/actions/projects'
import { AdminProjectCard } from '@/components/admin/AdminProjectCard'

export const metadata = {
  title: 'プロジェクト管理 - Admin',
}

export default async function AdminProjectsPage() {
  const { projects } = await getProjects({ status: ['completed', 'archived', 'registered'], limit: 200 })

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold">プロジェクト管理</h1>
          <p className="text-muted-foreground mt-1">作ったものの管理・編集</p>
        </div>
        <Button asChild className="w-fit">
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <AdminProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
