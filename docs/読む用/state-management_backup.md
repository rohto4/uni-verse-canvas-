# docs/state-management.md

## Document Metadata
- **Version**: 1.0.0
- **Last Updated**: 2026-02-04
- **Status**: Confirmed (確定版)
- **Owner**: Senior Fullstack Engineer (DDD Specialist)
- **Project Name**: UniVerse Canvas

---

## 1. 状態管理概要

### 1.1 基本方針
- **ローカル優先**: コンポーネント固有の状態はローカルで管理
- **Context最小化**: 本当に必要な場合のみContext使用
- **Server State分離**: サーバーデータとクライアント状態を明確に分離
- **キャッシュ戦略**: ISRとクライアントキャッシュの併用

### 1.2 状態の分類

| 分類 | 管理方法 | 例 |
|-----|---------|---|
| **ローカルUI状態** | useState | モーダル開閉、フォーム入力値 |
| **グローバルUI状態** | React Context | ダークモード、サイドバー開閉 |
| **Server State** | Supabase + ISR | 記事データ、プロジェクトデータ |
| **認証状態** | Supabase Auth | ユーザー情報、セッション |
| **フォーム状態** | Controlled Component | 入力値、バリデーション |

---

## 2. ローカル状態管理

### 2.1 useState の使用パターン

**基本的なUI状態**
```typescript
// components/post/PostCard.tsx
export function PostCard({ post }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ... */}
    </Card>
  )
}
```

**モーダル開閉状態**
```typescript
// components/admin/PostList.tsx
export function PostList({ posts }: PostListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  
  const handleDelete = (id: string) => {
    setSelectedPostId(id)
    setDeleteDialogOpen(true)
  }
  
  return (
    <>
      {/* PostList */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        postId={selectedPostId}
      />
    </>
  )
}
```

**フォーム入力状態**
```typescript
// components/admin/PostMetaForm.tsx
export function PostMetaForm({ onSubmit }: PostMetaFormProps) {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ title, excerpt, tags: selectedTags })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
      />
      {/* ... */}
    </form>
  )
}
```

### 2.2 useReducer の使用パターン

**複雑なフォーム状態**
```typescript
// components/admin/PostEditorPage.tsx
type EditorState = {
  title: string
  content: JSONContent
  tags: string[]
  status: 'draft' | 'scheduled' | 'published'
  publishedAt: Date | null
  errors: Record<string, string>
}

type EditorAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_CONTENT'; payload: JSONContent }
  | { type: 'ADD_TAG'; payload: string }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'SET_STATUS'; payload: EditorState['status'] }
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERRORS' }

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload }
    case 'SET_CONTENT':
      return { ...state, content: action.payload }
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] }
    case 'REMOVE_TAG':
      return { ...state, tags: state.tags.filter(t => t !== action.payload) }
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.message }
      }
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} }
    default:
      return state
  }
}

export function PostEditorPage() {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  
  return (
    <div>
      <Input
        value={state.title}
        onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
      />
      {/* ... */}
    </div>
  )
}
```

---

## 3. グローバル状態管理（React Context）

### 3.1 ThemeContext（ダークモード）

**ファイル**: `contexts/ThemeContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  
  useEffect(() => {
    // LocalStorageから読み込み
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // システム設定に従う
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'dark' : 'light')
    }
  }, [])
  
  useEffect(() => {
    // DOM操作
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

**使用例**:
```typescript
// components/common/ThemeToggle.tsx
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <Button onClick={toggleTheme}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
```

---

### 3.2 SidebarContext（サイドバー状態）

**ファイル**: `contexts/SidebarContext.tsx`

```typescript
interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  
  const toggle = () => setIsOpen(prev => !prev)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  
  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
```

---

### 3.3 ToastContext（通知）

**ファイル**: `contexts/ToastContext.tsx`

```typescript
interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = nanoid()
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // 自動削除
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 3000)
    }
  }
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }
  
  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
```

**使用例**:
```typescript
// components/admin/PostEditorPage.tsx
import { useToast } from '@/contexts/ToastContext'

export function PostEditorPage() {
  const { addToast } = useToast()
  
  const handleSave = async () => {
    try {
      await savePost(data)
      addToast({ type: 'success', message: '記事を保存しました' })
    } catch (error) {
      addToast({ type: 'error', message: '保存に失敗しました' })
    }
  }
  
  return <div>{/* ... */}</div>
}
```

---

## 4. Server State管理

### 4.1 Supabase + ISR パターン

**サーバーコンポーネントでデータ取得**
```typescript
// app/(public)/posts/page.tsx
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // 1時間ごとに再生成

export default async function PostsPage({
  searchParams
}: {
  searchParams: { tags?: string; page?: string }
}) {
  const supabase = createClient()
  const page = Number(searchParams.page) || 1
  const tags = searchParams.tags?.split(',') || []
  
  // サーバーサイドで直接取得
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      post_tags(tag:tags(*))
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range((page - 1) * 10, page * 10 - 1)
  
  return (
    <div>
      {posts?.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

### 4.2 クライアントサイドでの動的取得

**カスタムHook使用**
```typescript
// hooks/usePosts.ts
import { createClient } from '@/lib/supabase/client'

export function usePosts(options: UsePostsOptions = {}) {
  const [data, setData] = useState<PostWithTags[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    const fetchPosts = async () => {
      setLoading(true)
      
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          post_tags(tag:tags(*))
        `)
        .eq('status', 'published')
      
      setData(posts || [])
      setLoading(false)
    }
    
    fetchPosts()
  }, [options])
  
  return { data, loading }
}
```

### 4.3 Supabase Realtime（将来実装）

**リアルタイム更新**
```typescript
// hooks/useRealtimePosts.ts
export function useRealtimePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  
  useEffect(() => {
    const supabase = createClient()
    
    // 初期データ取得
    supabase.from('posts').select('*').then(({ data }) => {
      setPosts(data || [])
    })
    
    // リアルタイム購読
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new as Post, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setPosts(prev => prev.map(p => 
            p.id === payload.new.id ? payload.new as Post : p
          ))
        } else if (payload.eventType === 'DELETE') {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  return posts
}
```

---

## 5. フォーム状態管理

### 5.1 Controlled Component パターン

**基本的なフォーム**
```typescript
export function PostMetaForm({ initialData, onSubmit }: PostMetaFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    tags: initialData?.tags || [],
  })
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
      />
      <Textarea
        value={formData.excerpt}
        onChange={(e) => handleChange('excerpt', e.target.value)}
      />
      <TagSelector
        selected={formData.tags}
        onChange={(tags) => handleChange('tags', tags)}
      />
      <Button type="submit">保存</Button>
    </form>
  )
}
```

### 5.2 バリデーション統合

**Zod + Custom Hook**
```typescript
// hooks/useFormValidation.ts
import { z } from 'zod'

export function useFormValidation<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validate = (data: z.infer<T>): boolean => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message
          return acc
        }, {} as Record<string, string>)
        setErrors(formattedErrors)
      }
      return false
    }
  }
  
  return { errors, validate }
}
```

**使用例**:
```typescript
import { createPostSchema } from '@/lib/validations/post'

export function PostEditorPage() {
  const [formData, setFormData] = useState<CreatePostRequest>({ ... })
  const { errors, validate } = useFormValidation(createPostSchema)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate(formData)) {
      return
    }
    
    // 保存処理
    await savePost(formData)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        error={errors.title}
      />
      {/* ... */}
    </form>
  )
}
```

---

## 6. キャッシュ戦略

### 6.1 ISR キャッシュ

**Next.js ISR設定**
```typescript
// app/(public)/posts/[slug]/page.tsx
export const revalidate = 3600 // 1時間

export async function generateStaticParams() {
  const supabase = createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('status', 'published')
  
  return posts?.map(post => ({ slug: post.slug })) || []
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  // キャッシュされたデータ使用
  const post = await getPostBySlug(params.slug)
  
  return <PostDetailView post={post} />
}
```

### 6.2 クライアントサイドキャッシュ

**SWR パターン（オプション）**
```typescript
// 将来的にSWRやReact Query導入を検討
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function usePosts() {
  const { data, error, mutate } = useSWR('/api/posts', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1分間は再取得しない
  })
  
  return {
    posts: data?.data?.posts || [],
    loading: !data && !error,
    error,
    refetch: mutate
  }
}
```

### 6.3 画像キャッシュ

**Next.js Image 自動キャッシュ**
```typescript
import Image from 'next/image'

export function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      {post.cover_image && (
        <Image
          src={post.cover_image}
          alt={post.title}
          width={800}
          height={400}
          priority={false} // 優先度低い画像はLazy Loading
        />
      )}
    </Card>
  )
}
```

---

## 7. 認証状態管理

### 7.1 useAuth Hook

**ファイル**: `hooks/useAuth.ts`

```typescript
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    // 認証状態変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  const signIn = async (email: string, password: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }
  
  const signInWithGoogle = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/dashboard`
      }
    })
    return { error }
  }
  
  const signOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  }
  
  return {
    user,
    loading,
    isAdmin: !!user,
    signIn,
    signInWithGoogle,
    signOut
  }
}
```

### 7.2 認証保護されたページ

**Server Component パターン**
```typescript
// app/(admin)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div className="admin-layout">
      <AdminNav />
      <main>{children}</main>
    </div>
  )
}
```

**Client Component パターン**
```typescript
// components/admin/ProtectedPage.tsx
export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return null
  }
  
  return <>{children}</>
}
```

---

## 8. 状態の永続化

### 8.1 LocalStorage

**テーマ設定**
```typescript
// contexts/ThemeContext.tsx
useEffect(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    setTheme(savedTheme as Theme)
  }
}, [])

useEffect(() => {
  localStorage.setItem('theme', theme)
}, [theme])
```

**下書き保存**
```typescript
// components/admin/PostEditorPage.tsx
const DRAFT_KEY = 'post-draft'

useEffect(() => {
  // 5秒ごとに自動保存
  const timer = setInterval(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
  }, 5000)
  
  return () => clearInterval(timer)
}, [formData])

useEffect(() => {
  // 初回読み込み時に復元
  const draft = localStorage.getItem(DRAFT_KEY)
  if (draft) {
    const shouldRestore = confirm('下書きを復元しますか？')
    if (shouldRestore) {
      setFormData(JSON.parse(draft))
    }
  }
}, [])
```

### 8.2 SessionStorage

**一時的な検索条件**
```typescript
// app/(public)/posts/page.tsx
export function PostsPage() {
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem('post-filters')
    return saved ? JSON.parse(saved) : { tags: [], search: '' }
  })
  
  useEffect(() => {
    sessionStorage.setItem('post-filters', JSON.stringify(filters))
  }, [filters])
  
  return <div>{/* ... */}</div>
}
```

---

## 9. パフォーマンス最適化

### 9.1 メモ化

**useMemo**
```typescript
export function PostList({ posts }: PostListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // 検索結果をメモ化
  const filteredPosts = useMemo(() => {
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [posts, searchQuery])
  
  return <div>{/* ... */}</div>
}
```

**useCallback**
```typescript
export function TagFilter({ tags, onToggle }: TagFilterProps) {
  // イベントハンドラをメモ化
  const handleToggle = useCallback((tagSlug: string) => {
    onToggle(tagSlug)
  }, [onToggle])
  
  return (
    <div>
      {tags.map(tag => (
        <Badge key={tag.id} onClick={() => handleToggle(tag.slug)}>
          {tag.name}
        </Badge>
      ))}
    </div>
  )
}
```

### 9.2 React.memo

**コンポーネントメモ化**
```typescript
export const PostCard = React.memo(function PostCard({ post }: PostCardProps) {
  return <Card>{/* ... */}</Card>
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return prevProps.post.id === nextProps.post.id &&
         prevProps.post.updated_at === nextProps.post.updated_at
})
```

---

## 10. デバッグ・開発ツール

### 10.1 React DevTools

**Context値の確認**
```typescript
// 開発環境のみでContextをグローバルに公開
if (process.env.NODE_ENV === 'development') {
  window.__DEBUG__ = {
    theme: useTheme(),
    auth: useAuth(),
  }
}
```

### 10.2 状態ログ

**カスタムHook**
```typescript
// hooks/useDebugValue.ts
export function useDebugState<T>(initialValue: T, label: string) {
  const [value, setValue] = useState(initialValue)
  
  useDebugValue(`${label}: ${JSON.stringify(value)}`)
  
  useEffect(() => {
    console.log(`[${label}] State changed:`, value)
  }, [value, label])
  
  return [value, setValue] as const
}
```

---

## 11. 状態管理のベストプラクティス

### 11.1 Do's ✅
- ローカル状態で解決できるものはローカルで管理
- Context は必要最小限に留める
- Server State と Client State を明確に分離
- 状態の正規化（重複を避ける）
- 適切なメモ化でパフォーマンス最適化

### 11.2 Don'ts ❌
- 全ての状態をグローバルに置かない
- Prop Drilling を避けるためだけにContext使用
- Server State をクライアント状態として扱わない
- 過度なメモ化（可読性低下）
- LocalStorageへの大量データ保存

---

## 12. 将来的な拡張検討

### 12.1 React Query 導入（優先度: 中）
- Server State管理の専門ライブラリ
- キャッシュ・リフェッチ・楽観的更新
- 導入タイミング: 複雑な状態管理が必要になった時点

### 12.2 Zustand 導入（優先度: 低）
- 軽量なグローバル状態管理
- Context APIより簡潔
- 導入タイミング: Context が3つ以上になった時点

---

## 13. ドキュメント更新履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | 初版作成（状態管理設計確定版） |

---

## 承認状態

✅ **確定済み** - 本状態管理設計で開発を進めます。

次のステップ: Phase 2 のドキュメント作成 or 実装開始
