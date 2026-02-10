"use client"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Download, Settings, Trash2, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TiptapEditor } from "@/components/editor"
import { getPostById, updatePost, deletePost, type UpdatePostInput } from "@/lib/actions/posts"
import { getTags } from "@/lib/actions/tags"
import type { Tag } from "@/types/database"
import { toast } from "sonner"

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Data states
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState<any>({})
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft")
  const [publishedAt, setPublishedAt] = useState<string>("")
  const [viewCount, setViewCount] = useState(0)
  const [createdAt, setCreatedAt] = useState("")
  const [updatedAt, setUpdatedAt] = useState("")
  
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [post, tags] = await Promise.all([
          getPostById(id),
          getTags()
        ])

        setAvailableTags(tags)

        if (!post) {
          toast.error("記事が見つかりません")
          router.push("/admin/posts")
          return
        }

        // Set initial state
        setTitle(post.title)
        setSlug(post.slug)
        setExcerpt(post.excerpt || "")
        setContent(post.content)
        setStatus(post.status)
        setPublishedAt(post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : "")
        setViewCount(post.view_count)
        setCreatedAt(post.created_at)
        setUpdatedAt(post.updated_at)
        setSelectedTags(post.tags?.map(t => t.id) || [])
        
        if (post.updated_at) {
          setLastSaved(new Date(post.updated_at))
        }

      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("データの読み込みに失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, router])

  const handleChange = () => {
    if (!isLoading) setHasChanges(true)
  }

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
    handleChange()
  }, [])

  const handleSave = useCallback(async () => {
    if (!title) {
      toast.error("タイトルを入力してください")
      return
    }
    if (!slug) {
      toast.error("スラッグを入力してください")
      return
    }

    setIsSaving(true)
    try {
      const input: UpdatePostInput = {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        status,
        published_at: publishedAt || null,
        tags: selectedTags,
      }

      const result = await updatePost(id, input)

      if (result.success) {
        setLastSaved(new Date())
        setHasChanges(false)
        setUpdatedAt(new Date().toISOString())
        toast.success("変更を保存しました")
      } else {
        toast.error(result.error || "保存に失敗しました")
      }
    } catch (error) {
      console.error("Failed to update post:", error)
      toast.error("予期せぬエラーが発生しました")
    } finally {
      setIsSaving(false)
    }
  }, [id, title, slug, excerpt, content, status, publishedAt, selectedTags])

  const handleDelete = useCallback(async () => {
    setIsDeleting(true)
    try {
      const result = await deletePost(id)
      if (result.success) {
        toast.success("記事を削除しました")
        router.push("/admin/posts")
      } else {
        toast.error(result.error || "削除に失敗しました")
      }
    } catch (error) {
      toast.error("予期せぬエラーが発生しました")
    } finally {
      setIsDeleting(false)
    }
  }, [id, router])

  const handlePreview = useCallback(() => {
    const previewData = {
      title,
      content,
      excerpt,
      tags: selectedTags.map(
        (id) => availableTags.find((t) => t.id === id)?.name || ""
      ),
    }
    localStorage.setItem("post-preview-data", JSON.stringify(previewData))
    window.open("/admin/posts/preview", "_blank")
  }, [title, content, excerpt, selectedTags, availableTags])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin/posts">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">記事を編集</h1>
              <p className="text-xs text-muted-foreground">
                {hasChanges ? "未保存の変更あり" : "保存済み"} 
                {lastSaved && ` • 最終保存: ${lastSaved.toLocaleTimeString("ja-JP")}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  削除
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>記事を削除しますか？</DialogTitle>
                  <DialogDescription>
                    この操作は取り消せません。記事「{title}」を完全に削除します。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">キャンセル</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    削除する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              プレビュー
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              保存
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Title */}
            <div>
              <Input
                type="text"
                placeholder="タイトルを入力..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  handleChange()
                }}
                className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/200文字
              </p>
            </div>

            {/* Tiptap Editor */}
            <TiptapEditor
              content={content}
              onUpdate={(editor) => {
                const json = editor.getJSON()
                // Avoid infinite loop or unnecessary updates check could go here
                setContent(json)
                handleChange()
              }}
              placeholder="本文を入力してください..."
            />

            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-8 border-t">
              <div className="space-y-6">
                {/* Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      公開設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        ステータス
                      </label>
                      <Select 
                        value={status} 
                        onValueChange={(val) => {
                          setStatus(val as "draft" | "scheduled" | "published")
                          handleChange()
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">下書き</SelectItem>
                          <SelectItem value="scheduled">予約投稿</SelectItem>
                          <SelectItem value="published">公開</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {status === "scheduled" && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          公開日時
                        </label>
                        <Input 
                          type="datetime-local" 
                          value={publishedAt}
                          onChange={(e) => {
                            setPublishedAt(e.target.value)
                            handleChange()
                          }}
                        />
                      </div>
                    )}

                    {status === "published" && slug && (
                      <div className="p-3 bg-accent/50 rounded-lg text-sm">
                        <p className="font-medium flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          公開中
                        </p>
                        <Link
                          href={`/posts/${slug}`}
                          target="_blank"
                          className="text-primary text-xs hover:underline flex items-center gap-1 mt-2"
                        >
                          公開ページを表示 <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Slug */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">URL スラッグ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="text"
                      placeholder="url-slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value)
                        handleChange()
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      /posts/{slug || "..."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Excerpt */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">抜粋</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="記事の概要を入力..."
                      value={excerpt}
                      onChange={(e) => {
                        setExcerpt(e.target.value)
                        handleChange()
                      }}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {excerpt.length}/300文字（OGP用）
                    </p>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">タグ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Meta Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">メタ情報</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>作成日:</span>
                      <span>{createdAt ? new Date(createdAt).toLocaleDateString("ja-JP") : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>最終更新:</span>
                      <span>{updatedAt ? new Date(updatedAt).toLocaleDateString("ja-JP") : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>閲覧数:</span>
                      <span>{viewCount} views</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Cover Image Placeholder */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">カバー画像</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          クリックしてアップロード
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}