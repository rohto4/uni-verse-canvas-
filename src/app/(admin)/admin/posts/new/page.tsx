"use client"
import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, Download, Settings, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TiptapEditor } from "@/components/editor"
import { createPost, type CreatePostInput } from "@/lib/actions/posts"
import { getTags } from "@/lib/actions/tags"
import type { Tag } from "@/types/database"
import { toast } from "sonner"

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState<any>({})
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">("draft")
  const [publishedAt, setPublishedAt] = useState<string>("")
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getTags()
        setAvailableTags(tags)
      } catch (error) {
        console.error("Failed to fetch tags:", error)
        toast.error("タグの取得に失敗しました")
      }
    }
    fetchTags()
  }, [])

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)
    // タイトルからスラッグを自動生成（英数字のみ）
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 200)
    setSlug(generatedSlug)
  }, [])

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }, [])

  const handleContentChange = useCallback((html: string) => {
    setContent(html)
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
      const input: CreatePostInput = {
        title,
        slug,
        excerpt: excerpt || null,
        content: content, // Already JSON
        status,
        published_at: publishedAt || null,
        tags: selectedTags,
      }

      const result = await createPost(input)

      if (result.success) {
        setLastSaved(new Date())
        toast.success("記事を作成しました")
        router.push("/admin/posts")
      } else {
        toast.error(result.error || "記事の作成に失敗しました")
      }
    } catch (error) {
      console.error("Failed to save post:", error)
      toast.error("予期せぬエラーが発生しました")
    } finally {
      setIsSaving(false)
    }
  }, [title, slug, excerpt, content, status, publishedAt, selectedTags, router])

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
  }, [title, content, excerpt, selectedTags])

  const handleExport = useCallback(() => {
    // Markdown形式でエクスポート（簡易実装）
    const markdown = `# ${title}\n\n${excerpt}\n\n---\n\n${content}`
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${slug || "post"}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [title, slug, excerpt, content])

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
              <h1 className="font-semibold">新規記事作成</h1>
              <p className="text-xs text-muted-foreground">
                {status === "draft" ? "下書き" : status === "scheduled" ? "予約投稿" : "公開"}
                {lastSaved && (
                  <span className="ml-2">
                    • 最終保存: {lastSaved.toLocaleTimeString("ja-JP")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              プレビュー
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
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
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/200文字
              </p>
            </div>

            {/* Tiptap Editor */}
            <TiptapEditor
              content={""} // Initial content is empty for new post
              onUpdate={(editor) => setContent(editor.getJSON())}
              placeholder="本文を入力してください..."
            />

            {/* メタデータセクション（元の右サイドバーの内容） */}
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
                      <Select value={status} onValueChange={(val) => setStatus(val as "draft" | "scheduled" | "published")}>
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
                          onChange={(e) => setPublishedAt(e.target.value)}
                        />
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
                      onChange={(e) => setSlug(e.target.value)}
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
                      onChange={(e) => setExcerpt(e.target.value)}
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
                {/* Cover Image */}
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
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, WebP (最大5MB)
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
