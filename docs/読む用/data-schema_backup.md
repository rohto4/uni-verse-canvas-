# docs/data-schema.md

## Document Metadata
- **Version**: 1.0.0
- **Last Updated**: 2026-02-04
- **Status**: Confirmed (確定版)
- **Owner**: Senior Fullstack Engineer (DDD Specialist)
- **Project Name**: UniVerse Canvas

---

## 1. データベース概要

### 1.1 使用技術
- **DBMS**: PostgreSQL 15+
- **ホスティング**: Supabase
- **アクセス制御**: Row Level Security (RLS)
- **インスタンス**: 開発用 / 本番用の2環境

### 1.2 設計方針
- **正規化**: 第3正規形まで適用
- **リレーション**: 中間テーブルによる多対多関係
- **UUID**: 全テーブルで主キーにUUID v4使用
- **タイムスタンプ**: `created_at`, `updated_at` を全テーブルに配置
- **論理削除**: 基本的に物理削除（バックアップで対応）

---

## 2. ER図

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    posts     │         │   projects   │         │ in_progress  │
│              │         │              │         │              │
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ title        │         │ title        │         │ title        │
│ slug (UQ)    │         │ slug (UQ)    │         │ description  │
│ content      │         │ description  │         │ status       │
│ excerpt      │         │ content      │         │ progress     │
│ status       │         │ demo_url     │         │ started_at   │
│ published_at │         │ github_url   │         │ completed_at │
│ cover_image  │         │ cover_image  │         │ completed_   │
│ ogp_image    │         │ ogp_image    │         │  project_id  │───┐
│ created_at   │         │ created_at   │         │ created_at   │   │
│ updated_at   │         │ updated_at   │         │ updated_at   │   │
└───────┬──────┘         └───────┬──────┘         └──────────────┘   │
        │                        │                                     │
        │                        │                                     │
        │ Many                   │ Many                                │
        │                        │                                     │
        ▼                        ▼                                     │
┌──────────────┐         ┌──────────────┐                             │
│  post_tags   │         │project_tags  │                             │
│              │         │              │                             │
│ post_id (FK) │         │ project_id   │                             │
│ tag_id (FK)  │         │  (FK)        │                             │
│ created_at   │         │ tag_id (FK)  │                             │
└───────┬──────┘         │ created_at   │                             │
        │                └───────┬──────┘                             │
        │ Many                   │ Many                                │
        │                        │                                     │
        ▼                        ▼                                     │
┌──────────────────────────────────────┐                              │
│              tags                    │                              │
│                                      │                              │
│ id (PK)                              │                              │
│ name                                 │                              │
│ slug (UQ)                            │                              │
│ description                          │                              │
│ color                                │                              │
│ created_at                           │                              │
│ updated_at                           │                              │
└──────────────────────────────────────┘                              │
                                                                       │
┌──────────────┐                                                      │
│  post_links  │                                                      │
│              │                                                      │
│ from_post_id │◄─────────────────────┐                              │
│  (FK)        │                      │                              │
│ to_post_id   │──────────┐           │                              │
│  (FK)        │          │           │                              │
│ link_type    │          │           │                              │
│ created_at   │          │           │                              │
└──────────────┘          │           │                              │
                          │           │                              │
                          ▼           ▼                              │
                     ┌─────────────────┐                             │
                     │  posts (再帰)   │                             │
                     └─────────────────┘                             │
                                                                       │
┌──────────────────┐                                                  │
│post_project_links│                                                  │
│                  │                                                  │
│ post_id (FK)     │──► posts                                        │
│ project_id (FK)  │──► projects ◄───────────────────────────────────┘
│ created_at       │
└──────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    pages     │         │ qiita_cache  │         │  comments*   │
│              │         │              │         │              │
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ page_type    │         │ qiita_id     │         │ post_id (FK) │
│  (UQ)        │         │ title        │         │ author_name  │
│ title        │         │ url          │         │ author_email │
│ content      │         │ likes_count  │         │ content      │
│ metadata     │         │ published_at │         │ status       │
│ created_at   │         │ created_at   │         │ created_at   │
│ updated_at   │         │ updated_at   │         │ updated_at   │
└──────────────┘         └──────────────┘         └──────────────┘

* 将来実装
```

---

## 3. テーブル定義

### 3.1 posts（記事）

**用途**: ブログ記事・技術記事の管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | 記事ID |
| `title` | VARCHAR(200) | NOT NULL | タイトル |
| `slug` | VARCHAR(200) | NOT NULL, UNIQUE | URLスラッグ |
| `content` | JSONB | NOT NULL | Tiptap JSON形式の本文 |
| `excerpt` | TEXT | NULL | 抜粋（OGP用、最大300文字） |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'draft' | ステータス（draft / scheduled / published） |
| `published_at` | TIMESTAMPTZ | NULL | 公開日時（時限投稿用） |
| `cover_image` | TEXT | NULL | カバー画像URL（Supabase Storage） |
| `ogp_image` | TEXT | NULL | OGP画像URL（カスタム or 動的生成） |
| `view_count` | INTEGER | DEFAULT 0 | 閲覧数（将来実装） |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス**:
```sql
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**全文検索インデックス**:
```sql
CREATE INDEX idx_posts_search ON posts USING GIN(
  to_tsvector('japanese', title || ' ' || excerpt)
);
```

**RLSポリシー**:
```sql
-- 管理者は全アクセス可能
CREATE POLICY "管理者全権限"
ON posts FOR ALL
USING (auth.uid() = '管理者UUID');

-- 一般ユーザーは公開記事のみ閲覧
CREATE POLICY "一般ユーザー閲覧"
ON posts FOR SELECT
USING (
  status = 'published' OR 
  (status = 'scheduled' AND published_at <= NOW())
);
```

---

### 3.2 projects（作ったもの）

**用途**: 完成したプロジェクト・実績の管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | プロジェクトID |
| `title` | VARCHAR(200) | NOT NULL | プロジェクト名 |
| `slug` | VARCHAR(200) | NOT NULL, UNIQUE | URLスラッグ |
| `description` | TEXT | NOT NULL | 概要（カード表示用） |
| `content` | JSONB | NULL | 詳細説明（Tiptap形式） |
| `demo_url` | TEXT | NULL | デモURL |
| `github_url` | TEXT | NULL | GitHubリポジトリURL |
| `cover_image` | TEXT | NULL | カバー画像URL |
| `ogp_image` | TEXT | NULL | OGP画像URL |
| `start_date` | DATE | NULL | 開始日 |
| `end_date` | DATE | NULL | 完了日 |
| `status` | VARCHAR(20) | DEFAULT 'completed' | ステータス（completed / archived） |
| `view_count` | INTEGER | DEFAULT 0 | 閲覧数（将来実装） |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス**:
```sql
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_end_date ON projects(end_date DESC);
```

---

### 3.3 in_progress（進行中のこと）

**用途**: 現在進行中のプロジェクト・活動の管理

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | 進行中ID |
| `title` | VARCHAR(200) | NOT NULL | タイトル |
| `description` | TEXT | NOT NULL | 説明 |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'not_started' | ステータス（not_started / paused / in_progress / completed） |
| `progress_rate` | INTEGER | DEFAULT 0, CHECK (progress_rate >= 0 AND progress_rate <= 100) | 進捗率（0〜100%） |
| `started_at` | DATE | NULL | 開始日 |
| `completed_at` | DATE | NULL | 完了日 |
| `completed_project_id` | UUID | NULL, FK → projects(id) | 完了後のプロジェクトID |
| `notes` | TEXT | NULL | メモ・活動ログ |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス**:
```sql
CREATE INDEX idx_in_progress_status ON in_progress(status);
CREATE INDEX idx_in_progress_updated_at ON in_progress(updated_at DESC);
```

**外部キー**:
```sql
ALTER TABLE in_progress
ADD CONSTRAINT fk_completed_project
FOREIGN KEY (completed_project_id)
REFERENCES projects(id)
ON DELETE SET NULL;
```

---

### 3.4 tags（タグ）

**用途**: 記事・プロジェクトの分類タグ

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | タグID |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | タグ名 |
| `slug` | VARCHAR(50) | NOT NULL, UNIQUE | URLスラッグ |
| `description` | TEXT | NULL | 説明 |
| `color` | VARCHAR(7) | DEFAULT '#6B7280' | カラーコード（例: #3B82F6） |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス**:
```sql
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);
```

---

### 3.5 post_tags（記事タグ中間テーブル）

**用途**: 記事とタグの多対多リレーション

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `post_id` | UUID | FK → posts(id) | 記事ID |
| `tag_id` | UUID | FK → tags(id) | タグID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

**主キー**:
```sql
ALTER TABLE post_tags
ADD PRIMARY KEY (post_id, tag_id);
```

**外部キー**:
```sql
ALTER TABLE post_tags
ADD CONSTRAINT fk_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

ALTER TABLE post_tags
ADD CONSTRAINT fk_tag
FOREIGN KEY (tag_id)
REFERENCES tags(id)
ON DELETE CASCADE;
```

**インデックス**:
```sql
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);
```

---

### 3.6 project_tags（プロジェクトタグ中間テーブル）

**用途**: プロジェクトとタグの多対多リレーション

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `project_id` | UUID | FK → projects(id) | プロジェクトID |
| `tag_id` | UUID | FK → tags(id) | タグID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

**主キー**:
```sql
ALTER TABLE project_tags
ADD PRIMARY KEY (project_id, tag_id);
```

**外部キー**:
```sql
ALTER TABLE project_tags
ADD CONSTRAINT fk_project
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;

ALTER TABLE project_tags
ADD CONSTRAINT fk_tag
FOREIGN KEY (tag_id)
REFERENCES tags(id)
ON DELETE CASCADE;
```

---

### 3.7 post_links（記事関連リンク中間テーブル）

**用途**: 記事間の関連リンク（双方向・片方向）

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `from_post_id` | UUID | FK → posts(id) | 元記事ID |
| `to_post_id` | UUID | FK → posts(id) | 関連記事ID |
| `link_type` | VARCHAR(20) | DEFAULT 'related' | リンクタイプ（related / series / reference） |
| `order_index` | INTEGER | DEFAULT 0 | 表示順序 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

**主キー**:
```sql
ALTER TABLE post_links
ADD PRIMARY KEY (from_post_id, to_post_id);
```

**外部キー**:
```sql
ALTER TABLE post_links
ADD CONSTRAINT fk_from_post
FOREIGN KEY (from_post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

ALTER TABLE post_links
ADD CONSTRAINT fk_to_post
FOREIGN KEY (to_post_id)
REFERENCES posts(id)
ON DELETE CASCADE;
```

**制約（自己参照防止）**:
```sql
ALTER TABLE post_links
ADD CONSTRAINT chk_no_self_link
CHECK (from_post_id != to_post_id);
```

---

### 3.8 post_project_links（記事プロジェクトリンク中間テーブル）

**用途**: 記事とプロジェクトの関連付け

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `post_id` | UUID | FK → posts(id) | 記事ID |
| `project_id` | UUID | FK → projects(id) | プロジェクトID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

**主キー**:
```sql
ALTER TABLE post_project_links
ADD PRIMARY KEY (post_id, project_id);
```

**外部キー**:
```sql
ALTER TABLE post_project_links
ADD CONSTRAINT fk_post
FOREIGN KEY (post_id)
REFERENCES posts(id)
ON DELETE CASCADE;

ALTER TABLE post_project_links
ADD CONSTRAINT fk_project
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;
```

---

### 3.9 pages（固定ページ）

**用途**: ホーム・自己紹介・関連リンクなどの固定ページ

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | ページID |
| `page_type` | VARCHAR(50) | NOT NULL, UNIQUE | ページタイプ（home / about / links） |
| `title` | VARCHAR(200) | NOT NULL | ページタイトル |
| `content` | JSONB | NOT NULL | Tiptap JSON形式の内容 |
| `metadata` | JSONB | NULL | その他メタデータ（OGP等） |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**インデックス**:
```sql
CREATE INDEX idx_pages_page_type ON pages(page_type);
```

---

### 3.10 qiita_cache（Qiita記事キャッシュ）

**用途**: Qiita APIから取得した記事情報のキャッシュ

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | キャッシュID |
| `qiita_id` | VARCHAR(50) | NOT NULL, UNIQUE | Qiita記事ID |
| `title` | VARCHAR(200) | NOT NULL | 記事タイトル |
| `url` | TEXT | NOT NULL | 記事URL |
| `likes_count` | INTEGER | DEFAULT 0 | いいね数 |
| `published_at` | TIMESTAMPTZ | NOT NULL | Qiita公開日時 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | キャッシュ作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | キャッシュ更新日時 |

**インデックス**:
```sql
CREATE INDEX idx_qiita_cache_published_at ON qiita_cache(published_at DESC);
```

---

### 3.11 comments（コメント）※将来実装

**用途**: 記事へのコメント機能

| カラム名 | 型 | 制約 | 説明 |
|---------|---|------|------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | コメントID |
| `post_id` | UUID | FK → posts(id) | 記事ID |
| `author_name` | VARCHAR(100) | NOT NULL | コメント者名 |
| `author_email` | VARCHAR(255) | NOT NULL | メールアドレス |
| `content` | TEXT | NOT NULL | コメント内容 |
| `status` | VARCHAR(20) | DEFAULT 'pending' | ステータス（pending / approved / spam） |
| `ip_address` | INET | NULL | 投稿元IPアドレス |
| `user_agent` | TEXT | NULL | User-Agent |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 投稿日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

---

## 4. TypeScript型定義

### 4.1 Database型（Supabase自動生成）

```typescript
// src/types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: Json
          excerpt: string | null
          status: 'draft' | 'scheduled' | 'published'
          published_at: string | null
          cover_image: string | null
          ogp_image: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: Json
          excerpt?: string | null
          status?: 'draft' | 'scheduled' | 'published'
          published_at?: string | null
          cover_image?: string | null
          ogp_image?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: Json
          excerpt?: string | null
          status?: 'draft' | 'scheduled' | 'published'
          published_at?: string | null
          cover_image?: string | null
          ogp_image?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          content: Json | null
          demo_url: string | null
          github_url: string | null
          cover_image: string | null
          ogp_image: string | null
          start_date: string | null
          end_date: string | null
          status: 'completed' | 'archived'
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          content?: Json | null
          demo_url?: string | null
          github_url?: string | null
          cover_image?: string | null
          ogp_image?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'completed' | 'archived'
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          content?: Json | null
          demo_url?: string | null
          github_url?: string | null
          cover_image?: string | null
          ogp_image?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: 'completed' | 'archived'
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      in_progress: {
        Row: {
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
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
          progress_rate?: number
          started_at?: string | null
          completed_at?: string | null
          completed_project_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'not_started' | 'paused' | 'in_progress' | 'completed'
          progress_rate?: number
          started_at?: string | null
          completed_at?: string | null
          completed_project_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      // 他のテーブルも同様に定義...
    }
  }
}
```

### 4.2 アプリケーション型

```typescript
// src/types/post.ts
import { Database } from './database'

export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']

export interface PostWithTags extends Post {
  tags: Tag[]
}

export interface PostWithRelations extends Post {
  tags: Tag[]
  relatedPosts: Post[]
  relatedProjects: Project[]
}

// src/types/project.ts
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface ProjectWithTags extends Project {
  tags: Tag[]
}

// src/types/inProgress.ts
export type InProgress = Database['public']['Tables']['in_progress']['Row']
export type InProgressInsert = Database['public']['Tables']['in_progress']['Insert']
export type InProgressUpdate = Database['public']['Tables']['in_progress']['Update']

export interface InProgressWithProject extends InProgress {
  completedProject?: Project
}

// src/types/tag.ts
export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']

export interface TagWithCount extends Tag {
  postCount: number
  projectCount: number
}
```

---

## 5. SQLマイグレーション例

### 5.1 初期スキーマ作成

```sql
-- supabase/migrations/001_initial_schema.sql

-- UUID拡張有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- タグテーブル
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 記事テーブル
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  content JSONB NOT NULL,
  excerpt TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  cover_image TEXT,
  ogp_image TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_status CHECK (status IN ('draft', 'scheduled', 'published'))
);

-- プロジェクトテーブル
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  content JSONB,
  demo_url TEXT,
  github_url TEXT,
  cover_image TEXT,
  ogp_image TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'completed',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_project_status CHECK (status IN ('completed', 'archived'))
);

-- 進行中テーブル
CREATE TABLE in_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started',
  progress_rate INTEGER DEFAULT 0 CHECK (progress_rate >= 0 AND progress_rate <= 100),
  started_at DATE,
  completed_at DATE,
  completed_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_progress_status CHECK (status IN ('not_started', 'paused', 'in_progress', 'completed'))
);

-- 記事タグ中間テーブル
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- プロジェクトタグ中間テーブル
CREATE TABLE project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, tag_id)
);

-- 記事関連リンク中間テーブル
CREATE TABLE post_links (
  from_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  to_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  link_type VARCHAR(20) DEFAULT 'related',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (from_post_id, to_post_id),
  CONSTRAINT chk_no_self_link CHECK (from_post_id != to_post_id)
);

-- 記事プロジェクトリンク中間テーブル
CREATE TABLE post_project_links (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, project_id)
);

-- 固定ページテーブル
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Qiitaキャッシュテーブル
CREATE TABLE qiita_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qiita_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_end_date ON projects(end_date DESC);

CREATE INDEX idx_in_progress_status ON in_progress(status);
CREATE INDEX idx_in_progress_updated_at ON in_progress(updated_at DESC);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);

CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

CREATE INDEX idx_pages_page_type ON pages(page_type);
CREATE INDEX idx_qiita_cache_published_at ON qiita_cache(published_at DESC);

-- 全文検索インデックス
CREATE INDEX idx_posts_search ON posts USING GIN(
  to_tsvector('japanese', title || ' ' || COALESCE(excerpt, ''))
);
```

### 5.2 Trigger作成（自動更新日時）

```sql
-- supabase/migrations/002_add_triggers.sql

-- 更新日時自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにTrigger設定
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_in_progress_updated_at
BEFORE UPDATE ON in_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON pages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_qiita_cache_updated_at
BEFORE UPDATE ON qiita_cache
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

### 5.3 RLSポリシー設定

```sql
-- supabase/migrations/003_add_rls.sql

-- RLS有効化
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE qiita_cache ENABLE ROW LEVEL SECURITY;

-- 管理者UUID（環境変数から設定）
-- CREATE POLICY使用時に '管理者UUID' を実際のUUIDに置換

-- postsのポリシー
CREATE POLICY "管理者全権限_posts"
ON posts FOR ALL
USING (auth.uid() = '管理者UUID');

CREATE POLICY "一般ユーザー閲覧_posts"
ON posts FOR SELECT
USING (
  status = 'published' OR 
  (status = 'scheduled' AND published_at <= NOW())
);

-- projectsのポリシー
CREATE POLICY "管理者全権限_projects"
ON projects FOR ALL
USING (auth.uid() = '管理者UUID');

CREATE POLICY "一般ユーザー閲覧_projects"
ON projects FOR SELECT
USING (status = 'completed');

-- in_progressのポリシー
CREATE POLICY "管理者全権限_in_progress"
ON in_progress FOR ALL
USING (auth.uid() = '管理者UUID');

CREATE POLICY "一般ユーザー閲覧_in_progress"
ON in_progress FOR SELECT
USING (true);

-- tagsのポリシー（全員閲覧可能、管理者のみ編集）
CREATE POLICY "管理者全権限_tags"
ON tags FOR ALL
USING (auth.uid() = '管理者UUID');

CREATE POLICY "一般ユーザー閲覧_tags"
ON tags FOR SELECT
USING (true);

-- pagesのポリシー
CREATE POLICY "管理者全権限_pages"
ON pages FOR ALL
USING (auth.uid() = '管理者UUID');

CREATE POLICY "一般ユーザー閲覧_pages"
ON pages FOR SELECT
USING (true);

-- qiita_cacheのポリシー
CREATE POLICY "管理者全権限_qiita_cache"
ON qiita_cache FOR ALL
USING (auth.uid() = '管理者UUID');

CREATE POLICY "一般ユーザー閲覧_qiita_cache"
ON qiita_cache FOR SELECT
USING (true);
```

---

## 6. Seed データ

```sql
-- supabase/seed.sql

-- タグのサンプルデータ
INSERT INTO tags (name, slug, description, color) VALUES
('Tech', 'tech', '技術系記事', '#3B82F6'),
('Diary', 'diary', '日記・雑記', '#F59E0B'),
('Next.js', 'nextjs', 'Next.js関連', '#000000'),
('TypeScript', 'typescript', 'TypeScript関連', '#3178C6'),
('Design', 'design', 'デザイン関連', '#EC4899');

-- 固定ページのサンプルデータ
INSERT INTO pages (page_type, title, content, metadata) VALUES
('home', 'ホーム', '{"type":"doc","content":[]}', '{"ogp_image":""}'),
('about', '自己紹介', '{"type":"doc","content":[]}', '{"ogp_image":""}'),
('links', '関連リンク', '{"type":"doc","content":[]}', '{"ogp_image":""}');
```

---

## 7. データベース運用

### 7.1 バックアップ戦略

| 項目 | 方式 |
|-----|------|
| **自動バックアップ** | Supabase標準機能（毎日） |
| **保持期間** | 30日間 |
| **手動エクスポート** | 週1回推奨（管理画面から） |
| **復元テスト** | 月1回推奨（開発環境で） |

### 7.2 マイグレーション管理

```bash
# 新規マイグレーション作成
supabase migration new migration_name

# マイグレーション適用（開発環境）
supabase db push

# マイグレーション適用（本番環境）
# Supabase Dashboard経由で手動実行
```

### 7.3 型生成

```bash
# Supabaseから型定義を自動生成
supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts
```

---

## 8. パフォーマンス最適化

### 8.1 インデックス戦略

- **頻繁に検索されるカラム**: slug, status, published_at
- **ソート対象カラム**: created_at, updated_at, published_at
- **外部キー**: 自動的にインデックス作成
- **全文検索**: GINインデックス使用

### 8.2 クエリ最適化

```sql
-- 悪い例（N+1問題）
SELECT * FROM posts;
-- 別途タグを取得（N回のクエリ）

-- 良い例（JOIN使用）
SELECT 
  p.*,
  array_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) as tags
FROM posts p
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.status = 'published'
GROUP BY p.id
ORDER BY p.published_at DESC;
```

---

## 9. 承認状態

✅ **確定済み** - 本データスキーマで開発を進めます。

**次のステップ**: `docs/ui-spec.md`（UIコンポーネント仕様）の作成

---

## 10. ドキュメント更新履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | 初版作成（DB設計確定版） |
