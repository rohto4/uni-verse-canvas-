# docs/api-spec.md

## Document Metadata
- **Version**: 1.0.0
- **Last Updated**: 2026-02-04
- **Status**: Confirmed (確定版)
- **Owner**: Senior Fullstack Engineer (DDD Specialist)
- **Project Name**: UniVerse Canvas

---

## 1. API概要

### 1.1 基本情報
- **ベースURL**: `https://yourdomain.com/api`
- **プロトコル**: HTTPS
- **データ形式**: JSON
- **文字エンコーディング**: UTF-8
- **認証方式**: Supabase Session Cookie（管理画面のみ）

### 1.2 レスポンス形式

**成功レスポンス**
```typescript
{
  success: true,
  data: T,
  message?: string
}
```

**エラーレスポンス**
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

---

## 2. 認証・認可

### 2.1 認証方式

| エンドポイント | 認証要否 | 方式 |
|-------------|---------|------|
| `/api/posts` (GET) | 不要 | - |
| `/api/posts` (POST/PUT/DELETE) | 必要 | Supabase Session |
| `/api/backup/*` | 必要 | Supabase Session |
| `/api/qiita/*` | 必要 | Supabase Session |

### 2.2 認証チェック

```typescript
// lib/api/auth.ts
import { createClient } from '@/lib/supabase/server'

export async function requireAuth() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (!session || error) {
    return {
      authorized: false,
      response: Response.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '認証が必要です' } },
        { status: 401 }
      )
    }
  }
  
  return { authorized: true, userId: session.user.id }
}
```

---

## 3. API エンドポイント一覧

### 3.1 記事（Posts）

#### GET `/api/posts`
**用途**: 記事一覧取得（公開記事のみ）

**クエリパラメータ**:
```typescript
interface GetPostsQuery {
  page?: number          // ページ番号（デフォルト: 1）
  limit?: number         // 取得件数（デフォルト: 10、最大: 50）
  tags?: string          // タグフィルタ（カンマ区切り: "tech,diary"）
  status?: 'draft' | 'published' | 'scheduled'  // 管理者のみ
  search?: string        // 全文検索キーワード
  sort?: 'latest' | 'oldest' | 'popular'  // ソート順
}
```

**レスポンス**:
```typescript
interface GetPostsResponse {
  success: true
  data: {
    posts: PostWithTags[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

interface PostWithTags {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: 'draft' | 'scheduled' | 'published'
  published_at: string | null
  cover_image: string | null
  view_count: number
  created_at: string
  updated_at: string
  tags: {
    id: string
    name: string
    slug: string
    color: string
  }[]
}
```

**実装例**:
```typescript
// app/api/posts/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number(searchParams.get('page')) || 1
  const limit = Math.min(Number(searchParams.get('limit')) || 10, 50)
  const tags = searchParams.get('tags')?.split(',') || []
  const search = searchParams.get('search')
  
  const supabase = createClient()
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      post_tags(tag:tags(*))
    `, { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)
  
  // タグフィルタ
  if (tags.length > 0) {
    query = query.filter('post_tags.tag.slug', 'in', `(${tags.join(',')})`)
  }
  
  // 全文検索
  if (search) {
    query = query.textSearch('title', search)
  }
  
  const { data, error, count } = await query
  
  if (error) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    )
  }
  
  return Response.json({
    success: true,
    data: {
      posts: data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalCount: count || 0,
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1
      }
    }
  })
}
```

---

#### GET `/api/posts/[slug]`
**用途**: 記事詳細取得

**パスパラメータ**:
- `slug`: string（記事スラッグ）

**レスポンス**:
```typescript
interface GetPostResponse {
  success: true
  data: {
    post: PostWithRelations
  }
}

interface PostWithRelations {
  id: string
  title: string
  slug: string
  content: JSONContent  // Tiptap JSON
  excerpt: string | null
  status: 'draft' | 'scheduled' | 'published'
  published_at: string | null
  cover_image: string | null
  ogp_image: string | null
  view_count: number
  created_at: string
  updated_at: string
  tags: Tag[]
  relatedPosts: PostWithTags[]
  relatedProjects: ProjectWithTags[]
}
```

---

#### POST `/api/posts`
**用途**: 記事作成（管理者のみ）

**リクエストボディ**:
```typescript
interface CreatePostRequest {
  title: string
  slug?: string  // 未指定時は自動生成
  content: JSONContent
  excerpt?: string
  status: 'draft' | 'scheduled' | 'published'
  published_at?: string  // ISO 8601形式
  cover_image?: string
  ogp_image?: string
  tags: string[]  // タグID配列
  relatedPostIds?: string[]
  relatedProjectIds?: string[]
}
```

**レスポンス**:
```typescript
interface CreatePostResponse {
  success: true
  data: {
    post: Post
    message: '記事を作成しました'
  }
}
```

---

#### PUT `/api/posts/[id]`
**用途**: 記事更新（管理者のみ）

**リクエストボディ**: `CreatePostRequest` と同様

**レスポンス**:
```typescript
interface UpdatePostResponse {
  success: true
  data: {
    post: Post
    message: '記事を更新しました'
  }
}
```

---

#### DELETE `/api/posts/[id]`
**用途**: 記事削除（管理者のみ）

**レスポンス**:
```typescript
interface DeletePostResponse {
  success: true
  data: {
    message: '記事を削除しました'
  }
}
```

---

### 3.2 プロジェクト（Projects）

#### GET `/api/projects`
**用途**: プロジェクト一覧取得

**クエリパラメータ**:
```typescript
interface GetProjectsQuery {
  page?: number
  limit?: number
  tags?: string
  status?: 'completed' | 'archived'
}
```

**レスポンス**:
```typescript
interface GetProjectsResponse {
  success: true
  data: {
    projects: ProjectWithTags[]
    pagination: PaginationInfo
  }
}

interface ProjectWithTags {
  id: string
  title: string
  slug: string
  description: string
  demo_url: string | null
  github_url: string | null
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  status: 'completed' | 'archived'
  view_count: number
  created_at: string
  updated_at: string
  tags: Tag[]
}
```

---

#### GET `/api/projects/[slug]`
**用途**: プロジェクト詳細取得

**レスポンス**:
```typescript
interface GetProjectResponse {
  success: true
  data: {
    project: ProjectWithRelations
  }
}

interface ProjectWithRelations extends ProjectWithTags {
  content: JSONContent | null
  relatedPosts: PostWithTags[]
}
```

---

#### POST `/api/projects`
**用途**: プロジェクト作成（管理者のみ）

**リクエストボディ**:
```typescript
interface CreateProjectRequest {
  title: string
  slug?: string
  description: string
  content?: JSONContent
  demo_url?: string
  github_url?: string
  cover_image?: string
  ogp_image?: string
  start_date?: string
  end_date?: string
  tags: string[]
}
```

---

### 3.3 進行中（In Progress）

#### GET `/api/in-progress`
**用途**: 進行中一覧取得

**クエリパラメータ**:
```typescript
interface GetInProgressQuery {
  status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
}
```

**レスポンス**:
```typescript
interface GetInProgressResponse {
  success: true
  data: {
    items: InProgressWithProject[]
  }
}

interface InProgressWithProject {
  id: string
  title: string
  description: string
  status: 'not_started' | 'paused' | 'in_progress' | 'completed'
  progress_rate: number
  started_at: string | null
  completed_at: string | null
  completed_project_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  completedProject?: ProjectWithTags
}
```

---

#### POST `/api/in-progress`
**用途**: 進行中作成（管理者のみ）

**リクエストボディ**:
```typescript
interface CreateInProgressRequest {
  title: string
  description: string
  status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
  progress_rate?: number
  started_at?: string
  notes?: string
}
```

---

#### PUT `/api/in-progress/[id]`
**用途**: 進行中更新（管理者のみ）

**リクエストボディ**:
```typescript
interface UpdateInProgressRequest {
  title?: string
  description?: string
  status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
  progress_rate?: number
  completed_at?: string
  completed_project_id?: string
  notes?: string
}
```

---

### 3.4 タグ（Tags）

#### GET `/api/tags`
**用途**: タグ一覧取得

**クエリパラメータ**:
```typescript
interface GetTagsQuery {
  withCount?: boolean  // 記事数・プロジェクト数を含める
}
```

**レスポンス**:
```typescript
interface GetTagsResponse {
  success: true
  data: {
    tags: TagWithCount[]
  }
}

interface TagWithCount {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  postCount?: number
  projectCount?: number
}
```

---

#### POST `/api/tags`
**用途**: タグ作成（管理者のみ）

**リクエストボディ**:
```typescript
interface CreateTagRequest {
  name: string
  slug?: string
  description?: string
  color?: string  // Hex color code
}
```

---

### 3.5 固定ページ（Pages）

#### GET `/api/pages/[pageType]`
**用途**: 固定ページ取得

**パスパラメータ**:
- `pageType`: 'home' | 'about' | 'links'

**レスポンス**:
```typescript
interface GetPageResponse {
  success: true
  data: {
    page: Page
  }
}

interface Page {
  id: string
  page_type: string
  title: string
  content: JSONContent
  metadata: {
    ogp_image?: string
    [key: string]: any
  } | null
  created_at: string
  updated_at: string
}
```

---

#### PUT `/api/pages/[pageType]`
**用途**: 固定ページ更新（管理者のみ）

**リクエストボディ**:
```typescript
interface UpdatePageRequest {
  title?: string
  content?: JSONContent
  metadata?: Record<string, any>
}
```

---

### 3.6 バックアップ（Backup）

#### POST `/api/backup/export`
**用途**: データエクスポート（管理者のみ）

**リクエストボディ**:
```typescript
interface ExportRequest {
  type: 'single' | 'all'
  target?: 'post' | 'project' | 'in_progress'
  targetId?: string  // type='single'時に必須
  format: 'json' | 'markdown'
}
```

**レスポンス**:
```typescript
// Content-Type: application/json or text/markdown
// Content-Disposition: attachment; filename="export_{timestamp}.json"

interface ExportResponse {
  version: string
  exportedAt: string
  type: 'post' | 'project' | 'all'
  data: any
}
```

---

#### POST `/api/backup/import`
**用途**: データインポート（管理者のみ）

**リクエストボディ**:
```typescript
// Content-Type: multipart/form-data
interface ImportRequest {
  file: File  // JSON形式
  overwrite?: boolean  // 重複時に上書き
}
```

**レスポンス**:
```typescript
interface ImportResponse {
  success: true
  data: {
    imported: number
    skipped: number
    errors: string[]
    message: string
  }
}
```

---

### 3.7 Qiita連携（Qiita）

#### POST `/api/qiita/refresh`
**用途**: Qiita記事キャッシュ更新（管理者のみ）

**リクエストボディ**:
```typescript
interface RefreshQiitaRequest {
  username: string
  limit?: number  // 取得件数（デフォルト: 10）
}
```

**レスポンス**:
```typescript
interface RefreshQiitaResponse {
  success: true
  data: {
    fetched: number
    cached: number
    message: string
  }
}
```

**実装例**:
```typescript
// app/api/qiita/refresh/route.ts
export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authorized) return auth.response
  
  const body = await request.json()
  const { username, limit = 10 } = body
  
  // Qiita API v2呼び出し
  const response = await fetch(
    `https://qiita.com/api/v2/users/${username}/items?per_page=${limit}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.QIITA_ACCESS_TOKEN}`
      }
    }
  )
  
  if (!response.ok) {
    return Response.json(
      { success: false, error: { code: 'QIITA_API_ERROR', message: 'Qiita APIエラー' } },
      { status: 500 }
    )
  }
  
  const items = await response.json()
  const supabase = createClient()
  
  // キャッシュテーブルに保存
  const { error } = await supabase.from('qiita_cache').upsert(
    items.map((item: any) => ({
      qiita_id: item.id,
      title: item.title,
      url: item.url,
      likes_count: item.likes_count,
      published_at: item.created_at
    })),
    { onConflict: 'qiita_id' }
  )
  
  if (error) {
    return Response.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    )
  }
  
  return Response.json({
    success: true,
    data: {
      fetched: items.length,
      cached: items.length,
      message: 'Qiita記事を更新しました'
    }
  })
}
```

---

#### GET `/api/qiita/cache`
**用途**: キャッシュされたQiita記事取得

**レスポンス**:
```typescript
interface GetQiitaCacheResponse {
  success: true
  data: {
    items: QiitaCache[]
  }
}

interface QiitaCache {
  id: string
  qiita_id: string
  title: string
  url: string
  likes_count: number
  published_at: string
  created_at: string
  updated_at: string
}
```

---

### 3.8 プレビュー（Preview）

#### POST `/api/preview`
**用途**: プレビュー生成（管理者のみ）

**リクエストボディ**:
```typescript
interface CreatePreviewRequest {
  content: JSONContent
  type: 'post' | 'project' | 'page'
}
```

**レスポンス**:
```typescript
interface CreatePreviewResponse {
  success: true
  data: {
    previewUrl: string  // /api/preview/[token]
    expiresAt: string
  }
}
```

---

### 3.9 OGP画像生成（OG）

#### GET `/api/og?title=...&type=...`
**用途**: 動的OGP画像生成

**クエリパラメータ**:
```typescript
interface OGImageQuery {
  title: string
  type?: 'post' | 'project' | 'page'
  subtitle?: string
}
```

**レスポンス**:
```typescript
// Content-Type: image/png
// 1200x630px PNG画像
```

**実装例**:
```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'UniVerse Canvas'
  const type = searchParams.get('type') || 'post'
  
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
          fontSize: 60,
          fontWeight: 'bold',
          padding: 80,
        }}
      >
        <div>{title}</div>
        <div style={{ fontSize: 30, marginTop: 20, opacity: 0.7 }}>
          UniVerse Canvas
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

---

## 4. エラーコード一覧

| コード | HTTPステータス | 説明 |
|-------|--------------|------|
| `UNAUTHORIZED` | 401 | 認証が必要です |
| `FORBIDDEN` | 403 | アクセス権限がありません |
| `NOT_FOUND` | 404 | リソースが見つかりません |
| `VALIDATION_ERROR` | 400 | バリデーションエラー |
| `DB_ERROR` | 500 | データベースエラー |
| `QIITA_API_ERROR` | 500 | Qiita APIエラー |
| `RATE_LIMIT_EXCEEDED` | 429 | レート制限超過 |
| `INTERNAL_ERROR` | 500 | 内部エラー |

---

## 5. Rate Limiting

### 5.1 制限値

| エンドポイント | 制限 | 単位 |
|-------------|------|------|
| `/api/posts` (GET) | 100 | req/min/IP |
| `/api/posts` (POST/PUT/DELETE) | 20 | req/min/user |
| `/api/backup/*` | 5 | req/min/user |
| `/api/qiita/refresh` | 1 | req/10min/user |

### 5.2 レスポンスヘッダー

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## 6. バリデーション

### 6.1 共通バリデーション

```typescript
// lib/validations/common.ts
import { z } from 'zod'

export const slugSchema = z.string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9-]+$/, 'スラッグは小文字英数字とハイフンのみ')

export const titleSchema = z.string()
  .min(1, 'タイトルは必須です')
  .max(200, 'タイトルは200文字以内')

export const statusSchema = z.enum(['draft', 'scheduled', 'published'])
```

### 6.2 記事バリデーション

```typescript
// lib/validations/post.ts
export const createPostSchema = z.object({
  title: titleSchema,
  slug: slugSchema.optional(),
  content: z.any(),  // JSONContent
  excerpt: z.string().max(300).optional(),
  status: statusSchema,
  published_at: z.string().datetime().optional(),
  cover_image: z.string().url().optional(),
  ogp_image: z.string().url().optional(),
  tags: z.array(z.string().uuid()),
  relatedPostIds: z.array(z.string().uuid()).optional(),
  relatedProjectIds: z.array(z.string().uuid()).optional(),
})
```

---

## 7. WebSocket（将来実装）

### 7.1 リアルタイム更新

```typescript
// Supabase Realtime使用
const supabase = createClient()

supabase
  .channel('posts')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'posts'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

---

## 8. ドキュメント更新履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | 初版作成（API仕様確定版） |

---

## 承認状態

✅ **確定済み** - 本API仕様で開発を進めます。

次のステップ: `docs/component-spec.md`（コンポーネント設計書）の作成
