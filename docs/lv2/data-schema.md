# docs/data-schema.md

## 1. データベース概要

- **DBMS**: PostgreSQL 15+ (Supabase)
- **アクセス制御**: Row Level Security (RLS)
- **インスタンス**: dev / prod 2環境
- **設計方針**: 第3正規形、UUID v4主キー、論理削除なし（バックアップで対応）

---

## 2. ER図

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    posts     │         │   projects   │         │ in_progress  │
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ title        │         │ title        │         │ title        │
│ slug (UQ)    │         │ slug (UQ)    │         │ status       │
│ content      │         │ description  │         │ progress_rate│
│ status       │         │ content      │         │ completed_   │
│ published_at │         │ demo_url     │         │  project_id  │──► projects
└──────┬───────┘         │ github_url   │         └──────────────┘
       │                 └──────┬───────┘
       │ M:N                    │ M:N
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│  post_tags   │         │project_tags  │
│ post_id (FK) │         │ project_id   │
│ tag_id (FK)  │         │ tag_id (FK)  │
└──────┬───────┘         └──────┬───────┘
       │                        │
       └───────────┬────────────┘
                   ▼
          ┌──────────────┐
          │     tags     │
          │ id (PK)      │
          │ name (UQ)    │
          │ slug (UQ)    │
          │ color        │
          └──────────────┘

┌──────────────┐         ┌──────────────────┐
│  post_links  │         │post_project_links│
│ from_post_id │         │ post_id (FK)     │
│ to_post_id   │         │ project_id (FK)  │
└──────────────┘         └──────────────────┘

┌──────────────┐         ┌──────────────┐
│    pages     │         │ qiita_cache  │
│ page_type    │         │ qiita_id     │
│ content      │         │ title, url   │
└──────────────┘         │ likes_count  │
                         └──────────────┘
```

---

## 3. テーブル定義

### 3.1 posts（記事）

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PK | 記事ID |
| title | VARCHAR(200) | NOT NULL | タイトル |
| slug | VARCHAR(200) | UNIQUE | URLスラッグ |
| content | JSONB | NOT NULL | Tiptap JSON |
| excerpt | TEXT | NULL | 抜粋（最大300文字） |
| status | VARCHAR(20) | DEFAULT 'draft' | draft/scheduled/published |
| published_at | TIMESTAMPTZ | NULL | 公開日時 |
| cover_image | TEXT | NULL | カバー画像URL |
| ogp_image | TEXT | NULL | OGP画像URL |
| view_count | INTEGER | DEFAULT 0 | 閲覧数 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス**: slug, status, published_at DESC, created_at DESC
**全文検索**: `to_tsvector('japanese', title || ' ' || excerpt)`

### 3.2 projects（作ったもの）

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PK | プロジェクトID |
| title | VARCHAR(200) | NOT NULL | プロジェクト名 |
| slug | VARCHAR(200) | UNIQUE | URLスラッグ |
| description | TEXT | NOT NULL | 概要 |
| content | JSONB | NULL | 詳細（Tiptap） |
| demo_url | TEXT | NULL | デモURL |
| github_url | TEXT | NULL | GitHubリポジトリURL |
| cover_image | TEXT | NULL | カバー画像URL |
| start_date | DATE | NULL | 開始日 |
| end_date | DATE | NULL | 完了日 |
| status | VARCHAR(20) | DEFAULT 'completed' | completed/archived |
| steps_count | INTEGER | NULL | 開発規模（ステップ数） |
| used_ai | JSONB | NULL | 使用した生成AI（配列） |
| gallery_images | TEXT[] | NULL | ギャラリー画像URL配列 |
| tech_stack | JSONB | NULL | 技術スタック・言語使用率 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

### 3.3 in_progress（進行中）

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PK | 進行中ID |
| title | VARCHAR(200) | NOT NULL | タイトル |
| description | TEXT | NOT NULL | 説明 |
| status | VARCHAR(20) | DEFAULT 'not_started' | not_started/paused/in_progress/completed |
| progress_rate | INTEGER | 0-100 | 進捗率 |
| started_at | DATE | NULL | 開始日 |
| completed_at | DATE | NULL | 完了日 |
| completed_project_id | UUID | FK → projects | 完了後プロジェクトID |
| notes | TEXT | NULL | メモ |

### 3.4 tags（タグ）

| カラム | 型 | 制約 | 説明 |
|--------|---|------|------|
| id | UUID | PK | タグID |
| name | VARCHAR(50) | UNIQUE | タグ名 |
| slug | VARCHAR(50) | UNIQUE | URLスラッグ |
| description | TEXT | NULL | 説明 |
| color | VARCHAR(7) | DEFAULT '#6B7280' | カラーコード |

### 3.5 中間テーブル

**post_tags**: post_id, tag_id (複合PK)
**project_tags**: project_id, tag_id (複合PK)
**post_links**: from_post_id, to_post_id, link_type (複合PK)
**post_project_links**: post_id, project_id (複合PK)

### 3.6 pages（固定ページ）

| カラム | 型 | 説明 |
|--------|---|------|
| page_type | VARCHAR(50) | UNIQUE: home/about/links |
| title | VARCHAR(200) | ページタイトル |
| content | JSONB | Tiptap JSON |
| metadata | JSONB | OGP等 |

### 3.7 qiita_cache（Qiitaキャッシュ）

| カラム | 型 | 説明 |
|--------|---|------|
| qiita_id | VARCHAR(50) | UNIQUE: Qiita記事ID |
| title | VARCHAR(200) | 記事タイトル |
| url | TEXT | 記事URL |
| likes_count | INTEGER | いいね数 |
| published_at | TIMESTAMPTZ | 公開日時 |

---

## 4. TypeScript型定義

**実装ファイル**: `src/types/database.ts`

### 4.1 基本型定義

```typescript
import type { JSONContent } from '@tiptap/core'

// 記事
export interface Post {
  id: string
  title: string
  slug: string
  content: JSONContent                // Tiptap JSONコンテンツ
  excerpt: string | null
  status: 'draft' | 'scheduled' | 'published'
  published_at: string | null          // ISO 8601形式
  cover_image: string | null           // 画像URL
  ogp_image: string | null             // OGP画像URL
  view_count: number
  created_at: string                   // ISO 8601形式
  updated_at: string                   // ISO 8601形式
}

export interface PostWithTags extends Post {
  tags: Tag[]
}

export interface PostWithRelations extends Post {
  tags: Tag[]
  relatedPosts: Post[]
  relatedProjects: Project[]
}

// プロジェクト
export interface Project {
  id: string
  title: string
  slug: string
  description: string
  content: JSONContent | null          // Tiptap JSONコンテンツ
  demo_url: string | null
  github_url: string | null
  cover_image: string | null
  start_date: string | null            // ISO 8601形式
  end_date: string | null              // ISO 8601形式
  status: 'completed' | 'archived'
  steps_count: number | null           // 開発規模（ステップ数）
  used_ai: string[] | null             // 使用した生成AI（例: ["Claude Sonnet 4.5"]）
  gallery_images: string[] | null      // ギャラリー画像URL配列
  tech_stack: Record<string, number> | null  // 技術スタック（言語: 使用率%）
  created_at: string                   // ISO 8601形式
  updated_at: string                   // ISO 8601形式
}

export interface ProjectWithTags extends Project {
  tags: Tag[]
}

// 進行中
export interface InProgress {
  id: string
  title: string
  description: string
  status: 'not_started' | 'paused' | 'in_progress' | 'completed'
  progress_rate: number                 // 0-100
  started_at: string | null             // ISO 8601形式
  completed_at: string | null           // ISO 8601形式
  completed_project_id: string | null   // FK: projects.id
  notes: string | null
  created_at: string                    // ISO 8601形式
  updated_at: string                    // ISO 8601形式
}

export interface InProgressWithProject extends InProgress {
  completedProject?: Project            // 完了後のプロジェクト情報
}

// タグ
export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  color: string                         // HEXカラーコード（例: '#6B7280'）
  created_at: string                    // ISO 8601形式
}

export interface TagWithCount extends Tag {
  postCount: number                     // 記事での使用回数
  projectCount: number                  // プロジェクトでの使用回数
}

// 固定ページ
export interface Page {
  page_type: 'home' | 'about' | 'links'
  title: string
  content: JSONContent                  // Tiptap JSONコンテンツ
  metadata: Record<string, any>         // 任意のメタデータ（JSON）
  created_at: string                    // ISO 8601形式
  updated_at: string                    // ISO 8601形式
}
```

### 4.2 Database型定義（Supabase用）

```typescript
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      in_progress: {
        Row: InProgress
        Insert: Omit<InProgress, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InProgress, 'id' | 'created_at'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'>
        Update: Partial<Omit<Tag, 'id' | 'created_at'>>
      }
      pages: {
        Row: Page
        Insert: Omit<Page, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Page, 'created_at'>>
      }
      post_tags: {
        Row: { post_id: string; tag_id: string }
        Insert: { post_id: string; tag_id: string }
        Update: never
      }
      project_tags: {
        Row: { project_id: string; tag_id: string }
        Insert: { project_id: string; tag_id: string }
        Update: never
      }
      post_links: {
        Row: { from_post_id: string; to_post_id: string; link_type: string }
        Insert: { from_post_id: string; to_post_id: string; link_type?: string }
        Update: never
      }
      post_project_links: {
        Row: { post_id: string; project_id: string }
        Insert: { post_id: string; project_id: string }
        Update: never
      }
    }
  }
}
```

### 4.3 型の使用例

**Server Actions**:
```typescript
// 記事取得（タグ付き）
async function getPosts(): Promise<PostWithTags[]> {
  const { data } = await supabase
    .from('posts')
    .select(`*, tags:post_tags(tag:tags(*))`)

  return data as PostWithTags[]
}

// プロジェクト取得（タグ付き）
async function getProjects(): Promise<ProjectWithTags[]> {
  const { data } = await supabase
    .from('projects')
    .select(`*, tags:project_tags(tag:tags(*))`)

  return data as ProjectWithTags[]
}

// 進行中取得（プロジェクト情報付き）
async function getInProgress(): Promise<InProgressWithProject[]> {
  const { data } = await supabase
    .from('in_progress')
    .select(`*, completedProject:completed_project_id(*)`)

  return data as InProgressWithProject[]
}
```

**コンポーネント**:
```typescript
// 記事カード
interface PostCardProps {
  post: PostWithTags
}

function PostCard({ post }: PostCardProps) {
  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <div>
        {post.tags.map(tag => (
          <span key={tag.id} style={{ color: tag.color }}>
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  )
}
```

---

## 5. RLSポリシー

```sql
-- 管理者は全アクセス可能
CREATE POLICY "管理者全権限" ON posts FOR ALL
USING (auth.uid() = '管理者UUID');

-- 一般ユーザーは公開記事のみ閲覧
CREATE POLICY "一般ユーザー閲覧" ON posts FOR SELECT
USING (
  status = 'published' OR
  (status = 'scheduled' AND published_at <= NOW())
);
```

同様のポリシーを projects, in_progress, tags, pages, qiita_cache に適用。

---

## 6. 運用

**バックアップ**: Supabase自動（毎日、30日保持）+ 手動エクスポート（週1回推奨）
**マイグレーション**: `supabase migration new` → `supabase db push`
**型生成**: `supabase gen types typescript --project-id <ID> > src/types/database.ts`
