import TagsManagerClient from "@/components/admin/TagsManagerClient"
import { createTag, deleteTag, getTagsWithCount, updateTag } from "@/lib/actions/tags"

export const metadata = {
  title: "タグ管理 - Admin",
}

type TagInput = {
  name: string
  slug: string
  description?: string | null
  color?: string
}

export default async function AdminTagsPage() {
  const tags = await getTagsWithCount()

  async function createAction(input: TagInput) {
    "use server"
    const result = await createTag({
      ...input,
      description: input.description ?? null,
      color: input.color ?? "#6B7280",
    })
    return result.success && result.data
      ? { success: true, data: { ...result.data, postCount: 0, projectCount: 0 } }
      : { success: false, error: result.error }
  }

  async function updateAction(id: string, input: TagInput) {
    "use server"
    const result = await updateTag(id, input)
    return result.success && result.data
      ? { success: true, data: { ...result.data, postCount: 0, projectCount: 0 } }
      : { success: false, error: result.error }
  }

  async function deleteAction(id: string) {
    "use server"
    const result = await deleteTag(id)
    return result.success ? { success: true } : { success: false, error: result.error }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">タグ管理</h1>
        <p className="text-muted-foreground">記事・プロジェクトで使用するタグを管理します。</p>
      </div>
      <TagsManagerClient
        initialTags={tags}
        createAction={createAction}
        updateAction={updateAction}
        deleteAction={deleteAction}
      />
    </div>
  )
}
