'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { ProjectForm, type ProjectFormValues } from '@/components/admin/ProjectForm'
import { getProjectById, updateProject } from '@/lib/actions/projects'
import type { ProjectWithTags } from '@/types/database'

interface PageProps {
  params: {
    id: string
  }
}

export default function EditProjectPage({ params }: PageProps) {
  const router = useRouter()
  const [project, setProject] = useState<ProjectWithTags | null>(null)
  const [loading, setLoading] = useState(true)

  // params.id を安全に取得するために useEffect 内で使用するか、
  // あるいは Next.js のバージョンによっては params を await する必要があるが、
  // 基本的な Client Component の実装として props から取得する。
  const projectId = params.id

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(projectId)
        if (data) {
          setProject(data)
        } else {
          toast.error('プロジェクトが見つかりません')
          router.push('/admin/projects')
        }
      } catch (error) {
        console.error(error)
        toast.error('エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }
    
    if (projectId) {
      fetchProject()
    }
  }, [projectId, router])

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      // updateProject は Partial<CreateProjectInput> を取るが、
      // ProjectFormValues はほぼ互換性があるため any でキャストして渡す
      const result = await updateProject(projectId, data)

      if (result) {
        toast.success('プロジェクトを更新しました')
        router.push('/admin/projects')
        router.refresh()
      } else {
        toast.error('プロジェクトの更新に失敗しました')
      }
    } catch (error) {
      console.error(error)
      toast.error('エラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">プロジェクト編集</h1>
      </div>
      <ProjectForm initialData={project} onSubmit={handleSubmit} />
    </div>
  )
}
