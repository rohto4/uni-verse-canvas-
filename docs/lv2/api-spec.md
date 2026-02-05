# docs/api-spec.md

## 1. API概要

- **ベースURL**: `https://yourdomain.com/api`
- **データ形式**: JSON / UTF-8
- **認証**: Supabase Session Cookie（管理画面のみ）

**レスポンス形式**
```typescript
// 成功
{ success: true, data: T, message?: string }

// エラー
{ success: false, error: { code: string, message: string, details?: any } }
```

---

## 2. 認証・認可

| エンドポイント | 認証 |
|-------------|------|
| GET `/api/posts`, `/api/projects`, `/api/tags` | 不要 |
| POST/PUT/DELETE 全般 | 必要（Supabase Session） |
| `/api/backup/*`, `/api/qiita/*` | 必要 |

---

## 3. API エンドポイント

### 3.1 記事（Posts）

#### GET `/api/posts`
**クエリ**: page, limit(最大50), tags(カンマ区切り), status, search, sort(latest/oldest/popular)

**レスポンス**
```typescript
{
  posts: PostWithTags[],
  pagination: { currentPage, totalPages, totalCount, hasNext, hasPrev }
}
```

#### GET `/api/posts/[slug]`
**レスポンス**: `{ post: PostWithRelations }`

#### POST `/api/posts` (認証必須)
```typescript
// リクエスト
{
  title: string,
  slug?: string,
  content: JSONContent,
  excerpt?: string,
  status: 'draft' | 'scheduled' | 'published',
  published_at?: string,
  cover_image?: string,
  tags: string[],
  relatedPostIds?: string[],
  relatedProjectIds?: string[]
}
```

#### PUT `/api/posts/[id]` (認証必須)
リクエストはPOSTと同様

#### DELETE `/api/posts/[id]` (認証必須)

---

### 3.2 プロジェクト（Projects）

#### GET `/api/projects`
**クエリ**: page, limit, tags, status(completed/archived)

#### GET `/api/projects/[slug]`

#### POST `/api/projects` (認証必須)
```typescript
{
  title: string,
  slug?: string,
  description: string,
  content?: JSONContent,
  demo_url?: string,
  github_url?: string,
  cover_image?: string,
  tags: string[]
}
```

---

### 3.3 進行中（In Progress）

#### GET `/api/in-progress`
**クエリ**: status(not_started/paused/in_progress/completed)

#### POST `/api/in-progress` (認証必須)
```typescript
{
  title: string,
  description: string,
  status?: string,
  progress_rate?: number,
  started_at?: string,
  notes?: string
}
```

#### PUT `/api/in-progress/[id]` (認証必須)

---

### 3.4 タグ（Tags）

#### GET `/api/tags`
**クエリ**: withCount(boolean)
**レスポンス**: `{ tags: TagWithCount[] }`

#### POST `/api/tags` (認証必須)
```typescript
{ name: string, slug?: string, description?: string, color?: string }
```

---

### 3.5 固定ページ（Pages）

#### GET `/api/pages/[pageType]`
**pageType**: home / about / links

#### PUT `/api/pages/[pageType]` (認証必須)
```typescript
{ title?: string, content?: JSONContent, metadata?: Record<string, any> }
```

---

### 3.6 バックアップ（Backup）

#### POST `/api/backup/export` (認証必須)
```typescript
{
  type: 'single' | 'all',
  target?: 'post' | 'project' | 'in_progress',
  targetId?: string,
  format: 'json' | 'markdown'
}
```
**レスポンス**: ファイルダウンロード

#### POST `/api/backup/import` (認証必須)
Content-Type: multipart/form-data
```typescript
{ file: File, overwrite?: boolean }
```
**レスポンス**: `{ imported: number, skipped: number, errors: string[] }`

---

### 3.7 Qiita連携

#### POST `/api/qiita/refresh` (認証必須)
```typescript
{ username: string, limit?: number }
```
**レスポンス**: `{ fetched: number, cached: number }`

#### GET `/api/qiita/cache`
**レスポンス**: `{ items: QiitaCache[] }`

---

### 3.8 OGP画像生成

#### GET `/api/og?title=...&type=...`
**クエリ**: title, type(post/project/page), subtitle
**レスポンス**: 1200x630px PNG画像

---

## 4. エラーコード

| コード | HTTP | 説明 |
|-------|------|------|
| UNAUTHORIZED | 401 | 認証が必要 |
| FORBIDDEN | 403 | アクセス権限なし |
| NOT_FOUND | 404 | リソースなし |
| VALIDATION_ERROR | 400 | バリデーションエラー |
| DB_ERROR | 500 | DBエラー |
| RATE_LIMIT_EXCEEDED | 429 | レート制限超過 |

---

## 5. Rate Limiting

| エンドポイント | 制限 |
|-------------|------|
| GET `/api/posts` | 100 req/min/IP |
| POST/PUT/DELETE | 20 req/min/user |
| `/api/backup/*` | 5 req/min/user |
| `/api/qiita/refresh` | 1 req/10min/user |

**レスポンスヘッダー**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## 6. バリデーション（Zod）

```typescript
// 共通
const slugSchema = z.string().min(1).max(200).regex(/^[a-z0-9-]+$/)
const titleSchema = z.string().min(1).max(200)
const statusSchema = z.enum(['draft', 'scheduled', 'published'])

// 記事
const createPostSchema = z.object({
  title: titleSchema,
  slug: slugSchema.optional(),
  content: z.any(),
  excerpt: z.string().max(300).optional(),
  status: statusSchema,
  published_at: z.string().datetime().optional(),
  tags: z.array(z.string().uuid()),
  relatedPostIds: z.array(z.string().uuid()).optional(),
  relatedProjectIds: z.array(z.string().uuid()).optional(),
})
```
