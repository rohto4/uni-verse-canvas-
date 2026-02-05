# Component Specification (Claude Reference)

## 1. 設計方針
- Atomic Design部分採用（ui/feature/page層）
- Props型安全性: TypeScript厳密定義
- shadcn/ui: 基本UIコンポーネント全採用

## 2. ディレクトリ構成
```
components/
├── ui/          # shadcn/ui (Button, Card, Dialog, Input, Select, Tabs, Badge, Toast等)
├── layout/      # Header, Navigation, Sidebar, Footer, MobileMenu
├── editor/      # TiptapEditor, MenuBar, ImageUploader, extensions/
├── post/        # PostCard, PostContent, PostMeta, TableOfContents, RelatedPosts
├── project/     # ProjectCard, ProjectGallery, ProjectDetail
├── progress/    # ProgressCard, ProgressTimeline, StatusBadge
├── admin/       # AdminNav, PostList, BackupPanel, DashboardStats
└── common/      # ThemeToggle, SearchBox, TagFilter, Pagination, LoadingSpinner
```

## 3. 主要コンポーネントProps

### Layout
```typescript
interface HeaderProps { className?: string }
interface NavigationProps { items?: { label: string; href: string; icon?: ReactNode }[] }
interface SidebarProps { children: ReactNode; className?: string }
```

### Editor
```typescript
interface TiptapEditorProps {
  content?: JSONContent
  onChange?: (content: JSONContent) => void
  editable?: boolean
  placeholder?: string
}
interface MenuBarProps { editor: Editor }
interface ImageUploaderProps { editor: Editor; onUpload?: (url: string) => void }
```

### Post
```typescript
interface PostCardProps { post: PostWithTags; variant?: 'default' | 'compact' }
interface PostContentProps { content: JSONContent }
interface TableOfContentsProps { content: JSONContent }
interface RelatedPostsProps { postId: string; limit?: number }
```

### Project/Progress
```typescript
interface ProjectCardProps { project: ProjectWithTags; onClick?: () => void }
interface ProjectGalleryProps { projects: ProjectWithTags[]; columns?: 2 | 3 | 4 }
interface ProgressCardProps { item: InProgressWithProject }
interface StatusBadgeProps { status: 'not_started' | 'paused' | 'in_progress' | 'completed' }
```

### Common
```typescript
interface TagFilterProps {
  tags: TagWithCount[]
  selectedTags: string[]
  onToggle: (tagSlug: string) => void
  mode?: 'single' | 'multiple'
}
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
```

## 4. Tiptap拡張一覧
**標準**: StarterKit, CodeBlockLowlight(Shiki), Table, Image, Link, Youtube, Mathematics(KaTeX), TaskList, Placeholder, CharacterCount, Highlight, TextAlign, Underline, Subscript, Superscript, Color, TextStyle
**カスタム**: HorizontalImageLayout(横並び画像), SectionDivider(セクション区切り)

## 5. Hooks
```typescript
function useAuth(): { user: User | null; loading: boolean; isAdmin: boolean; signInWithGoogle; signOut }
function usePosts(options?: { page?; limit?; tags?; search? }): { posts; pagination; loading; error; refetch }
function useTheme(): { theme: 'light' | 'dark'; setTheme; toggleTheme }
```

## 6. 命名規則
- ファイル: PascalCase (`PostCard.tsx`)
- コンポーネント: PascalCase (`export function PostCard()`)
- Props型: `{ComponentName}Props`
- Hooks: camelCase + use接頭辞 (`usePosts`)
