# docs/architecture.md

## Document Metadata
- **Version**: 2.0.0
- **Last Updated**: 2026-02-04
- **Status**: Confirmed (確定版)
- **Owner**: Senior Fullstack Engineer (DDD Specialist)
- **Project Name**: UniVerse Canvas

---

## 1. プロジェクト概要

### 1.1 プロジェクト名
**UniVerse Canvas**
- **意味**: あなた自身の宇宙（UniVerse）を、自由に描く（Canvas）
- **コンセプト**: 創造性と活動を自由に表現する、無限の可能性を持つ個人HP
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
┌──────────────────────────────────────────────────────────────────┐
│                        Vercel (Hosting)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │             Next.js 15.x App Router (TypeScript)           │  │
│  │                                                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Public     │  │    Admin     │  │   API Routes    │  │  │
│  │  │   Routes     │  │    Routes    │  │                 │  │  │
│  │  │  (SSG/ISR)   │  │  (Auth壁)    │  │  - Qiita        │  │  │
│  │  │              │  │              │  │  - Backup       │  │  │
│  │  │  - /         │  │  - /admin/   │  │  - Preview      │  │  │
│  │  │  - /posts    │  │    dashboard │  │  - OGP Generate │  │  │
│  │  │  - /works    │  │  - /admin/   │  │  - Comments*    │  │  │
│  │  │  - /progress │  │    editor    │  │                 │  │  │
│  │  │  - /about    │  │  - /admin/   │  └─────────────────┘  │  │
│  │  │  - /links    │  │    backup    │                        │  │
│  │  └──────────────┘  └──────────────┘                        │  │
│  │                                                              │  │
│  └────────────────────┬─────────────────────────────────────────┘  │
│                       │                                            │
└───────────────────────┼────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Supabase (BaaS)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth        │  │  Postgres    │  │  Storage             │  │
│  │  (Google)    │  │  (15+)       │  │  (WebP Images)       │  │
│  │              │  │              │  │                      │  │
│  │  管理者専用  │  │  - posts     │  │  - /posts/images/    │  │
│  └──────────────┘  │  - projects  │  │  - /projects/images/ │  │
│                    │  - in_progress│  │  - /ogp/             │  │
│  ┌──────────────┐  │  - tags      │  │  - /backup/          │  │
│  │  2インスタンス│  │  - pages     │  └──────────────────────┘  │
│  │  - dev       │  │  - qiita     │                            │
│  │  - prod      │  │  - comments* │                            │
│  └──────────────┘  └──────────────┘                            │
└──────────────────────────────────────────────────────────────────┘
                        │
                        ▼ (Manual Trigger)
┌──────────────────────────────────────────────────────────────────┐
│              External APIs                                       │
│  - Qiita API v2 (Read-only, Cached)                            │
│  - Google Analytics 4 (控えめ配置)                               │
│  - Vercel Analytics (パフォーマンス計測)                         │
└──────────────────────────────────────────────────────────────────┘

* 将来実装
```

### 2.2 技術スタック（確定版）

詳細は `docs/tech-stack.md` を参照。

| Category | Technology | Version |
|----------|-----------|---------|
| Frontend Framework | Next.js (App Router) | 15.x |
| Language | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 3.x |
| Rich Text Editor | Tiptap (20+拡張) | 2.x |
| Backend/DB | Supabase (Postgres 15+) | Latest |
| Authentication | Supabase Auth (Google OAuth) | - |
| Storage | Supabase Storage (WebP) | - |
| Hosting | Vercel | - |
| Package Manager | npm | 10.x |
| Testing | Jest + React Testing Library | Latest |
| Linter/Formatter | ESLint + Prettier | Latest |

---

## 3. ディレクトリ構造

```
universe-canvas/
├── docs/                               # 設計ドキュメント（SSOT）
│   ├── architecture.md                 # 本ファイル
│   ├── data-schema.md                  # DB設計・ER図・型定義
│   ├── ui-spec.md                      # UIコンポーネント仕様
│   ├── logic-flow.md                   # ビジネスロジック詳細
│   ├── tech-stack.md                   # 技術スタック確定版
│   ├── requirements.md                 # 要件定義書
│   └── implementation-plan.md          # 実装手順書
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   │
│   │   ├── (public)/                   # 公開ページグループ
│   │   │   ├── layout.tsx              # 公開ページ共通レイアウト
│   │   │   ├── page.tsx                # ホーム
│   │   │   │
│   │   │   ├── posts/                  # 読み物（ブログ・技術記事統合）
│   │   │   │   ├── page.tsx            # 一覧ページ（タグフィルタ対応）
│   │   │   │   └── [slug]/             
│   │   │   │       └── page.tsx        # 記事詳細
│   │   │   │
│   │   │   ├── works/                  # 作ったもの（プロジェクト）
│   │   │   │   ├── page.tsx            # カードギャラリー
│   │   │   │   └── [slug]/             
│   │   │   │       └── page.tsx        # プロジェクト詳細
│   │   │   │
│   │   │   ├── progress/               # 進行中のこと
│   │   │   │   └── page.tsx            # タイムライン・ステータス別
│   │   │   │
│   │   │   ├── about/                  # 自己紹介
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── links/                  # 関連リンク
│   │   │       └── page.tsx            # Qiita・SNS埋め込み
│   │   │
│   │   ├── (admin)/                    # 管理画面グループ（Auth壁）
│   │   │   ├── layout.tsx              # 認証チェック・管理画面レイアウト
│   │   │   │
│   │   │   ├── dashboard/              # ダッシュボード
│   │   │   │   └── page.tsx            # 統計・最近の編集
│   │   │   │
│   │   │   ├── posts/                  # 記事管理
│   │   │   │   ├── page.tsx            # 一覧（検索・フィルタ）
│   │   │   │   ├── new/                
│   │   │   │   │   └── page.tsx        # 新規作成
│   │   │   │   └── [id]/               
│   │   │   │       ├── page.tsx        # 編集
│   │   │   │       └── saved/          
│   │   │   │           └── page.tsx    # 保存完了（エクスポート）
│   │   │   │
│   │   │   ├── projects/               # プロジェクト管理
│   │   │   │   ├── page.tsx            
│   │   │   │   ├── new/                
│   │   │   │   │   └── page.tsx        
│   │   │   │   └── [id]/               
│   │   │   │       └── page.tsx        
│   │   │   │
│   │   │   ├── in-progress/            # 進行中管理
│   │   │   │   ├── page.tsx            
│   │   │   │   ├── new/                
│   │   │   │   │   └── page.tsx        
│   │   │   │   └── [id]/               
│   │   │   │       └── page.tsx        
│   │   │   │
│   │   │   ├── pages/                  # 固定ページ管理
│   │   │   │   ├── page.tsx            # 一覧
│   │   │   │   └── [pageType]/         
│   │   │   │       └── page.tsx        # 編集（about, links等）
│   │   │   │
│   │   │   ├── backup/                 # バックアップ管理
│   │   │   │   └── page.tsx            # エクスポート・インポート
│   │   │   │
│   │   │   ├── tags/                   # タグ管理
│   │   │   │   └── page.tsx            
│   │   │   │
│   │   │   └── settings/               # サイト設定
│   │   │       └── page.tsx            # OGP・Analytics等
│   │   │
│   │   └── api/                        # API Routes
│   │       ├── qiita/                  
│   │       │   └── refresh/            
│   │       │       └── route.ts        # Qiita記事取得・キャッシュ更新
│   │       │
│   │       ├── backup/                 
│   │       │   ├── export/             
│   │       │   │   └── route.ts        # JSON/Markdown生成
│   │       │   └── import/             
│   │       │       └── route.ts        # DB復元
│   │       │
│   │       ├── preview/                
│   │       │   └── route.ts            # プレビュー生成
│   │       │
│   │       ├── og/                     
│   │       │   └── route.tsx           # Vercel OG画像動的生成
│   │       │
│   │       └── comments/               # 将来実装
│   │           ├── route.ts            # コメント投稿
│   │           └── [id]/               
│   │               └── route.ts        # コメント取得
│   │
│   ├── components/                     # Reactコンポーネント
│   │   ├── ui/                         # shadcn/ui基本コンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...                     # その他shadcn/uiコンポーネント
│   │   │
│   │   ├── editor/                     # Tiptapエディタ関連
│   │   │   ├── TiptapEditor.tsx        # メインエディタコンポーネント
│   │   │   ├── MenuBar.tsx             # ツールバー
│   │   │   ├── extensions/             # カスタムノード・拡張
│   │   │   │   ├── ImageUploader.tsx   # WebP変換付き画像アップロード
│   │   │   │   ├── HorizontalLayout.tsx # 横並び画像レイアウト
│   │   │   │   ├── SectionDivider.tsx  # セクション区切り
│   │   │   │   └── index.ts            # 全拡張のエクスポート
│   │   │   └── utils/                  
│   │   │       ├── imageCompression.ts # WebP変換ロジック
│   │   │       └── uploadToSupabase.ts # Storageアップロード
│   │   │
│   │   ├── layout/                     # レイアウトコンポーネント
│   │   │   ├── Header.tsx              # ヘッダー（ナビゲーション）
│   │   │   ├── Footer.tsx              # フッター
│   │   │   ├── Sidebar.tsx             # サイドバー（タグフィルタ等）
│   │   │   └── MobileMenu.tsx          # モバイルハンバーガーメニュー
│   │   │
│   │   ├── post/                       # 記事表示コンポーネント
│   │   │   ├── PostCard.tsx            # 記事カード（一覧用）
│   │   │   ├── PostContent.tsx         # 記事本文レンダリング
│   │   │   ├── PostMeta.tsx            # メタ情報（日付・タグ等）
│   │   │   ├── RelatedPosts.tsx        # 関連記事
│   │   │   └── TableOfContents.tsx     # 目次自動生成
│   │   │
│   │   ├── project/                    # プロジェクト表示コンポーネント
│   │   │   ├── ProjectCard.tsx         # プロジェクトカード
│   │   │   ├── ProjectGallery.tsx      # カードギャラリー
│   │   │   └── ProjectDetail.tsx       # プロジェクト詳細モーダル
│   │   │
│   │   ├── progress/                   # 進行中表示コンポーネント
│   │   │   ├── ProgressTimeline.tsx    # タイムライン
│   │   │   ├── ProgressCard.tsx        # 進行中カード
│   │   │   └── StatusBadge.tsx         # ステータスバッジ
│   │   │
│   │   ├── admin/                      # 管理画面専用コンポーネント
│   │   │   ├── AdminNav.tsx            # 管理画面ナビゲーション
│   │   │   ├── DashboardStats.tsx      # 統計表示
│   │   │   ├── PostList.tsx            # 記事一覧テーブル
│   │   │   ├── BackupPanel.tsx         # バックアップUI
│   │   │   └── PreviewModal.tsx        # プレビューモーダル
│   │   │
│   │   └── common/                     # 共通コンポーネント
│   │       ├── ThemeToggle.tsx         # ダークモード切り替え
│   │       ├── TagFilter.tsx           # タグフィルタ
│   │       ├── SearchBox.tsx           # 検索ボックス
│   │       ├── Pagination.tsx          # ページネーション
│   │       └── LoadingSpinner.tsx      # ローディング
│   │
│   ├── lib/                            # ユーティリティ・ロジック
│   │   ├── supabase/                   # Supabaseクライアント
│   │   │   ├── client.ts               # クライアント側
│   │   │   ├── server.ts               # サーバー側
│   │   │   ├── middleware.ts           # 認証ミドルウェア
│   │   │   └── types.ts                # Supabase自動生成型
│   │   │
│   │   ├── utils/                      # 汎用ユーティリティ
│   │   │   ├── slug.ts                 # スラッグ自動生成
│   │   │   ├── date.ts                 # 時限投稿判定・日時フォーマット
│   │   │   ├── image.ts                # WebP変換
│   │   │   ├── backup.ts               # エクスポート・インポート処理
│   │   │   ├── markdown.ts             # Markdown変換
│   │   │   └── sanitize.ts             # HTMLサニタイズ（DOMPurify）
│   │   │
│   │   ├── validations/                # Zodバリデーション
│   │   │   ├── post.ts                 
│   │   │   ├── project.ts              
│   │   │   ├── inProgress.ts           
│   │   │   └── page.ts                 
│   │   │
│   │   ├── api/                        # API呼び出しロジック
│   │   │   ├── posts.ts                # 記事CRUD
│   │   │   ├── projects.ts             # プロジェクトCRUD
│   │   │   ├── inProgress.ts           # 進行中CRUD
│   │   │   ├── tags.ts                 # タグ管理
│   │   │   └── qiita.ts                # Qiita API連携
│   │   │
│   │   └── constants.ts                # 定数定義
│   │
│   ├── types/                          # TypeScript型定義
│   │   ├── database.ts                 # Supabase自動生成型
│   │   ├── post.ts                     # 記事関連型
│   │   ├── project.ts                  # プロジェクト関連型
│   │   ├── inProgress.ts               # 進行中関連型
│   │   ├── page.ts                     # 固定ページ型
│   │   ├── tag.ts                      # タグ型
│   │   └── editor.ts                   # Tiptap拡張型
│   │
│   ├── hooks/                          # カスタムReact Hooks
│   │   ├── useAuth.ts                  # 認証状態管理
│   │   ├── usePosts.ts                 # 記事データ取得
│   │   ├── useProjects.ts              # プロジェクトデータ取得
│   │   ├── useTags.ts                  # タグデータ取得
│   │   └── useTheme.ts                 # ダークモード管理
│   │
│   ├── styles/                         # グローバルCSS
│   │   ├── globals.css                 # Tailwind初期化
│   │   └── tiptap.css                  # Tiptapカスタムスタイル
│   │
│   └── middleware.ts                   # Next.js Middleware（認証）
│
├── supabase/                           # Supabase設定
│   ├── migrations/                     # SQLマイグレーション
│   │   ├── 001_initial_schema.sql      
│   │   ├── 002_add_projects.sql        
│   │   ├── 003_add_in_progress.sql     
│   │   └── ...                         
│   ├── seed.sql                        # 初期データ
│   └── config.toml                     # ローカル開発設定
│
├── public/                             # 静的ファイル
│   ├── favicon.ico
│   ├── logo.svg                        # UniVerse Canvasロゴ
│   └── og-default.png                  # デフォルトOGP画像
│
├── tests/                              # テストファイル
│   ├── unit/                           # ユニットテスト
│   │   ├── utils/                      
│   │   │   ├── slug.test.ts            
│   │   │   ├── date.test.ts            
│   │   │   └── ...                     
│   │   └── components/                 
│   │       └── ...                     
│   └── e2e/                            # E2Eテスト（将来）
│
├── .env.local                          # 環境変数（gitignore）
├── .env.example                        # 環境変数テンプレート
├── .gitignore                          
├── next.config.js                      # Next.js設定
├── tailwind.config.ts                  # Tailwind設定
├── tsconfig.json                       # TypeScript設定
├── package.json                        # 依存関係
├── jest.config.js                      # Jest設定
├── .eslintrc.json                      # ESLint設定
├── .prettierrc                         # Prettier設定
└── README.md                           # プロジェクトREADME
```

---

## 4. 主要機能モジュール

### 4.1 認証・権限管理

| 項目 | 仕様 |
|-----|------|
| **管理者認証** | Supabase Auth + Google OAuth |
| **認証チェック** | `(admin)` グループ全体でMiddleware適用 |
| **セッション管理** | Cookie-based（Supabaseデフォルト） |
| **一般ユーザー** | 認証不要で全公開ページ閲覧可能 |
| **RLS** | PostgreSQL Row Level Security（管理者のみ全権限） |

### 4.2 コンテンツ管理

#### 4.2.1 コンテンツタイプ

**A. 動的コンテンツ（データベース管理）**

| タイプ | テーブル | 主な用途 |
|-------|---------|---------|
| **読み物** | `posts` | ブログ記事・技術記事 |
| **作ったもの** | `projects` | 完成プロジェクト・実績 |
| **進行中のこと** | `in_progress` | 現在進行中のプロジェクト |

**B. 固定ページ（静的コンテンツ）**

| ページ | URL | 更新頻度 |
|-------|-----|---------|
| **ホーム** | `/` | 高 |
| **自己紹介** | `/about` | 低 |
| **作ったもの** | `/works` | 中 |
| **読み物** | `/posts` | 高 |
| **進行中のこと** | `/progress` | 中 |
| **関連リンク** | `/links` | 低 |

#### 4.2.2 ライフサイクル管理

**記事（posts）のステータス**

| Status | 説明 | 表示条件 |
|--------|------|---------|
| `draft` | 下書き | 管理者のみ |
| `scheduled` | 時限投稿 | `published_at <= NOW()` で公開 |
| `published` | 公開済み | 一般ユーザー閲覧可能 |

**進行中（in_progress）のステータス**

| Status | 説明 | 表示色 |
|--------|------|-------|
| `not_started` | 未着手 | グレー |
| `paused` | 中断中 | イエロー |
| `in_progress` | 進行中 | ブルー |
| `completed` | 完了 | グリーン |

#### 4.2.3 時限投稿ロジック

```typescript
// サーバーサイドでの判定例
const publishedPosts = await supabase
  .from('posts')
  .select('*')
  .eq('status', 'published')
  .or('status.eq.scheduled,published_at.lte.now()')
  .order('published_at', { ascending: false });
```

- **判定基準**: サーバー時刻のみ使用
- **ISR間隔**: 1時間（3600秒）
- **クライアント時刻**: 完全無視

### 4.3 エディタ（Tiptap）

#### 4.3.1 導入拡張機能（20種類以上）

詳細は `docs/tech-stack.md` を参照。

| カテゴリ | 拡張機能 |
|---------|---------|
| **基本** | Starterkit, Placeholder, CharacterCount |
| **コード** | CodeBlockLowlight（Shiki） |
| **画像** | Image（WebP変換）, HorizontalImageLayout（カスタム） |
| **テーブル** | Table |
| **埋め込み** | Youtube |
| **数式** | Mathematics（KaTeX） |
| **リスト** | TaskList |
| **装飾** | Highlight, Color, TextStyle, Underline |
| **配置** | TextAlign, HorizontalRule |
| **その他** | Link, Mention, Subscript, Superscript, SectionDivider（カスタム） |

#### 4.3.2 画像処理フロー

```
ユーザーが画像選択
  ↓
クライアント側でWebP変換（browser-image-compression）
  - 最大幅: 1920px
  - 品質: 80%
  ↓
Supabase Storageへアップロード
  - パス: /posts/images/{post_id}/{timestamp}_{filename}.webp
  ↓
エディタにURL挿入
  ↓
Next.js <Image>コンポーネントで最適化表示
```

### 4.4 関連リンク・タグシステム

#### 4.4.1 リレーション構造

```
posts ←→ tags (Many-to-Many: post_tags)
projects ←→ tags (Many-to-Many: project_tags)
posts ←→ posts (Many-to-Many: post_links)
posts ←→ projects (Many-to-Many: post_project_links)
in_progress → projects (One-to-Many: completed_project_id)
```

#### 4.4.2 タグフィルタリング

**URL形式**
- 単一タグ: `/posts?tags=tech`
- 複数タグ: `/posts?tags=tech,diary` （AND検索）

**実装例**
```typescript
// URL: /posts?tags=tech,nextjs
const tags = searchParams.tags?.split(',') || [];
const filteredPosts = await supabase
  .from('posts')
  .select('*, post_tags(tag:tags(*))')
  .filter('post_tags.tag.slug', 'in', `(${tags.join(',')})`);
```

### 4.5 Qiita連携

| 項目 | 仕様 |
|-----|------|
| **API** | Qiita API v2（`/api/v2/users/{username}/items`） |
| **更新方法** | 管理画面「関連リンク」ページから手動トリガー |
| **キャッシュ** | Supabase `qiita_cache` テーブル |
| **表示場所** | 固定ページ `/links` |
| **取得情報** | タイトル、URL、いいね数、公開日 |
| **表示件数** | 最新10件 |

### 4.6 バックアップ・エクスポート

#### 4.6.1 保存時エクスポート

```
記事保存完了
  ↓
/admin/posts/[id]/saved ページへ遷移
  ↓
「JSONダウンロード」ボタン
  ↓
API Route: /api/backup/export
  ↓
JSON生成（記事データ + メタ情報 + タグ + 関連リンク）
  ↓
ブラウザダウンロード
```

**エクスポート形式（JSON）**
```json
{
  "version": "1.0.0",
  "exportedAt": "2026-02-04T12:00:00Z",
  "type": "post",
  "data": {
    "id": "uuid",
    "title": "記事タイトル",
    "slug": "article-slug",
    "content": "Tiptap JSON形式",
    "status": "published",
    "published_at": "2026-02-04T10:00:00Z",
    "tags": ["tech", "nextjs"],
    "relatedPosts": ["uuid1", "uuid2"],
    "images": ["/posts/images/..."]
  }
}
```

**エクスポート形式（Markdown）**
```markdown
---
title: 記事タイトル
slug: article-slug
published_at: 2026-02-04T10:00:00Z
tags: [tech, nextjs]
---

# 記事タイトル

本文...
```

#### 4.6.2 全データエクスポート

```
/admin/backup ページ
  ↓
「全データエクスポート」ボタン
  ↓
API Route: /api/backup/export（全件モード）
  ↓
全記事・プロジェクト・進行中・タグ・関連リンクを一括取得
  ↓
ZIP圧縮（各コンテンツタイプごとにJSONファイル）
  ↓
ブラウザダウンロード
```

#### 4.6.3 インポート機能

```
/admin/backup ページ
  ↓
JSONファイルアップロード
  ↓
API Route: /api/backup/import
  ↓
バリデーション（スキーマチェック）
  ↓
重複チェック（slug一致）
  ↓
DB挿入（トランザクション）
  ↓
画像パス整合性確認
  ↓
完了レポート表示
```

### 4.7 検索機能

| 機能 | 実装方式 |
|-----|---------|
| **タグフィルタ** | メイン検索（複数タグAND検索） |
| **全文検索** | Postgres Full-Text Search（`pg_trgm` + `to_tsvector`） |
| **検索対象** | 記事タイトル・本文・タグ |
| **検索UI** | ヘッダー検索ボックス |

---

## 5. データフロー

### 5.1 記事作成フロー

```
管理者ログイン（Google OAuth）
  ↓
/admin/posts/new
  ↓
Tiptapエディタで執筆
  ↓
画像アップロード → WebP変換 → Supabase Storage
  ↓
タグ選択・メタ情報入力
  ↓
「保存」ボタン → Supabase Postgres（posts）
  ↓
/admin/posts/[id]/saved へリダイレクト
  ↓
エクスポートボタン表示
```

### 5.2 公開・閲覧フロー

```
一般ユーザー → /posts
  ↓
Next.js SSG/ISR → Supabase Postgres
  ↓
時限判定: published_at <= NOW()
  ↓ Yes
記事一覧表示（タグフィルタ適用）
  ↓
記事クリック → /posts/[slug]
  ↓
記事詳細表示（関連記事・目次・シェアボタン）
```

### 5.3 Qiita連携フロー

```
管理者 → /admin/settings または /links（管理モード）
  ↓
「Qiita記事更新」ボタン押下
  ↓
API Route: /api/qiita/refresh
  ↓
Qiita API v2: GET /users/{username}/items
  ↓
取得データ → Supabase `qiita_cache` テーブルに保存
  ↓
公開ページ /links → キャッシュから表示
```

### 5.4 プロジェクト完了フロー

```
管理者 → /admin/in-progress/[id]
  ↓
ステータスを「完了」に変更
  ↓
「完成プロジェクトを作成」ボタン
  ↓
/admin/projects/new（in_progressデータ引き継ぎ）
  ↓
プロジェクト作成 → projects テーブル
  ↓
in_progress.completed_project_id に紐付け
  ↓
/progress ページで「完了」項目から /works へのリンク表示
```

---

## 6. セキュリティ設計

### 6.1 認証・認可

| Layer | Implementation |
|-------|----------------|
| **管理画面認証** | Supabase Auth Middleware（Google OAuth） |
| **RLS** | PostgreSQL Row Level Security |
| **CSRF** | Next.js標準保護 |
| **XSS** | DOMPurify + Tiptapサニタイズ |
| **APIルート保護** | サーバーサイドセッション検証 |

### 6.2 RLSポリシー例

```sql
-- posts テーブル
CREATE POLICY "管理者は全アクセス可能"
ON posts FOR ALL
USING (auth.uid() = '管理者UUID');

CREATE POLICY "一般ユーザーは公開記事のみ閲覧"
ON posts FOR SELECT
USING (
  status = 'published' OR 
  (status = 'scheduled' AND published_at <= NOW())
);
```

### 6.3 Rate Limiting

| Target | Limit | Implementation |
|--------|-------|----------------|
| **API Routes** | 100 req/min/IP | Vercel Edge Config |
| **画像アップロード** | 10 files/min/user | カスタムミドルウェア |
| **コメント投稿** | 5 req/min/user | reCAPTCHA v3 + Rate Limiter |

---

## 7. パフォーマンス戦略

### 7.1 静的生成（SSG）

| ページ | 生成タイミング |
|-------|-------------|
| ホーム | ビルド時 |
| 固定ページ | ビルド時 |
| 記事詳細（公開済み） | ビルド時 |
| プロジェクト詳細 | ビルド時 |

### 7.2 増分静的再生成（ISR）

| ページ | Revalidate |
|-------|-----------|
| トップページ | 3600s（1時間） |
| 記事一覧 | 3600s |
| 記事詳細 | 3600s |
| 固定ページ | 86400s（24時間） |
| プロジェクト一覧 | 3600s |

### 7.3 画像最適化

- Next.js `<Image>` コンポーネント使用
- WebP形式統一
- Lazy Loading自動適用
- レスポンシブ画像（deviceSizes設定）

---

## 8. 開発フェーズ

### Phase 1: Architecture & Schema（現在）
- [x] `docs/requirements.md` 作成
- [x] `docs/tech-stack.md` 作成
- [x] `docs/architecture.md` v2.0 作成
- [ ] `docs/data-schema.md` 作成
- [ ] ユーザー承認

### Phase 2: UI/UX Design
- [ ] `docs/ui-spec.md` 作成
- [ ] Figma/ワイヤーフレーム作成（オプション）
- [ ] コンポーネント設計

### Phase 3: Logic Flow
- [ ] `docs/logic-flow.md` 作成
- [ ] 時限投稿ロジック詳細
- [ ] バックアップ・復元ロジック詳細

### Phase 4: Implementation Plan
- [ ] `docs/implementation-plan.md` 作成
- [ ] タスク分解・優先順位付け

### Phase 5: Environment Setup
- [ ] Next.js プロジェクト初期化
- [ ] Supabaseインスタンス作成（dev/prod）
- [ ] Vercel連携
- [ ] 環境変数設定

### Phase 6: Database Implementation
- [ ] SQLマイグレーション作成
- [ ] RLSポリシー設定
- [ ] Seed データ投入
- [ ] TypeScript型生成

### Phase 7: Core Features
- [ ] 認証実装
- [ ] 記事CRUD実装
- [ ] Tiptapエディタ統合
- [ ] 画像アップロード実装

### Phase 8: Advanced Features
- [ ] プロジェクト管理実装
- [ ] 進行中管理実装
- [ ] タグフィルタ実装
- [ ] 関連リンク機能実装

### Phase 9: Backup & External API
- [ ] バックアップ・エクスポート実装
- [ ] インポート機能実装
- [ ] Qiita API連携実装

### Phase 10: UI/UX Polish
- [ ] レスポンシブ対応
- [ ] ダークモード実装
- [ ] アニメーション追加
- [ ] アクセシビリティ対応

### Phase 11: Testing & Optimization
- [ ] ユニットテスト作成
- [ ] パフォーマンス最適化
- [ ] SEO対策
- [ ] Lighthouse Score 90+達成

### Phase 12: Deployment
- [ ] 本番デプロイ
- [ ] Analytics設定
- [ ] モニタリング設定
- [ ] ドキュメント最終更新

---

## 9. 今後の検討事項

### 9.1 短期（3ヶ月以内）
- コメント機能（BOT対策付き）
- RSS/Atom Feed
- サイトマップ自動生成

### 9.2 中期（6ヶ月以内）
- 全文検索強化（Algolia検討）
- 記事シリーズ機能
- 記事バージョン管理

### 9.3 長期（1年以内）
- 多言語対応（i18n）
- SNS自動投稿連携
- 記事統計ダッシュボード

---

## 10. ドキュメント管理ルール

### 10.1 更新フロー
1. ユーザーから仕様変更要求
2. 該当ドキュメント更新
3. ユーザー承認
4. 実装コード変更
5. ドキュメント・コード整合性確認

### 10.2 バージョニング
- **メジャー**: アーキテクチャ変更（1.0.0 → 2.0.0）
- **マイナー**: 機能追加（2.0.0 → 2.1.0）
- **パッチ**: バグ修正・誤記訂正（2.1.0 → 2.1.1）

---

## 11. 承認状態

✅ **確定済み** - 本アーキテクチャで開発を進めます。

**次のステップ**: `docs/data-schema.md`（DB設計・ER図・型定義）の作成

---

## 12. ドキュメント更新履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | 初版作成（草案） |
| 2.0.0 | 2026-02-04 | 確定版（プロジェクト名・要件反映） |
