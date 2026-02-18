'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2, Loader2 } from 'lucide-react'
import { ProjectForm, type ProjectFormValues } from '@/components/admin/ProjectForm'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { ProjectWithTags, Tag } from '@/types/database'

interface ProjectEditorClientProps {
  initialData?: ProjectWithTags
  availableTags: Tag[]
  submitAction: (data: ProjectFormValues) => Promise<{ success: boolean; error?: string }>
  uploadAction: (formData: FormData) => Promise<{ url: string | null; error?: string }>
  deleteAction?: (id: string) => Promise<{ success: boolean; error?: string }>
  successMessage: string
  redirectTo: string
}

export function ProjectEditorClient({
  initialData,
  availableTags,
  submitAction,
  uploadAction,
  deleteAction,
  successMessage,
  redirectTo,
}: ProjectEditorClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      const result = await submitAction(data)
      if (result.success) {
        toast.success(successMessage)
        router.push(redirectTo)
        router.refresh()
        return
      }
      toast.error(result.error || '保存に失敗しました')
    } catch (error) {
      console.error(error)
      toast.error('エラーが発生しました')
    }
  }

  const handleDelete = async () => {
    if (!initialData || !deleteAction) return
    setIsDeleting(true)
    const result = await deleteAction(initialData.id)
    setIsDeleting(false)

    if (result.success) {
      toast.success('プロジェクトを削除しました')
      router.push(redirectTo)
      return
    }

    toast.error(result.error || '削除に失敗しました')
  }

  return (
    <div className="space-y-4">
      {initialData && deleteAction && (
        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>プロジェクトを削除しますか？</DialogTitle>
                <DialogDescription>
                  この操作は取り消せません。プロジェクト「{initialData.title}」を削除します。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">キャンセル</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  削除する
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <ProjectForm
        initialData={initialData}
        availableTags={availableTags}
        uploadAction={uploadAction}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
