'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProjectForm, type ProjectFormValues } from '@/components/admin/ProjectForm'
import { createProject } from '@/lib/actions/projects'

export default function NewProjectPage() {
  const router = useRouter()

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      const result = await createProject(data)

      if (result) {
        toast.success('プロジェクトを作成しました')
        router.push('/admin/projects')
        router.refresh()
      } else {
        toast.error('プロジェクトの作成に失敗しました')
      }
    } catch (error) {
      console.error(error)
      toast.error('エラーが発生しました')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">新規プロジェクト作成</h1>
      </div>
      <ProjectForm onSubmit={handleSubmit} />
    </div>
  )
}
