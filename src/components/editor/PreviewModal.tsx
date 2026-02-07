"use client"

import { X, Monitor, Smartphone, Tablet } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  title: string
  content: string
  excerpt?: string
  tags?: string[]
}

type DeviceType = "desktop" | "tablet" | "mobile"

const deviceWidths: Record<DeviceType, string> = { desktop: "100%", tablet: "768px", mobile: "375px" }

export function PreviewModal({ open, onClose, title, content, excerpt, tags = [] }: PreviewModalProps) {
  const [device, setDevice] = useState<DeviceType>("desktop")

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">プレビュー</DialogTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button variant={device === "desktop" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setDevice("desktop")}>
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button variant={device === "tablet" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setDevice("tablet")}>
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button variant={device === "mobile" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setDevice("mobile")}>
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-muted/50 p-4">
          <div className="mx-auto bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300" style={{ maxWidth: deviceWidths[device], minHeight: "100%" }}>
            <article className="p-6 md:p-8">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => <span key={tag} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md">{tag}</span>)}
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{title || "タイトル未入力"}</h1>
              {excerpt && <p className="text-muted-foreground mb-6 pb-6 border-b">{excerpt}</p>}
              <div className="prose prose-lg dark:prose-invert max-w-none preview-content" dangerouslySetInnerHTML={{ __html: content || "<p class='text-muted-foreground'>本文が入力されていません</p>" }} />
            </article>
          </div>
        </div>
        <div className="px-4 py-3 border-t flex-shrink-0 flex items-center justify-between text-sm text-muted-foreground">
          <span>{device === "desktop" && "デスクトップ表示"}{device === "tablet" && "タブレット表示 (768px)"}{device === "mobile" && "モバイル表示 (375px)"}</span>
          <span>※ 実際の表示とは若干異なる場合があります</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
