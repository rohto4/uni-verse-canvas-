"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Eye, Clock, Download, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data - existing post
const existingPost = {
  id: "1",
  title: "Next.js 15の新機能を試してみた",
  slug: "nextjs-15-features",
  excerpt: "Next.js 15がリリースされたので、主要な新機能を実際に試してみました。",
  status: "published",
  tags: ["1", "2"],
  publishedAt: "2024-01-15T10:00:00",
  content: "<p>ここに記事の内容が入ります...</p>",
}

const availableTags = [
  { id: "1", name: "Next.js", slug: "nextjs" },
  { id: "2", name: "React", slug: "react" },
  { id: "3", name: "TypeScript", slug: "typescript" },
  { id: "4", name: "Supabase", slug: "supabase" },
  { id: "5", name: "Tailwind CSS", slug: "tailwindcss" },
  { id: "6", name: "Tiptap", slug: "tiptap" },
]

export default function EditPostPage() {
  const [title, setTitle] = useState(existingPost.title)
  const [slug, setSlug] = useState(existingPost.slug)
  const [excerpt, setExcerpt] = useState(existingPost.excerpt)
  const [status, setStatus] = useState(existingPost.status)
  const [selectedTags, setSelectedTags] = useState<string[]>(existingPost.tags)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = () => {
    setHasChanges(true)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
    handleChange()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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
                {hasChanges ? "未保存の変更あり" : "保存済み"} • 最終更新: 2024-01-16
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
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
                  <Button variant="destructive">削除する</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              プレビュー
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
            <Button size="sm" disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Editor Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">
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

            {/* Editor Placeholder */}
            <Card className="min-h-[500px]">
              <CardHeader className="border-b">
                <div className="flex items-center gap-2 text-sm">
                  <Button variant="ghost" size="sm">B</Button>
                  <Button variant="ghost" size="sm"><em>I</em></Button>
                  <Button variant="ghost" size="sm"><u>U</u></Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="sm">H1</Button>
                  <Button variant="ghost" size="sm">H2</Button>
                  <Button variant="ghost" size="sm">H3</Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="sm">🔗</Button>
                  <Button variant="ghost" size="sm">📷</Button>
                  <Button variant="ghost" size="sm">📺</Button>
                  <Button variant="ghost" size="sm">💻</Button>
                  <Button variant="ghost" size="sm">📊</Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <h2>はじめに</h2>
                  <p>
                    Next.js 15がリリースされました。今回のアップデートでは、パフォーマンスの
                    大幅な改善と、開発者体験の向上に焦点が当てられています。
                  </p>
                  <h2>主な新機能</h2>
                  <h3>1. Partial Prerendering (PPR)</h3>
                  <p>
                    PPRは、静的コンテンツと動的コンテンツを1つのページ内でシームレスに
                    組み合わせることができる新機能です。
                  </p>
                  <pre className="bg-muted p-4 rounded-lg">
                    <code>export const experimental_ppr = true;</code>
                  </pre>
                  <p className="text-muted-foreground italic">
                    （これはモック表示です。実際にはTiptapエディタが動作します）
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 border-l bg-muted/30 p-4 overflow-auto hidden lg:block">
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
                    onValueChange={(v) => {
                      setStatus(v)
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
                    <Input type="datetime-local" onChange={handleChange} />
                  </div>
                )}

                {status === "published" && (
                  <div className="p-3 bg-accent/50 rounded-lg text-sm">
                    <p className="font-medium">公開中</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      公開日: 2024-01-15 10:00
                    </p>
                    <Link
                      href={`/posts/${slug}`}
                      target="_blank"
                      className="text-primary text-xs hover:underline"
                    >
                      記事を見る →
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

            {/* Cover Image */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">カバー画像</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">カバー画像</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  画像を変更
                </Button>
              </CardContent>
            </Card>

            {/* Meta Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">メタ情報</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>作成日: 2024-01-14</p>
                <p>更新日: 2024-01-16</p>
                <p>閲覧数: 1,234</p>
                <p>文字数: 2,456文字</p>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}
