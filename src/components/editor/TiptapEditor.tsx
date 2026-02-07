"use client"

import { useState, useRef, useCallback } from "react"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import { GripVertical, Maximize2, Minimize2 } from "lucide-react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { HorizontalRule } from "@tiptap/extension-horizontal-rule"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { common, createLowlight } from "lowlight"

import { EditorToolbar } from "./EditorToolbar"
import { ColumnLayout, ColumnItem } from "./extensions/ColumnLayout"

const lowlight = createLowlight(common)

export interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  onUpdate?: (editor: Editor) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

export function TiptapEditor({
  content = "",
  onChange,
  onUpdate,
  placeholder = "本文を入力してください...",
  editable = true,
  className = "",
}: TiptapEditorProps) {
  const [editorHeight, setEditorHeight] = useState(400)
  const [isResizing, setIsResizing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startHeight = useRef(0)

  // リサイズハンドラー
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startY.current = e.clientY
    startHeight.current = editorHeight

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY.current
      const newHeight = Math.max(200, Math.min(1200, startHeight.current + deltaY))
      setEditorHeight(newHeight)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [editorHeight])

  // フルスクリーン切替
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  const editor = useEditor({
    immediatelyRender: false, // SSR対応
    extensions: [
      StarterKit.configure({
        codeBlock: false, // CodeBlockLowlightを使用するため無効化
        horizontalRule: false, // カスタム設定を使用
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "rounded-lg overflow-hidden",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border p-2 bg-muted font-semibold",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-8 border-t border-border",
        },
      }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      ColumnLayout,
      ColumnItem,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
      onUpdate?.(editor)
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6",
      },
    },
  })

  if (!editor) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-muted-foreground">
        エディタを読み込み中...
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`border rounded-lg overflow-hidden bg-background transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 shadow-2xl"
          : ""
      } ${className}`}
      style={!isFullscreen ? { minHeight: editorHeight } : undefined}
    >
      {/* フルスクリーン時の背景オーバーレイ */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={toggleFullscreen}
        />
      )}

      <EditorToolbar editor={editor} />

      {/* エディタ本体 */}
      <div
        className="overflow-auto"
        style={{ height: isFullscreen ? "calc(100% - 120px)" : editorHeight }}
      >
        <EditorContent
          editor={editor}
          className="h-full"
        />
      </div>

      {/* フッター */}
      <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
        <span>
          {editor.storage.characterCount.characters()} 文字 / {editor.storage.characterCount.words()} 単語
        </span>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Markdown記法・ショートカット対応</span>

          {/* フルスクリーンボタン */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={isFullscreen ? "縮小" : "拡大"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* リサイズハンドル（フルスクリーン時は非表示） */}
      {!isFullscreen && (
        <div
          onMouseDown={handleMouseDown}
          className={`h-3 bg-muted/50 hover:bg-primary/20 cursor-ns-resize flex items-center justify-center transition-colors ${
            isResizing ? "bg-primary/30" : ""
          }`}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground rotate-90" />
        </div>
      )}
    </div>
  )
}

export { type Editor }
