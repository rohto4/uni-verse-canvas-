"use client"

import { useCallback, useState, useRef } from "react"
import { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Link,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo,
  Redo,
  Subscript,
  Superscript,
  Code2,
  Columns2,
  ChevronDown,
  Type,
  MoreHorizontal,
  FileImage,
  Video,
  Grid3X3,
  RemoveFormatting,
  Baseline,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


interface EditorToolbarProps {
  editor: Editor
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  tooltip: string
  shortcut?: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, tooltip, shortcut, children }: ToolbarButtonProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={`h-8 w-8 p-0 ${isActive ? "bg-primary/20 text-primary" : ""}`}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-2">
          <span>{tooltip}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">{shortcut}</kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const TEXT_COLORS = [
  { name: "デフォルト", color: null },
  { name: "グレー", color: "#6b7280" },
  { name: "レッド", color: "#dc2626" },
  { name: "オレンジ", color: "#ea580c" },
  { name: "アンバー", color: "#d97706" },
  { name: "イエロー", color: "#ca8a04" },
  { name: "ライム", color: "#65a30d" },
  { name: "グリーン", color: "#16a34a" },
  { name: "エメラルド", color: "#059669" },
  { name: "ティール", color: "#0d9488" },
  { name: "シアン", color: "#0891b2" },
  { name: "スカイ", color: "#0284c7" },
  { name: "ブルー", color: "#2563eb" },
  { name: "インディゴ", color: "#4f46e5" },
  { name: "バイオレット", color: "#7c3aed" },
  { name: "パープル", color: "#9333ea" },
  { name: "フューシャ", color: "#c026d3" },
  { name: "ピンク", color: "#db2777" },
  { name: "ローズ", color: "#e11d48" },
]
const HIGHLIGHT_COLORS = [
  { name: "なし", color: null },
  { name: "イエロー", color: "#fef08a" },
  { name: "グリーン", color: "#bbf7d0" },
  { name: "ブルー", color: "#bfdbfe" },
  { name: "パープル", color: "#ddd6fe" },
  { name: "ピンク", color: "#fbcfe8" },
  { name: "オレンジ", color: "#fed7aa" },
  { name: "レッド", color: "#fecaca" },
]

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [imageTab, setImageTab] = useState<"url" | "upload">("upload")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [tableHasHeader, setTableHasHeader] = useState(true)

  const setLink = useCallback(() => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setLinkDialogOpen(false)
    setLinkUrl("")
    setLinkText("")
  }, [editor, linkUrl])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert("ファイルサイズは5MB以下にしてください")
      return
    }
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください")
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setImagePreview(dataUrl)
      setImageUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }, [])

  const addImage = useCallback(() => {
    const srcUrl = imagePreview || imageUrl
    if (srcUrl) {
      // 画像を挿入
      editor.chain().focus().setImage({ src: srcUrl, alt: imageAlt, title: imageAlt }).run()

      // 画像の後ろに段落を挿入してカーソルを移動
      setTimeout(() => {
        const { state: newState } = editor
        const { selection: newSelection } = newState
        const pos = newSelection.$anchor.pos

        // 現在のノードが画像なら、その後ろに段落を挿入
        const node = newState.doc.nodeAt(pos - 1)
        if (node && node.type.name === 'resizableImage') {
          editor.chain().focus().insertContentAt(pos, { type: 'paragraph' }).run()
        }
      }, 10)
    }
    setImageDialogOpen(false)
    setImageUrl("")
    setImageAlt("")
    setImagePreview(null)
    setImageTab("upload")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [editor, imageUrl, imageAlt, imagePreview])

  const addYoutube = useCallback(() => {
    if (youtubeUrl) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run()
    }
    setYoutubeDialogOpen(false)
    setYoutubeUrl("")
  }, [editor, youtubeUrl])

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: tableHasHeader }).run()
    setTableDialogOpen(false)
  }, [editor, tableRows, tableCols, tableHasHeader])

  const openLinkDialog = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href || ""
    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to, "")
    setLinkUrl(previousUrl)
    setLinkText(selectedText)
    setLinkDialogOpen(true)
  }, [editor])

  const insertColumnLayout = useCallback((bgColor: "none" | "blue" = "none") => {
    editor.chain().focus().insertContent({
      type: "columnLayout",
      attrs: {
        bgColor,
      },
      content: [
        { type: "columnItem", content: [{ type: "paragraph", content: [{ type: "text", text: "左カラム" }] }] },
        { type: "columnItem", content: [{ type: "paragraph", content: [{ type: "text", text: "右カラム" }] }] },
      ],
    }).run()
  }, [editor])

  const clearFormatting = useCallback(() => {
    editor.chain().focus().clearNodes().unsetAllMarks().run()
  }, [editor])

  return (
    <>
      <div className="border-b bg-muted/30">
        <div className="flex flex-wrap items-center gap-0.5 p-1.5">
          <div className="flex items-center">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} tooltip="元に戻す" shortcut="Ctrl+Z">
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} tooltip="やり直し" shortcut="Ctrl+Y">
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                <Type className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">見出し</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">テキストスタイル</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive("paragraph") ? "bg-primary/10" : ""}>
                <Baseline className="h-4 w-4 mr-2" />
                本文
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? "bg-primary/10" : ""}>
                <Heading1 className="h-4 w-4 mr-2" />
                見出し 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? "bg-primary/10" : ""}>
                <Heading2 className="h-4 w-4 mr-2" />
                見出し 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? "bg-primary/10" : ""}>
                <Heading3 className="h-4 w-4 mr-2" />
                見出し 3
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive("heading", { level: 4 }) ? "bg-primary/10" : ""}>
                <Heading4 className="h-4 w-4 mr-2" />
                見出し 4
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <div className="flex items-center">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} tooltip="太字" shortcut="Ctrl+B">
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} tooltip="斜体" shortcut="Ctrl+I">
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} tooltip="下線" shortcut="Ctrl+U">
              <Underline className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} tooltip="取り消し線">
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* 文字色ピッカー */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="relative">
                  <Type className="h-4 w-4" />
                  <div
                    className="absolute -bottom-0.5 left-0 right-0 h-1 rounded"
                    style={{ backgroundColor: editor.getAttributes("textStyle").color || "currentColor" }}
                  />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-2">
                <Label className="text-xs font-medium">文字色</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {TEXT_COLORS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        if (item.color) {
                          editor.chain().focus().setColor(item.color).run()
                        } else {
                          editor.chain().focus().unsetColor().run()
                        }
                      }}
                      className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
                        editor.getAttributes("textStyle").color === item.color
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: item.color || "transparent" }}
                      title={item.name}
                    >
                      {!item.color && <RemoveFormatting className="h-4 w-4 m-auto text-muted-foreground" />}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* ハイライト色ピッカー */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive("highlight") ? "bg-primary/20" : ""}`}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="start">
              <div className="space-y-2">
                <Label className="text-xs font-medium">ハイライト色</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {HIGHLIGHT_COLORS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        if (item.color) {
                          editor.chain().focus().toggleHighlight({ color: item.color }).run()
                        } else {
                          editor.chain().focus().unsetHighlight().run()
                        }
                      }}
                      className={`w-10 h-8 rounded-md border-2 transition-all hover:scale-105 ${
                        editor.isActive("highlight", { color: item.color })
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: item.color || "transparent" }}
                      title={item.name}
                    >
                      {!item.color && <RemoveFormatting className="h-4 w-4 m-auto text-muted-foreground" />}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            tooltip="インラインコード"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* リスト */}
          <div className="flex items-center">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              tooltip="箇条書き"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              tooltip="番号付きリスト"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive("taskList")}
              tooltip="チェックリスト"
            >
              <ListChecks className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* 配置 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                <AlignLeft className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={editor.isActive({ textAlign: "left" }) ? "bg-primary/10" : ""}
              >
                <AlignLeft className="h-4 w-4 mr-2" />
                左揃え
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={editor.isActive({ textAlign: "center" }) ? "bg-primary/10" : ""}
              >
                <AlignCenter className="h-4 w-4 mr-2" />
                中央揃え
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={editor.isActive({ textAlign: "right" }) ? "bg-primary/10" : ""}
              >
                <AlignRight className="h-4 w-4 mr-2" />
                右揃え
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                className={editor.isActive({ textAlign: "justify" }) ? "bg-primary/10" : ""}
              >
                <AlignJustify className="h-4 w-4 mr-2" />
                両端揃え
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* ブロック要素 */}
          <div className="flex items-center">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              tooltip="引用"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              tooltip="コードブロック"
            >
              <Code2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              tooltip="区切り線"
            >
              <Minus className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* 挿入 */}
          <div className="flex items-center">
            <ToolbarButton
              onClick={openLinkDialog}
              isActive={editor.isActive("link")}
              tooltip="リンク"
              shortcut="Ctrl+K"
            >
              <Link className="h-4 w-4" />
            </ToolbarButton>
            {editor.isActive("link") && (
              <ToolbarButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                tooltip="リンク解除"
              >
                <Unlink className="h-4 w-4" />
              </ToolbarButton>
            )}
            <ToolbarButton
              onClick={() => setImageDialogOpen(true)}
              tooltip="画像挿入"
            >
              <FileImage className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setYoutubeDialogOpen(true)}
              tooltip="YouTube埋め込み"
            >
              <Video className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setTableDialogOpen(true)}
              tooltip="テーブル挿入"
            >
              <Grid3X3 className="h-4 w-4" />
            </ToolbarButton>
            {editor.isActive("table") && (
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteTable().run()}
                tooltip="テーブル削除"
              >
                <X className="h-4 w-4" />
              </ToolbarButton>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Columns2 className="h-4 w-4 mr-1" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>二段組レイアウト</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => insertColumnLayout("none")}>
                  <Columns2 className="h-4 w-4 mr-2" />
                  背景色なし
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertColumnLayout("blue")}>
                  <Columns2 className="h-4 w-4 mr-2" />
                  薄い水色の背景
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* その他 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={editor.isActive("subscript") ? "bg-primary/10" : ""}
              >
                <Subscript className="h-4 w-4 mr-2" />
                下付き文字
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={editor.isActive("superscript") ? "bg-primary/10" : ""}
              >
                <Superscript className="h-4 w-4 mr-2" />
                上付き文字
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearFormatting}>
                <RemoveFormatting className="h-4 w-4 mr-2" />
                書式をクリア
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* リンクダイアログ */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              リンクを挿入
            </DialogTitle>
            <DialogDescription>
              URLを入力してリンクを作成します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setLink()}
              />
            </div>
            {linkText && (
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">選択中のテキスト</Label>
                <p className="mt-1 text-sm font-medium">{linkText}</p>
              </div>
            )}
            {linkUrl && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <Label className="text-xs text-blue-600 dark:text-blue-400">プレビュー</Label>
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-blue-600 dark:text-blue-400 underline block truncate"
                >
                  {linkUrl}
                </a>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={setLink}>挿入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 画像ダイアログ */}
      <Dialog open={imageDialogOpen} onOpenChange={(open) => {
        setImageDialogOpen(open)
        if (!open) {
          setImageUrl("")
          setImageAlt("")
          setImagePreview(null)
          setImageTab("upload")
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              画像を挿入
            </DialogTitle>
            <DialogDescription>
              ファイルをアップロードまたはURLを入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* タブ切替 */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  imageTab === "upload"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                ファイルアップロード
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  imageTab === "url"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                URL入力
              </button>
            </div>

            {imageTab === "upload" ? (
              /* ファイルアップロード */
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <FileImage className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    クリックしてファイルを選択
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WebP, GIF (最大5MB)
                  </span>
                </label>
              </div>
            ) : (
              /* URL入力 */
              <div className="space-y-2">
                <Label htmlFor="image-url">画像URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value)
                    setImagePreview(null)
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="image-alt">代替テキスト（alt）</Label>
              <Input
                id="image-alt"
                type="text"
                placeholder="画像の説明"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                アクセシビリティとSEOのために設定してください
              </p>
            </div>

            {/* プレビュー */}
            {(imagePreview || (imageTab === "url" && imageUrl)) && (
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">プレビュー</Label>
                <div className="mt-2 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || imageUrl}
                    alt={imageAlt || "プレビュー"}
                    style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                    className="rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={addImage} disabled={!imagePreview && !imageUrl}>
              挿入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTubeダイアログ */}
      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              YouTubeを埋め込み
            </DialogTitle>
            <DialogDescription>
              YouTubeの動画URLを入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addYoutube()}
              />
              <p className="text-xs text-muted-foreground">
                youtube.com または youtu.be の URL に対応
              </p>
            </div>
            {youtubeUrl && youtubeUrl.includes("youtube") && (
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">プレビュー</Label>
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  YouTube動画が埋め込まれます
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={addYoutube} disabled={!youtubeUrl}>埋め込み</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* テーブルダイアログ */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              テーブルを挿入
            </DialogTitle>
            <DialogDescription>
              テーブルのサイズを設定してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="table-rows">行数</Label>
                <Input
                  id="table-rows"
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table-cols">列数</Label>
                <Input
                  id="table-cols"
                  type="number"
                  min={1}
                  max={10}
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="table-header"
                checked={tableHasHeader}
                onChange={(e) => setTableHasHeader(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="table-header" className="text-sm font-normal">
                ヘッダー行を含める
              </Label>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-xs text-muted-foreground">プレビュー</Label>
              <div className="mt-2 overflow-x-auto">
                <table className="text-xs border-collapse">
                  <tbody>
                    {Array.from({ length: Math.min(tableRows, 5) }).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array.from({ length: Math.min(tableCols, 5) }).map((_, colIndex) => (
                          <td
                            key={colIndex}
                            className={`border px-2 py-1 ${
                              rowIndex === 0 && tableHasHeader ? "bg-gray-100 font-medium" : ""
                            }`}
                          >
                            {rowIndex === 0 && tableHasHeader ? `見出し${colIndex + 1}` : `${rowIndex + 1}-${colIndex + 1}`}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(tableRows > 5 || tableCols > 5) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ※ プレビューは5x5まで表示
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={addTable}>挿入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
