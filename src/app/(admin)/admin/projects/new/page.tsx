import { createProject } from '@/lib/actions/projects'
import { getTags } from '@/lib/actions/tags'
import { uploadFile } from '@/lib/actions/storage'
import { ProjectEditorClient } from '@/components/admin/ProjectEditorClient'
import type { ProjectFormValues } from '@/components/admin/ProjectForm'

export default async function NewProjectPage() {
  const tags = await getTags()

  async function submitAction(data: ProjectFormValues) {
    'use server'
    const result = await createProject(data)
    return result ? { success: true } : { success: false, error: 'プロジェクトの作成に失敗しました' }
  }

  async function uploadAction(formData: FormData) {
    'use server'
    return uploadFile(formData)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">新規プロジェクト作成</h1>
      </div>
      <ProjectEditorClient
        availableTags={tags}
        submitAction={submitAction}
        uploadAction={uploadAction}
        successMessage="プロジェクトを作成しました"
        redirectTo="/admin/projects"
      />
    </div>
  )
}
