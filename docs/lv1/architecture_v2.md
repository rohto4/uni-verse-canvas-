# docs/architecture.md

## 1. プロジェクト概要

### 1.1 プロジェクト名
**UniVerse Canvas**
- **意味**: あなた自身の宇宙（UniVerse）を、自由に描く（Canvas）
- **キャッチコピー**: "Your Universe, Your Canvas"

### 1.2 システムの目的
- 管理者（単一アカウント）による高度なコンテンツ管理
- 一般ユーザーへの最適化された閲覧体験
- データ損失リスクゼロのバックアップ体制
- ドキュメント駆動開発による長期保守性（10万〜30万行規模）

### 1.3 システムの特徴
- **非公開管理画面**: Google認証による管理者専用アクセス
- **公開フロントエンド**: 認証不要で全コンテンツ閲覧可能
- **多様なコンテンツタイプ**: 記事・プロジェクト・進行中のこと・固定ページ
- **高機能エディタ**: Tiptap全拡張導入（20種類以上）
- **完全バックアップ**: JSON/Markdown形式でのエクスポート・インポート

---

## 2. システム構成

### 2.1 全体構成図

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Hosting)                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │          Next.js 15.x App Router (TypeScript)           ││
│  │                                                          ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  ││
│  │  │   Public    │  │    Admin    │  │  API Routes    │  ││
│  │  │  (SSG/ISR)  │  │  (Auth壁)   │  │  Qiita/Backup  │  ││
│  │  │ /posts      │  │ /admin/*    │  │  Preview/OGP   │  ││
│  │  │ /works      │  │             │  │                │  ││
│  │  └─────────────┘  └─────────────┘  └────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (BaaS)                           │
│  ┌───────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │   Auth    │  │    Postgres    │  │     Storage       │  │
│  │  (Google) │  │ posts/projects │  │ WebP Images       │  │
│  │           │  │ in_progress    │  │ /posts/images/    │  │
│  └───────────┘  │ tags/pages     │  │ /projects/images/ │  │
│                 │ qiita_cache    │  └───────────────────┘  │
│  2インスタンス   └────────────────┘                          │
│  (dev / prod)                                               │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  External: Qiita API v2 / GA4 / Vercel Analytics            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技術スタック（確定版）

| Category | Technology | Version |
|----------|-----------|---------|
| Frontend | Next.js (App Router) | 15.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 3.x |
| Editor | Tiptap (20+拡張) | 2.x |
| Backend/DB | Supabase (Postgres 15+) | Latest |
| Auth | Supabase Auth (Google OAuth) | - |
| Storage | Supabase Storage (WebP) | - |
| Hosting | Vercel | - |
| Testing | Jest + React Testing Library | Latest |

詳細は `docs/lv1/tech-stack.md` 参照。

---

## 3. ディレクトリ構造

```
universe-canvas/
├── docs/                    # 設計ドキュメント（SSOT）
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (public)/        # 公開ページ: /, /posts, /works, /progress, /about, /links
│   │   ├── (admin)/         # 管理画面: /admin/dashboard, /admin/posts, /admin/backup等
│   │   └── api/             # API Routes: /api/qiita, /api/backup, /api/preview, /api/og
│   ├── components/
│   │   ├── ui/              # shadcn/ui基本コンポーネント
│   │   ├── editor/          # Tiptap: TiptapEditor, MenuBar, extensions/
│   │   ├── layout/          # Header, Footer, Sidebar, MobileMenu
│   │   ├── post/            # PostCard, PostContent, RelatedPosts, TableOfContents
│   │   ├── project/         # ProjectCard, ProjectGallery, ProjectDetail
│   │   ├── progress/        # ProgressTimeline, ProgressCard, StatusBadge
│   │   ├── admin/           # AdminNav, DashboardStats, PostList, BackupPanel
│   │   └── common/          # ThemeToggle, TagFilter, SearchBox, Pagination
│   ├── lib/
│   │   ├── supabase/        # client.ts, server.ts, middleware.ts, types.ts
│   │   ├── utils/           # slug, date, image, backup, markdown, sanitize
│   │   ├── validations/     # Zod: post, project, inProgress, page
│   │   └── api/             # posts, projects, inProgress, tags, qiita
│   ├── types/               # database.ts, post.ts, project.ts, tag.ts, editor.ts
│   ├── hooks/               # useAuth, usePosts, useProjects, useTags, useTheme
│   └── styles/              # globals.css, tiptap.css
├── supabase/                # migrations/, seed.sql, config.toml
├── public/                  # favicon, logo, og-default.png
└── tests/                   # unit/, e2e/
```

---

## 4. 主要機能モジュール

### 4.1 認証・権限管理
- 管理者認証: Supabase Auth + Google OAuth
- 認証チェック: `(admin)` グループでMiddleware適用
- RLS: PostgreSQL Row Level Security（管理者のみ全権限）

### 4.2 コンテンツ管理

**コンテンツタイプ**
| タイプ | テーブル | URL |
|-------|---------|-----|
| 読み物 | posts | /posts |
| 作ったもの | projects | /works |
| 進行中 | in_progress | /progress |
| 固定ページ | pages | /, /about, /links |

**記事ステータス**: draft → scheduled → published
**進行中ステータス**: not_started → paused → in_progress → completed

### 4.3 エディタ（Tiptap）

**導入拡張機能**
| カテゴリ | 拡張 |
|---------|-----|
| 基本 | Starterkit, Placeholder, CharacterCount |
| コード | CodeBlockLowlight（Shiki） |
| 画像 | Image（WebP）, HorizontalImageLayout（カスタム） |
| テーブル | Table |
| 埋め込み | Youtube |
| 数式 | Mathematics（KaTeX） |
| 装飾 | Highlight, Color, TextStyle, Underline, TextAlign |
| その他 | Link, TaskList, Subscript, Superscript, SectionDivider（カスタム） |

**画像処理フロー**
画像選択 → クライアントWebP変換（1920px/80%） → Supabase Storage → エディタ挿入 → Next.js Image最適化表示

### 4.4 関連リンク・タグシステム

```
posts ←→ tags (M:N via post_tags)
projects ←→ tags (M:N via project_tags)
posts ←→ posts (M:N via post_links)
posts ←→ projects (M:N via post_project_links)
in_progress → projects (1:N via completed_project_id)
```

タグフィルタURL: `/posts?tags=tech,nextjs` (AND検索)

### 4.5 バックアップ・エクスポート

**保存時**: 記事保存 → /admin/posts/[id]/saved → JSONダウンロード
**全データ**: /admin/backup → ZIP圧縮 → ダウンロード
**インポート**: JSONアップロード → バリデーション → 重複チェック → DB挿入

---

## 5. セキュリティ設計

| Layer | Implementation |
|-------|----------------|
| 管理画面認証 | Supabase Auth Middleware |
| RLS | PostgreSQL Row Level Security |
| CSRF | Next.js標準保護 |
| XSS | DOMPurify + Tiptapサニタイズ |
| Rate Limiting | API: 100 req/min、画像: 10 files/min |

---

## 6. パフォーマンス戦略

**静的生成（SSG）**: ホーム、固定ページ、記事詳細（公開済み）
**ISR**: トップ/記事一覧（3600s）、固定ページ（86400s）
**画像最適化**: Next.js Image、WebP、Lazy Loading

---

## 7. 開発フェーズ

| Phase | 内容 |
|-------|------|
| 1 | Architecture & Schema設計 |
| 2 | UI/UX設計 |
| 3 | コア機能実装（記事CRUD） |
| 4 | 高度機能実装（Tiptap拡張） |
| 5 | バックアップ・Qiita連携 |
| 6 | テスト・最適化 |
| 7 | デプロイ・公開 |
