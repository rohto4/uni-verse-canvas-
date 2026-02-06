"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Eye, Clock, Download, Settings } from "lucide-react"
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

const availableTags = [
  { id: "1", name: "Next.js", slug: "nextjs" },
  { id: "2", name: "React", slug: "react" },
  { id: "3", name: "TypeScript", slug: "typescript" },
  { id: "4", name: "Supabase", slug: "supabase" },
  { id: "5", name: "Tailwind CSS", slug: "tailwindcss" },
  { id: "6", name: "Tiptap", slug: "tiptap" },
]

export default function NewPostPage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [status, setStatus] = useState("draft")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    // Auto-generate slug from title (simplified)
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 200)
    setSlug(generatedSlug)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
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
              <h1 className="font-semibold">新規記事作成</h1>
              <p className="text-xs text-muted-foreground">下書き • 自動保存: オフ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              プレビュー
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
            <Button size="sm">
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
                onChange={(e) => handleTitleChange(e.target.value)}
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
                  <p className="text-muted-foreground">
                    ここにTiptapエディタが表示されます...
                  </p>
                  <p className="text-muted-foreground">
                    本文を入力してください。マークダウン記法やショートカットキーが使えます。
                  </p>
                  <ul className="text-muted-foreground">
                    <li>**太字** → <strong>太字</strong></li>
                    <li>*斜体* → <em>斜体</em></li>
                    <li>```code``` → コードブロック</li>
                    <li>/image → 画像挿入</li>
                    <li>/youtube → YouTube埋め込み</li>
                  </ul>
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
                  <Select value={status} onValueChange={setStatus}>
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
                    <Input type="datetime-local" />
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
        </aside>
      </div>
    </div>
  )
}
