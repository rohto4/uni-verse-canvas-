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

```typescript
// 記事
export interface Post {
  id: string
  title: string
  slug: string
  content: JSONContent
  excerpt: string | null
  status: 'draft' | 'scheduled' | 'published'
  published_at: string | null
  cover_image: string | null
  ogp_image: string | null
  view_count: number
  created_at: string
  updated_at: string
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
  content: JSONContent | null
  demo_url: string | null
  github_url: string | null
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  status: 'completed' | 'archived'
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
  progress_rate: number
  started_at: string | null
  completed_at: string | null
  completed_project_id: string | null
  notes: string | null
}

export interface InProgressWithProject extends InProgress {
  completedProject?: Project
}

// タグ
export interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
}

export interface TagWithCount extends Tag {
  postCount: number
  projectCount: number
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
