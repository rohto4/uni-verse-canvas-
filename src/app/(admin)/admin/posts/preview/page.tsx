"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Calendar, Eye, Clock, X, Monitor, Smartphone, Tablet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/Header"

type DeviceType = "desktop" | "tablet" | "mobile"

const deviceWidths: Record<DeviceType, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
}

const tableOfContents = [
  { id: "introduction", title: "はじめに", level: 2 },
  { id: "main-features", title: "主な新機能", level: 2 },
  { id: "conclusion", title: "まとめ", level: 2 },
]

export default function PreviewPage() {
  const [device, setDevice] = useState<DeviceType>("desktop")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    const previewData = localStorage.getItem("post-preview-data")
    if (previewData) {
      const data = JSON.parse(previewData)
      setTitle(data.title || "")
      setContent(data.content || "")
      setExcerpt(data.excerpt || "")
      setTags(data.tags || [])
    }
  }, [])

  const handleClose = () => {
    window.close()
  }

  return (
    <div className="min-h-screen bg-universe">
      <Header />

      {/* プレビューコントロールバー */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>プレビューモード</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={device === "desktop" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setDevice("desktop")}
                title="デスクトップ表示"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={device === "tablet" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setDevice("tablet")}
                title="タブレット表示"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={device === "mobile" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2"
                onClick={() => setDevice("mobile")}
                title="モバイル表示"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div
          className="mx-auto transition-all duration-300"
          style={{ maxWidth: deviceWidths[device] }}
        >
          <div className="cloud-section container mx-auto py-8 px-6 md:px-12 lg:px-16">
            <Button variant="ghost" className="mb-6 -ml-2" onClick={handleClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              閉じる
            </Button>

            <div className="flex flex-col lg:flex-row gap-8">
              <article className="flex-1">
                <header className="mb-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">タグ未設定</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    {title || "タイトル未入力"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString("ja-JP")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      プレビュー
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      -- 分で読めます
                    </span>
                  </div>
                </header>

                {excerpt && (
                  <div className="mb-8 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <p className="text-muted-foreground">{excerpt}</p>
                  </div>
                )}

                <div
                  className="tiptap prose prose-lg dark:prose-invert max-w-none mb-8"
                  dangerouslySetInnerHTML={{
                    __html:
                      content ||
                      "<p class='text-muted-foreground'>本文が入力されていません</p>",
                  }}
                />
              </article>

              <aside className="hidden lg:block lg:w-64">
                <div className="sticky top-32">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">目次</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <nav className="space-y-1">
                        {tableOfContents.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`block py-1 text-sm hover:text-primary transition-colors ${
                              item.level === 3 ? "pl-4 text-muted-foreground" : "font-medium"
                            }`}
                          >
                            {item.title}
                          </a>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
