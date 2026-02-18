import { notFound } from 'next/navigation'
import { getProjectById, updateProject, deleteProject } from '@/lib/actions/projects'
import { getTags } from '@/lib/actions/tags'
import { uploadFile } from '@/lib/actions/storage'
import { ProjectEditorClient } from '@/components/admin/ProjectEditorClient'
import type { ProjectFormValues } from '@/components/admin/ProjectForm'

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const resolvedParams = await params
  const project = await getProjectById(resolvedParams.id)
  if (!project) {
    notFound()
  }

  const tags = await getTags()

  async function submitAction(data: ProjectFormValues) {
    'use server'
    const result = await updateProject(resolvedParams.id, data)
    return result ? { success: true } : { success: false, error: 'プロジェクトの更新に失敗しました' }
  }

  async function uploadAction(formData: FormData) {
    'use server'
    return uploadFile(formData)
  }

  async function deleteAction(id: string) {
    'use server'
    return deleteProject(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">プロジェクト編集</h1>
      </div>
      <ProjectEditorClient
        initialData={project}
        availableTags={tags}
        submitAction={submitAction}
        uploadAction={uploadAction}
        deleteAction={deleteAction}
        successMessage="プロジェクトを更新しました"
        redirectTo="/admin/projects"
      />
    </div>
  )
}
