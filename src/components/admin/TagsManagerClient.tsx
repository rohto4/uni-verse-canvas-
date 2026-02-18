"use client"

import { useMemo, useState } from "react"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { TagWithCount } from "@/types/database"

type TagInput = {
  name: string
  slug: string
  description?: string | null
  color?: string
}

interface TagsManagerClientProps {
  initialTags: TagWithCount[]
  createAction: (input: TagInput) => Promise<{ success: boolean; data?: TagWithCount; error?: string }>
  updateAction: (id: string, input: TagInput) => Promise<{ success: boolean; data?: TagWithCount; error?: string }>
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export default function TagsManagerClient({
  initialTags,
  createAction,
  updateAction,
  deleteAction,
}: TagsManagerClientProps) {
  const [tags, setTags] = useState<TagWithCount[]>(initialTags)
  const [newTag, setNewTag] = useState<TagInput>({
    name: "",
    slug: "",
    description: "",
    color: "#6B7280",
  })
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null)
  const [editValues, setEditValues] = useState<TagInput>({
    name: "",
    slug: "",
    description: "",
    color: "#6B7280",
  })

  const sortedTags = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name)),
    [tags]
  )

  const handleNewNameChange = (value: string) => {
    setNewTag((prev) => ({
      ...prev,
      name: value,
      slug: isSlugEdited ? prev.slug : slugify(value),
    }))
  }

  const handleCreate = async () => {
    if (!newTag.name.trim()) {
      toast.error("タグ名を入力してください")
      return
    }
    if (!newTag.slug.trim()) {
      toast.error("スラッグを入力してください")
      return
    }

    setIsSaving(true)
    const result = await createAction({
      name: newTag.name.trim(),
      slug: newTag.slug.trim(),
      description: newTag.description?.trim() || null,
      color: newTag.color || "#6B7280",
    })
    setIsSaving(false)

    if (!result.success || !result.data) {
      toast.error(result.error || "タグの作成に失敗しました")
      return
    }

    setTags((prev) => [...prev, result.data!])
    setNewTag({ name: "", slug: "", description: "", color: "#6B7280" })
    setIsSlugEdited(false)
    toast.success("タグを作成しました")
  }

  const openEdit = (tag: TagWithCount) => {
    setEditingTag(tag)
    setEditValues({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
      color: tag.color,
    })
  }

  const handleUpdate = async () => {
    if (!editingTag) return
    if (!editValues.name.trim() || !editValues.slug.trim()) {
      toast.error("名前とスラッグを入力してください")
      return
    }

    setIsSaving(true)
    const result = await updateAction(editingTag.id, {
      name: editValues.name.trim(),
      slug: editValues.slug.trim(),
      description: editValues.description?.trim() || null,
      color: editValues.color || "#6B7280",
    })
    setIsSaving(false)

    if (!result.success || !result.data) {
      toast.error(result.error || "タグの更新に失敗しました")
      return
    }

    setTags((prev) => prev.map((tag) => (tag.id === editingTag.id ? { ...result.data!, postCount: tag.postCount, projectCount: tag.projectCount } : tag)))
    setEditingTag(null)
    toast.success("タグを更新しました")
  }

  const handleDelete = async (tag: TagWithCount) => {
    if (!confirm(`タグ「${tag.name}」を削除しますか？`)) return

    setIsSaving(true)
    const result = await deleteAction(tag.id)
    setIsSaving(false)

    if (!result.success) {
      toast.error(result.error || "タグの削除に失敗しました")
      return
    }

    setTags((prev) => prev.filter((item) => item.id !== tag.id))
    toast.success("タグを削除しました")
  }

  return (
    <div className="space-y-6">
      <Button onClick={handleCreate} disabled={isSaving} className="w-fit">
        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
        追加
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>新規タグ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">タグ名</label>
            <Input value={newTag.name} onChange={(e) => handleNewNameChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">スラッグ</label>
            <Input
              value={newTag.slug}
              onChange={(e) => {
                setIsSlugEdited(true)
                setNewTag((prev) => ({ ...prev, slug: e.target.value }))
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">説明</label>
            <Textarea
              value={newTag.description || ""}
              onChange={(e) => setNewTag((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">カラー</label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={newTag.color || "#6B7280"}
                onChange={(e) => setNewTag((prev) => ({ ...prev, color: e.target.value }))}
                className="h-10 w-16 p-1"
              />
              <Input
                value={newTag.color || "#6B7280"}
                onChange={(e) => setNewTag((prev) => ({ ...prev, color: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>タグ一覧</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedTags.length === 0 && (
            <p className="text-sm text-muted-foreground">タグがありません</p>
          )}
          {sortedTags.map((tag) => (
            <div key={tag.id} className="flex flex-col gap-3 border rounded-lg p-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge style={{ backgroundColor: tag.color, color: "#fff" }}>{tag.name}</Badge>
                  <span className="text-sm text-muted-foreground">/{tag.slug}</span>
                </div>
                {tag.description && (
                  <p className="text-sm text-muted-foreground">{tag.description}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  記事: {tag.postCount}件 / プロジェクト: {tag.projectCount}件
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={editingTag?.id === tag.id} onOpenChange={(open) => !open && setEditingTag(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => openEdit(tag)}>
                      <Edit className="h-4 w-4 mr-2" />
                      編集
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>タグを編集</DialogTitle>
                      <DialogDescription>名前、スラッグ、色を更新できます。</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">タグ名</label>
                        <Input value={editValues.name} onChange={(e) => setEditValues((prev) => ({ ...prev, name: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">スラッグ</label>
                        <Input value={editValues.slug} onChange={(e) => setEditValues((prev) => ({ ...prev, slug: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">説明</label>
                        <Textarea value={editValues.description || ""} onChange={(e) => setEditValues((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">カラー</label>
                        <div className="flex items-center gap-3">
                          <Input
                            type="color"
                            value={editValues.color || "#6B7280"}
                            onChange={(e) => setEditValues((prev) => ({ ...prev, color: e.target.value }))}
                            className="h-10 w-16 p-1"
                          />
                          <Input value={editValues.color || "#6B7280"} onChange={(e) => setEditValues((prev) => ({ ...prev, color: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">キャンセル</Button>
                      </DialogClose>
                      <Button onClick={handleUpdate} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        保存
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(tag)} disabled={isSaving}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
