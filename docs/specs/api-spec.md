# Server Actions 仕様書

## 1. 概要

- **実装方式**: Next.js 15 Server Actions (`'use server'`)
- **データソース**: Supabase PostgreSQL
- **認証**: Supabase Auth (Google OAuth) + Middleware保護
- **データ形式**: TypeScript型安全

**Server Actionsの利点**:
- 型安全なAPI通信
- サーバーサイドでのデータフェッチ
- クライアントバンドルサイズの削減
- セキュアなデータベースアクセス

---

## 2. Server Actions一覧

### 2.1 記事（Posts）

**ファイル**: `src/lib/actions/posts.ts`

#### `getPosts(params?: GetPostsParams): Promise<PaginatedPosts>`

記事一覧を取得する関数。

**パラメータ**:
```typescript
interface GetPostsParams {
  page?: number              // ページ番号（デフォルト: 1）
  limit?: number             // 1ページあたりの件数（デフォルト: 10）
  tags?: string[]            // タグスラッグの配列（AND検索）
  search?: string            // 検索キーワード（タイトル・抜粋・本文を検索）
  sort?: 'latest' | 'oldest' | 'popular'  // ソート順（デフォルト: 'latest'）
  status?: 'published' | 'draft' | 'scheduled'  // ステータスフィルタ（デフォルト: 'published'）
}
```

**戻り値**:
```typescript
interface PaginatedPosts {
  posts: PostWithTags[]      // 記事の配列
  pagination: {
    currentPage: number      // 現在のページ番号
    totalPages: number       // 総ページ数
    totalCount: number       // 総記事数
    hasNext: boolean         // 次ページの有無
    hasPrev: boolean         // 前ページの有無
  }
}
```

**機能**:
- ✅ ページネーション
- ✅ タグフィルタリング（AND検索 - 全てのタグを含む記事のみ）
- ✅ 検索機能（タイトル・抜粋・本文）
- ✅ ソート（最新順・古い順・人気順）
- ✅ ステータスフィルタ（公開済み・下書き・予約投稿）
- ✅ scheduled記事の自動公開判定（`published_at <= NOW()`）

**使用例**:
```typescript
// 基本的な取得
const result = await getPosts()

// タグフィルタ + 検索
const filtered = await getPosts({
  tags: ['nextjs', 'react'],
  search: 'TypeScript',
  page: 1,
  limit: 10,
  sort: 'popular'
})
```

---

#### `getPostBySlug(slug: string): Promise<PostWithTags | null>`

スラッグから記事を取得。閲覧数（view_count）を自動的にインクリメント。

**パラメータ**:
- `slug`: URLスラッグ（例: `"my-first-post"`）

**戻り値**:
- `PostWithTags`: 記事データ（タグを含む）
- `null`: 記事が見つからない場合

**副作用**:
- 記事の`view_count`を+1する（バックグラウンド処理）

**使用例**:
```typescript
const post = await getPostBySlug('introduction-to-nextjs')
if (post) {
  console.log(post.title, post.tags)
}
```

---

#### `getRelatedPosts(postId: string, limit?: number): Promise<PostWithTags[]>`

関連記事を取得。タグの類似度でソート。

**パラメータ**:
- `postId`: 基準となる記事のID
- `limit`: 取得件数（デフォルト: 3）

**戻り値**:
- `PostWithTags[]`: 関連記事の配列

**ロジック**:
1. 基準記事のタグを取得
2. 同じタグを持つ他の記事を検索
3. タグの一致数でソート（関連度が高い順）
4. 公開済み記事のみ返却

**使用例**:
```typescript
const related = await getRelatedPosts('post-id-123', 5)
```

---

#### `getRelatedPostsByTagsWithRandom(tagIds: string[], limit?: number, candidateLimit?: number): Promise<PostWithTags[]>`

タグIDから関連記事を取得。関連性評価 + ランダマイズ機能付き。

**パラメータ**:
- `tagIds`: タグIDの配列
- `limit`: 取得件数（デフォルト: 3）
- `candidateLimit`: 候補記事の上限（デフォルト: 10）

**戻り値**:
- `PostWithTags[]`: 関連記事の配列

**ロジック**:
1. タグが一致する記事を取得
2. タグの一致数でスコアリング
3. 上位N件（candidateLimit）を候補として選択
4. 候補の中からランダムにlimit件を選択
5. 公開済み記事のみ返却

**フォールバック**:
- タグが一致しない場合は最新記事を返却

**使用例**:
```typescript
// プロジェクトの関連記事を取得
const tagIds = project.tags.map(t => t.id)
const related = await getRelatedPostsByTagsWithRandom(tagIds, 3, 10)
```

**特徴**:
- ✅ 関連性を保ちつつランダム性を持たせる
- ✅ アクセスごとに異なる記事を表示
- ✅ 無関係な記事は表示されない

---

#### `createPost(input: CreatePostInput): Promise<ActionResponse<PostWithTags>>`

新規記事を作成。

- ✅ Zodバリデーション
- ✅ タグ紐付け
- ✅ トランザクション補償

#### `updatePost(id: string, input: UpdatePostInput): Promise<ActionResponse<PostWithTags>>`

既存記事を更新。

- ✅ 部分更新対応
- ✅ タグの再設定
- ✅ ロールバック処理

#### `deletePost(id: string): Promise<ActionResponse<void>>`

記事を削除。

---

### 2.2 プロジェクト（Projects）

**ファイル**: `src/lib/actions/projects.ts`

#### `getProjects(params?: GetProjectsParams): Promise<ProjectWithTags[]>`

プロジェクト一覧を取得。

**パラメータ**:
```typescript
interface GetProjectsParams {
  status?: 'completed' | 'archived'  // ステータスフィルタ（デフォルト: 'completed'）
  tags?: string[]                     // タグスラッグの配列（AND検索）
}
```

**戻り値**:
- `ProjectWithTags[]`: プロジェクトの配列

**機能**:
- ✅ ステータスフィルタ（完了済み・アーカイブ）
- ✅ タグフィルタリング（AND検索）
- ✅ 作成日降順でソート

**使用例**:
```typescript
// 完了済みプロジェクトを全取得
const projects = await getProjects()

// タグでフィルタ
const filtered = await getProjects({
  tags: ['nextjs', 'typescript'],
  status: 'completed'
})
```

---

#### `getProjectBySlug(slug: string): Promise<ProjectWithTags | null>`

スラッグからプロジェクトを取得。

**パラメータ**:
- `slug`: URLスラッグ

**戻り値**:
- `ProjectWithTags`: プロジェクトデータ（タグを含む）
- `null`: プロジェクトが見つからない場合

---

#### `createProject(input: CreateProjectInput): Promise<ProjectWithTags | null>`

新規プロジェクトを作成。

**パラメータ**:
```typescript
interface CreateProjectInput {
  title: string
  slug: string
  description: string
  content: JSONContent | null
  demo_url: string | null
  github_url: string | null
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  status: 'completed' | 'archived'
  steps_count: number | null
  used_ai: string[] | null
  gallery_images: string[] | null
  tech_stack: Record<string, number> | null
  tags: string[]  // Tag IDs
}
```

**戻り値**:
- `ProjectWithTags`: 作成されたプロジェクトデータ
- `null`: 作成失敗時

**機能**:
- ✅ プロジェクトデータの挿入
- ✅ タグの紐付け（project_tagsテーブル）
- ✅ JSONBフィールドの自動変換（used_ai, tech_stack）

---

#### `updateProject(id: string, input: Partial<CreateProjectInput>): Promise<ProjectWithTags | null>`

既存プロジェクトを更新。

**パラメータ**:
- `id`: プロジェクトID（UUID）
- `input`: 更新するフィールド（部分更新可能）

**戻り値**:
- `ProjectWithTags`: 更新されたプロジェクトデータ
- `null`: 更新失敗時

**機能**:
- ✅ 部分更新対応
- ✅ タグの再設定（既存タグを削除して新規登録）
- ✅ JSONBフィールドの自動変換

---

#### `deleteProject(id: string): Promise<{ success: boolean; error?: string }>`

プロジェクトを削除。

**パラメータ**:
- `id`: プロジェクトID（UUID）

**戻り値**:
```typescript
{ success: true }  // 削除成功
{ success: false, error: string }  // 削除失敗
```

**機能**:
- ✅ 関連タグの自動削除（project_tagsテーブル）
- ✅ プロジェクト本体の削除

---

### 2.3 進行中（In Progress）

**ファイル**: `src/lib/actions/in-progress.ts`

#### `getInProgressItems(status?: string): Promise<InProgressWithProject[]>`

進行中のアイテム一覧を取得。

**パラメータ**:
- `status`: ステータスフィルタ（オプション）
  - `'not_started'`: 未着手
  - `'paused'`: 中断中
  - `'in_progress'`: 進行中
  - `'completed'`: 完了

**戻り値**:
- `InProgressWithProject[]`: 進行中アイテムの配列

**機能**:
- ✅ ステータスフィルタ
- ✅ 完了後のプロジェクトとの紐付け（`completedProject`）
- ✅ 作成日降順でソート

**使用例**:
```typescript
// 全件取得
const all = await getInProgressItems()

// 進行中のみ
const inProgress = await getInProgressItems('in_progress')
```

---

#### `getInProgressById(id: string): Promise<InProgressWithProject | null>`

IDから進行中アイテムを取得。

**パラメータ**:
- `id`: アイテムID（UUID）

**戻り値**:
- `InProgressWithProject`: アイテムデータ
- `null`: アイテムが見つからない場合

---

### 2.4 タグ（Tags）

**ファイル**: `src/lib/actions/tags.ts`

#### `getTags(): Promise<Tag[]>`

全タグを取得。

**戻り値**:
- `Tag[]`: タグの配列（名前順でソート）

---

#### `getTagsWithCount(): Promise<TagWithCount[]>`

タグと使用回数を取得。

**戻り値**:
```typescript
interface TagWithCount extends Tag {
  postCount: number      // 記事での使用回数
  projectCount: number   // プロジェクトでの使用回数
}
```

**機能**:
- ✅ 各タグの使用回数を集計
- ✅ 記事とプロジェクトの両方をカウント

**使用例**:
```typescript
const tags = await getTagsWithCount()
tags.forEach(tag => {
  console.log(`${tag.name}: ${tag.postCount}件の記事、${tag.projectCount}件のプロジェクト`)
})
```

---

#### `getTagBySlug(slug: string): Promise<Tag | null>`

スラッグからタグを取得。

**パラメータ**:
- `slug`: タグスラッグ

**戻り値**:
- `Tag`: タグデータ
- `null`: タグが見つからない場合

---

### 2.5 固定ページ（Pages）

**ファイル**: `src/lib/actions/pages.ts`

#### `getPage(pageType: 'home' | 'about' | 'links'): Promise<Page | null>`

固定ページのデータを取得。

**パラメータ**:
- `pageType`: ページタイプ
  - `'home'`: ホーム
  - `'about'`: 自己紹介
  - `'links'`: 関連リンク

**戻り値**:
- `Page`: ページデータ（Tiptap JSONコンテンツ + メタデータ）
- `null`: ページが見つからない場合

**使用例**:
```typescript
const about = await getPage('about')
if (about) {
  console.log(about.title, about.content, about.metadata)
}
```

---

#### `getAllPages(): Promise<Page[]>`

全ての固定ページを取得。

**戻り値**:
- `Page[]`: ページの配列

---

### 2.6 バックアップ（Backup）

**ファイル**: `src/lib/actions/backup.ts`

#### `exportData(): Promise<any>`

全テーブルのデータをJSON形式でエクスポート。

#### `importData(jsonData: any): Promise<{ success: boolean; error?: string }>`

JSONデータから全テーブルを復元（UPSERT）。

---

### 2.7 システム・統計（System）

**ファイル**: `src/lib/actions/system.ts`

#### `getDashboardStats(): Promise<DashboardStats>`

総数（記事・プロジェクト・進行中・タグ）、累計閲覧数、最近のアクティビティを取得。

---

## 3. エラーハンドリング

### 3.1 基本方針

- **Server Actions内でエラーをキャッチ**し、空の配列や`null`を返却
- **コンソールにエラーログを出力**（`console.error`）
- **フロントエンドにはエラーを伝播させない**（UXのため）

### 3.2 実装例

```typescript
const { data, error } = await supabase.from('posts').select('*')

if (error) {
  console.error('Error fetching posts:', error)
  return []  // 空配列を返却
}
```

### 3.3 エラーパターン

| エラー | 対応 |
|-------|------|
| データベース接続エラー | 空配列/nullを返却 |
| データが見つからない | `null`または空配列を返却 |
| バリデーションエラー | 現在は未実装（今後追加予定） |

---

## 4. パフォーマンス最適化

### 4.1 実装済み最適化

**並列データフェッチ**:
```typescript
const [posts, tags] = await Promise.all([
  getPosts(),
  getTagsWithCount()
])
```

**インデックス活用**:
- `slug`（UNIQUE INDEX）
- `status`, `published_at`（WHERE句で使用）
- `created_at`（ORDER BY句で使用）

**ページネーション**:
- `.range(offset, offset + limit - 1)`でデータを制限
- 総数は`.count('exact')`で取得

**タグフィルタの効率化**:
```typescript
// AND検索: 全てのタグを含む記事のみ
const postCounts = postTagData.reduce((acc, pt) => {
  acc[pt.post_id] = (acc[pt.post_id] || 0) + 1
  return acc
}, {})

const matchingPostIds = Object.entries(postCounts)
  .filter(([_, count]) => count === tagIds.length)  // 全タグを含む
  .map(([postId, _]) => postId)
```

### 4.2 今後の最適化候補

- ⏳ Supabase Edge Functions（重い処理の分離）
- ⏳ Redis キャッシュ（頻繁にアクセスされるデータ）
- ⏳ 全文検索の高速化（PostgreSQL GiSTインデックス）

---

## 5. セキュリティ

### 5.1 実装済み対策

**Row Level Security（RLS）**:
- Supabaseのテーブルレベルでアクセス制御
- 公開データ（`status='published'`）のみ一般ユーザーに公開
- 管理者認証後は全データアクセス可能（将来実装）

**SQLインジェクション対策**:
- Supabase SDKのパラメータ化クエリを使用
- 直接SQLを実行しない

**検索文字列の制限**:
```typescript
const searchTerm = search.slice(0, 20)  // 最大20文字に制限
```

### 5.2 今後のセキュリティ強化

- ⏳ Rate Limiting（過度なリクエストの防止）
- ⏳ CSRF対策（管理画面実装時）
- ⏳ 入力バリデーション（Zod）
- ⏳ サニタイゼーション（DOMPurify）

---

## 6. データ型定義

**詳細は `src/types/database.ts` を参照**

```typescript
// 記事（タグ付き）
interface PostWithTags extends Post {
  tags: Tag[]
}

// プロジェクト（タグ付き）
interface ProjectWithTags extends Project {
  tags: Tag[]
}

// 進行中（プロジェクト情報付き）
interface InProgressWithProject extends InProgress {
  completedProject?: Project
}

// タグ（使用回数付き）
interface TagWithCount extends Tag {
  postCount: number
  projectCount: number
}
```

---

## 7. 使用例（実際のページ実装）

### 7.1 記事一覧ページ

```typescript
// src/app/(public)/posts/page.tsx
import { getPosts, getTagsWithCount } from '@/lib/actions/posts'
import { getTags } from '@/lib/actions/tags'

export default async function PostsPage({
  searchParams
}: {
  searchParams: { page?: string; tags?: string; search?: string }
}) {
  const page = Number(searchParams.page) || 1
  const tags = searchParams.tags?.split(',') || []
  const search = searchParams.search || ''

  const [result, allTags] = await Promise.all([
    getPosts({ page, tags, search, limit: 10 }),
    getTagsWithCount()
  ])

  return (
    <div>
      <PostsFilter tags={allTags} />
      <PostsList posts={result.posts} />
      <Pagination {...result.pagination} />
    </div>
  )
}
```

### 7.2 プロジェクト一覧ページ

```typescript
// src/app/(public)/works/page.tsx
import { getProjects } from '@/lib/actions/projects'

export default async function WorksPage() {
  const projects = await getProjects({ status: 'completed' })

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

---

## 8. 今後の実装予定

### 8.1 CRUD操作（管理画面）

**記事の作成**:
```typescript
// src/lib/actions/posts.ts (追加予定)
export async function createPost(data: PostInput): Promise<Post>
export async function updatePost(id: string, data: PostInput): Promise<Post>
export async function deletePost(id: string): Promise<void>
```

**画像アップロード**:
```typescript
export async function uploadImage(file: File): Promise<string>  // URL返却
```

### 8.2 認証

**Supabase Auth統合**:
```typescript
export async function signIn(): Promise<User>
export async function signOut(): Promise<void>
export async function getSession(): Promise<Session | null>
```

### 8.3 バックアップ・エクスポート

```typescript
export async function exportAllData(): Promise<Blob>
export async function importData(file: File): Promise<{ imported: number; skipped: number }>
```

---

## 9. 関連ドキュメント

- [データスキーマ](./data-schema.md) - テーブル定義・型定義
- [実装状況](../lv3/implementation-status.md) - 実装済み機能一覧
- [コンポーネント仕様](../lv3/component-spec.md) - UIコンポーネント
- [型定義ファイル](../../src/types/database.ts) - TypeScript型定義

---

**最終更新**: 2026-02-10
**メンテナ**: Claude Sonnet 4.5

※ 注: いくつかの Server Actions（Posts, Projects, InProgress）の CUD 操作は Lv4 実装により追加・改善されています。実装済みの関数は `docs/lv4/implementation-status.md` を参照してください。
