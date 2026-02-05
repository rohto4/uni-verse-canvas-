# docs/component-spec.md

## Document Metadata
- **Version**: 1.0.0
- **Last Updated**: 2026-02-04
- **Status**: Confirmed (確定版)
- **Owner**: Senior Fullstack Engineer (DDD Specialist)
- **Project Name**: UniVerse Canvas

---

## 1. コンポーネント概要

### 1.1 設計方針
- **Atomic Design**: 部分的に採用（ui / feature / page層）
- **コンポーネント粒度**: 再利用性と可読性のバランス
- **Props型安全性**: 全てTypeScriptで厳密に定義
- **状態管理**: ローカル優先、必要時のみContext使用
- **shadcn/ui活用**: 基本UIコンポーネントは全てshadcn/ui

### 1.2 コンポーネント分類

| 分類 | ディレクトリ | 説明 |
|-----|-----------|------|
| **UI基本** | `components/ui/` | shadcn/ui基本コンポーネント |
| **レイアウト** | `components/layout/` | ヘッダー・フッター・サイドバー |
| **エディタ** | `components/editor/` | Tiptap関連 |
| **記事** | `components/post/` | 記事表示コンポーネント |
| **プロジェクト** | `components/project/` | プロジェクト表示 |
| **進行中** | `components/progress/` | 進行中表示 |
| **管理画面** | `components/admin/` | 管理画面専用 |
| **共通** | `components/common/` | 汎用コンポーネント |

---

## 2. コンポーネントツリー

```
App (layout.tsx)
├── Header
│   ├── Logo
│   ├── Navigation
│   │   └── NavigationItem[]
│   ├── ThemeToggle
│   ├── SearchBox
│   └── MobileMenu
│       └── NavigationItem[]
│
├── Main Content
│   │
│   ├── (Public Pages)
│   │   ├── HomePage
│   │   │   ├── HeroSection
│   │   │   ├── PostCard[] (最新記事)
│   │   │   ├── ProjectCard[] (最新プロジェクト)
│   │   │   └── ProgressTimeline (進行中)
│   │   │
│   │   ├── PostsPage
│   │   │   ├── Sidebar
│   │   │   │   └── TagFilter
│   │   │   ├── PostCard[]
│   │   │   └── Pagination
│   │   │
│   │   ├── PostDetailPage
│   │   │   ├── PostMeta
│   │   │   ├── TableOfContents
│   │   │   ├── PostContent
│   │   │   ├── RelatedPosts
│   │   │   └── ShareButtons
│   │   │
│   │   ├── WorksPage
│   │   │   ├── TagFilter
│   │   │   └── ProjectGallery
│   │   │       └── ProjectCard[]
│   │   │
│   │   ├── ProjectDetailPage
│   │   │   ├── ProjectMeta
│   │   │   ├── ProjectContent
│   │   │   └── RelatedPosts
│   │   │
│   │   ├── ProgressPage
│   │   │   ├── StatusTabs
│   │   │   └── ProgressTimeline
│   │   │       └── ProgressCard[]
│   │   │
│   │   ├── AboutPage
│   │   │   └── PageContent
│   │   │
│   │   └── LinksPage
│   │       ├── QiitaArticles
│   │       └── SNSLinks
│   │
│   └── (Admin Pages)
│       ├── AdminLayout
│       │   ├── AdminNav
│       │   └── BreadCrumbs
│       │
│       ├── DashboardPage
│       │   └── DashboardStats
│       │
│       ├── PostEditorPage
│       │   ├── TiptapEditor
│       │   │   ├── MenuBar
│       │   │   └── EditorContent
│       │   ├── PostMetaForm
│       │   │   ├── TagSelector
│       │   │   ├── DateTimePicker
│       │   │   └── ImageUploader
│       │   └── PreviewModal
│       │
│       ├── PostListPage
│       │   ├── SearchBox
│       │   ├── StatusFilter
│       │   └── PostList
│       │       └── PostListItem[]
│       │
│       ├── BackupPage
│       │   ├── BackupPanel
│       │   └── ImportPanel
│       │
│       └── SettingsPage
│           └── SettingsForm
│
└── Footer
    ├── FooterLinks
    └── Copyright
```

---

## 3. UI基本コンポーネント（shadcn/ui）

### 3.1 導入済みコンポーネント

| コンポーネント | ファイル | 用途 |
|-------------|---------|------|
| Button | `button.tsx` | ボタン全般 |
| Card | `card.tsx` | カード表示 |
| Dialog | `dialog.tsx` | モーダル |
| Dropdown Menu | `dropdown-menu.tsx` | ドロップダウン |
| Input | `input.tsx` | テキスト入力 |
| Select | `select.tsx` | セレクトボックス |
| Textarea | `textarea.tsx` | 複数行テキスト |
| Tabs | `tabs.tsx` | タブ切り替え |
| Badge | `badge.tsx` | ラベル・バッジ |
| Separator | `separator.tsx` | 区切り線 |
| Skeleton | `skeleton.tsx` | ローディング |
| Toast | `toast.tsx` | 通知 |
| Tooltip | `tooltip.tsx` | ツールチップ |

**使用例**:
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>タイトル</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">クリック</Button>
      </CardContent>
    </Card>
  )
}
```

---

## 4. レイアウトコンポーネント

### 4.1 Header

**ファイル**: `components/layout/Header.tsx`

**Props**:
```typescript
interface HeaderProps {
  className?: string
}
```

**実装概要**:
```typescript
export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('sticky top-0 z-50 border-b bg-background', className)}>
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <Navigation />
        <div className="flex items-center gap-4">
          <SearchBox />
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
```

**子コンポーネント**:
- `Logo`: サイトロゴ・タイトル
- `Navigation`: デスクトップナビゲーション
- `SearchBox`: 検索ボックス
- `ThemeToggle`: ダークモード切り替え
- `MobileMenu`: モバイルハンバーガーメニュー

---

### 4.2 Navigation

**ファイル**: `components/layout/Navigation.tsx`

**Props**:
```typescript
interface NavigationProps {
  items?: NavigationItem[]
}

interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
}
```

**実装例**:
```typescript
const defaultItems: NavigationItem[] = [
  { label: 'ホーム', href: '/' },
  { label: '読み物', href: '/posts' },
  { label: '作ったもの', href: '/works' },
  { label: '進行中のこと', href: '/progress' },
  { label: '自己紹介', href: '/about' },
  { label: '関連リンク', href: '/links' },
]

export function Navigation({ items = defaultItems }: NavigationProps) {
  const pathname = usePathname()
  
  return (
    <nav className="hidden md:flex gap-6">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
```

---

### 4.3 Sidebar

**ファイル**: `components/layout/Sidebar.tsx`

**Props**:
```typescript
interface SidebarProps {
  children: React.ReactNode
  className?: string
}
```

**実装概要**:
```typescript
export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside className={cn('w-64 border-r bg-muted/10 p-6', className)}>
      {children}
    </aside>
  )
}
```

---

### 4.4 Footer

**ファイル**: `components/layout/Footer.tsx`

**Props**:
```typescript
interface FooterProps {
  className?: string
}
```

---

## 5. エディタコンポーネント

### 5.1 TiptapEditor

**ファイル**: `components/editor/TiptapEditor.tsx`

**Props**:
```typescript
interface TiptapEditorProps {
  content?: JSONContent
  onChange?: (content: JSONContent) => void
  editable?: boolean
  className?: string
  placeholder?: string
}
```

**実装概要**:
```typescript
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { MenuBar } from './MenuBar'
import { extensions } from './extensions'

export function TiptapEditor({
  content,
  onChange,
  editable = true,
  className,
  placeholder = '本文を入力...'
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ...extensions,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none',
      },
    },
  })

  if (!editor) return null

  return (
    <div className={cn('border rounded-lg', className)}>
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className="p-6" />
    </div>
  )
}
```

---

### 5.2 MenuBar

**ファイル**: `components/editor/MenuBar.tsx`

**Props**:
```typescript
interface MenuBarProps {
  editor: Editor
}
```

**実装概要**:
```typescript
export function MenuBar({ editor }: MenuBarProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b p-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      {/* 他のボタン... */}
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <ImageUploader editor={editor} />
    </div>
  )
}
```

---

### 5.3 ImageUploader

**ファイル**: `components/editor/extensions/ImageUploader.tsx`

**Props**:
```typescript
interface ImageUploaderProps {
  editor: Editor
  onUpload?: (url: string) => void
}
```

**実装概要**:
```typescript
import imageCompression from 'browser-image-compression'
import { uploadToSupabase } from './utils/uploadToSupabase'

export function ImageUploader({ editor, onUpload }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    
    try {
      // WebP変換
      const compressedFile = await imageCompression(file, {
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8,
      })
      
      // Supabaseにアップロード
      const url = await uploadToSupabase(compressedFile, 'posts/images')
      
      // エディタに挿入
      editor.chain().focus().setImage({ src: url }).run()
      
      onUpload?.(url)
    } catch (error) {
      console.error('画像アップロードエラー:', error)
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button variant="ghost" size="sm" asChild disabled={isUploading}>
          <span>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
          </span>
        </Button>
      </label>
    </div>
  )
}
```

---

### 5.4 Tiptap拡張一覧

**ファイル**: `components/editor/extensions/index.ts`

```typescript
import { Extension } from '@tiptap/core'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Mathematics from '@tiptap/extension-mathematics'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'

// カスタム拡張
import { HorizontalImageLayout } from './HorizontalImageLayout'
import { SectionDivider } from './SectionDivider'

const lowlight = createLowlight(common)

export const extensions = [
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
  Image.configure({
    inline: true,
    allowBase64: true,
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline',
    },
  }),
  Youtube.configure({
    width: 640,
    height: 360,
  }),
  Mathematics,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Placeholder.configure({
    placeholder: '本文を入力してください...',
  }),
  CharacterCount,
  Highlight.configure({
    multicolor: true,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Underline,
  Subscript,
  Superscript,
  Color,
  TextStyle,
  HorizontalImageLayout,
  SectionDivider,
]
```

---

### 5.5 HorizontalImageLayout（カスタム拡張）

**ファイル**: `components/editor/extensions/HorizontalImageLayout.tsx`

**仕様**:
- 横並び画像レイアウト（2〜4枚）
- PC: 横並び表示
- スマホ: 縦並び表示（レスポンシブ）

```typescript
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'

export const HorizontalImageLayout = Node.create({
  name: 'horizontalImageLayout',
  group: 'block',
  content: 'image+',
  
  addAttributes() {
    return {
      layout: {
        default: 'grid-2',
        parseHTML: element => element.getAttribute('data-layout'),
        renderHTML: attributes => ({
          'data-layout': attributes.layout,
        }),
      },
    }
  },
  
  parseHTML() {
    return [{ tag: 'div[data-type="horizontal-image-layout"]' }]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'horizontal-image-layout' }), 0]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(HorizontalImageLayoutComponent)
  },
})

function HorizontalImageLayoutComponent({ node }: any) {
  const layout = node.attrs.layout
  
  return (
    <NodeViewWrapper className="horizontal-image-layout">
      <div className={`grid gap-4 ${layout === 'grid-2' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {/* 画像レンダリング */}
      </div>
    </NodeViewWrapper>
  )
}
```

---

## 6. 記事コンポーネント

### 6.1 PostCard

**ファイル**: `components/post/PostCard.tsx`

**Props**:
```typescript
interface PostCardProps {
  post: PostWithTags
  variant?: 'default' | 'compact'
  className?: string
}
```

**実装概要**:
```typescript
export function PostCard({ post, variant = 'default', className }: PostCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {post.cover_image && (
        <div className="aspect-video relative">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex gap-2 mb-2">
          {post.tags.map(tag => (
            <Badge key={tag.id} style={{ backgroundColor: tag.color }}>
              {tag.name}
            </Badge>
          ))}
        </div>
        <CardTitle>
          <Link href={`/posts/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
        <PostMeta post={post} />
      </CardHeader>
      {post.excerpt && (
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
        </CardContent>
      )}
    </Card>
  )
}
```

---

### 6.2 PostContent

**ファイル**: `components/post/PostContent.tsx`

**Props**:
```typescript
interface PostContentProps {
  content: JSONContent
  className?: string
}
```

**実装概要**:
```typescript
import { generateHTML } from '@tiptap/html'
import { extensions } from '@/components/editor/extensions'

export function PostContent({ content, className }: PostContentProps) {
  const html = useMemo(() => {
    return generateHTML(content, extensions)
  }, [content])
  
  return (
    <div
      className={cn('prose prose-slate max-w-none dark:prose-invert', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

---

### 6.3 TableOfContents

**ファイル**: `components/post/TableOfContents.tsx`

**Props**:
```typescript
interface TableOfContentsProps {
  content: JSONContent
  className?: string
}

interface TocItem {
  id: string
  level: number
  text: string
}
```

**実装概要**:
```typescript
export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  
  const toc = useMemo(() => {
    const items: TocItem[] = []
    
    // JSONContentから見出しを抽出
    const extractHeadings = (node: any) => {
      if (node.type === 'heading') {
        items.push({
          id: `heading-${items.length}`,
          level: node.attrs.level,
          text: node.content?.[0]?.text || '',
        })
      }
      
      if (node.content) {
        node.content.forEach(extractHeadings)
      }
    }
    
    extractHeadings(content)
    return items
  }, [content])
  
  return (
    <nav className={cn('space-y-2', className)}>
      <h3 className="font-semibold">目次</h3>
      <ul className="space-y-1">
        {toc.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className={cn(
                'text-sm hover:text-primary transition-colors',
                activeId === item.id ? 'text-primary font-medium' : 'text-muted-foreground'
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

---

### 6.4 RelatedPosts

**ファイル**: `components/post/RelatedPosts.tsx`

**Props**:
```typescript
interface RelatedPostsProps {
  postId: string
  limit?: number
  className?: string
}
```

---

## 7. プロジェクトコンポーネント

### 7.1 ProjectCard

**ファイル**: `components/project/ProjectCard.tsx`

**Props**:
```typescript
interface ProjectCardProps {
  project: ProjectWithTags
  onClick?: () => void
  className?: string
}
```

---

### 7.2 ProjectGallery

**ファイル**: `components/project/ProjectGallery.tsx`

**Props**:
```typescript
interface ProjectGalleryProps {
  projects: ProjectWithTags[]
  columns?: 2 | 3 | 4
  className?: string
}
```

**実装概要**:
```typescript
export function ProjectGallery({
  projects,
  columns = 3,
  className
}: ProjectGalleryProps) {
  return (
    <div className={cn(
      'grid gap-6',
      columns === 2 && 'md:grid-cols-2',
      columns === 3 && 'md:grid-cols-3',
      columns === 4 && 'md:grid-cols-4',
      className
    )}>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

---

## 8. 進行中コンポーネント

### 8.1 ProgressCard

**ファイル**: `components/progress/ProgressCard.tsx`

**Props**:
```typescript
interface ProgressCardProps {
  item: InProgressWithProject
  className?: string
}
```

---

### 8.2 ProgressTimeline

**ファイル**: `components/progress/ProgressTimeline.tsx`

**Props**:
```typescript
interface ProgressTimelineProps {
  items: InProgressWithProject[]
  groupBy?: 'status' | 'date'
  className?: string
}
```

---

### 8.3 StatusBadge

**ファイル**: `components/progress/StatusBadge.tsx`

**Props**:
```typescript
interface StatusBadgeProps {
  status: 'not_started' | 'paused' | 'in_progress' | 'completed'
  size?: 'sm' | 'md' | 'lg'
}
```

**実装例**:
```typescript
const statusConfig = {
  not_started: { label: '未着手', color: 'bg-gray-500' },
  paused: { label: '中断中', color: 'bg-yellow-500' },
  in_progress: { label: '進行中', color: 'bg-blue-500' },
  completed: { label: '完了', color: 'bg-green-500' },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge className={cn(config.color, size === 'sm' && 'text-xs')}>
      {config.label}
    </Badge>
  )
}
```

---

## 9. 管理画面コンポーネント

### 9.1 AdminNav

**ファイル**: `components/admin/AdminNav.tsx`

**Props**:
```typescript
interface AdminNavProps {
  className?: string
}
```

---

### 9.2 PostList

**ファイル**: `components/admin/PostList.tsx`

**Props**:
```typescript
interface PostListProps {
  posts: PostWithTags[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}
```

---

### 9.3 BackupPanel

**ファイル**: `components/admin/BackupPanel.tsx`

**Props**:
```typescript
interface BackupPanelProps {
  onExport?: () => void
  onImport?: (file: File) => void
  className?: string
}
```

---

## 10. 共通コンポーネント

### 10.1 ThemeToggle

**ファイル**: `components/common/ThemeToggle.tsx`

**Props**:
```typescript
interface ThemeToggleProps {
  className?: string
}
```

**実装例**:
```typescript
import { useTheme } from 'next-themes'

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={className}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">テーマ切り替え</span>
    </Button>
  )
}
```

---

### 10.2 SearchBox

**ファイル**: `components/common/SearchBox.tsx`

**Props**:
```typescript
interface SearchBoxProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}
```

---

### 10.3 TagFilter

**ファイル**: `components/common/TagFilter.tsx`

**Props**:
```typescript
interface TagFilterProps {
  tags: TagWithCount[]
  selectedTags: string[]
  onToggle: (tagSlug: string) => void
  mode?: 'single' | 'multiple'
  className?: string
}
```

**実装例**:
```typescript
export function TagFilter({
  tags,
  selectedTags,
  onToggle,
  mode = 'multiple',
  className
}: TagFilterProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="font-semibold">タグで絞り込む</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.slug) ? 'default' : 'outline'}
            style={{
              backgroundColor: selectedTags.includes(tag.slug) ? tag.color : undefined,
              borderColor: tag.color,
            }}
            className="cursor-pointer"
            onClick={() => onToggle(tag.slug)}
          >
            {tag.name} ({tag.postCount})
          </Badge>
        ))}
      </div>
    </div>
  )
}
```

---

### 10.4 Pagination

**ファイル**: `components/common/Pagination.tsx`

**Props**:
```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}
```

---

### 10.5 LoadingSpinner

**ファイル**: `components/common/LoadingSpinner.tsx`

**Props**:
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

---

## 11. カスタムHooks

### 11.1 useAuth

**ファイル**: `hooks/useAuth.ts`

```typescript
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  return { user, loading, isAdmin: !!user }
}
```

---

### 11.2 usePosts

**ファイル**: `hooks/usePosts.ts`

```typescript
interface UsePostsOptions {
  page?: number
  limit?: number
  tags?: string[]
  search?: string
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<PostWithTags[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    fetchPosts()
  }, [options.page, options.limit, options.tags, options.search])
  
  const fetchPosts = async () => {
    setLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: String(options.page || 1),
        limit: String(options.limit || 10),
        ...(options.tags && { tags: options.tags.join(',') }),
        ...(options.search && { search: options.search }),
      })
      
      const res = await fetch(`/api/posts?${params}`)
      const data = await res.json()
      
      if (data.success) {
        setPosts(data.data.posts)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.error.message)
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }
  
  return { posts, pagination, loading, error, refetch: fetchPosts }
}
```

---

### 11.3 useTheme

**ファイル**: `hooks/useTheme.ts`

```typescript
// next-themesをラップ
import { useTheme as useNextTheme } from 'next-themes'

export function useTheme() {
  return useNextTheme()
}
```

---

## 12. コンポーネント命名規則

### 12.1 ファイル名
- **PascalCase**: `PostCard.tsx`
- **拡張子**: `.tsx` (JSXを含む) / `.ts` (含まない)

### 12.2 コンポーネント名
- **PascalCase**: `export function PostCard() {}`
- **Props型**: `PostCardProps`

### 12.3 Hooks名
- **camelCase**: `usePosts`
- **use接頭辞**: 必須

---

## 13. ドキュメント更新履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | 初版作成（コンポーネント設計確定版） |

---

## 承認状態

✅ **確定済み** - 本コンポーネント設計で開発を進めます。

次のステップ: `docs/state-management.md`（状態管理設計書）の作成
