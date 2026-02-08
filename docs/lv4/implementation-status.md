# UniVerse Canvas 実装状況

プロジェクト全体の実装状況を一元管理するドキュメントです。

**最終更新**: 2026-02-09

---

## 📊 進捗サマリー

| カテゴリ | 進捗率 | 状況 |
|---------|-------|------|
| **データベース** | 100% | ✅ 完了 |
| **Server Actions** | 85% | 🟡 進行中（Read/CRUD実装済み、一部未実装） |
| **公開ページ** | 95% | 🟢 ほぼ完了（記事詳細ページのみ未実装） |
| **管理画面** | 35% | 🟡 進行中（エディタ・プロジェクト一覧実装済み） |
| **認証** | 0% | ⏳ 未着手 |
| **デプロイ** | 0% | ⏳ 未着手 |

**全体進捗**: 約55%

---

## ✅ 実装完了機能

### 1. データベース（100%）

#### テーブル設計・作成
- ✅ `posts` - 記事テーブル
- ✅ `projects` - プロジェクトテーブル
- ✅ `in_progress` - 進行中テーブル
- ✅ `tags` - タグテーブル
- ✅ `pages` - 固定ページテーブル
- ✅ `post_tags` - 記事×タグ中間テーブル
- ✅ `project_tags` - プロジェクト×タグ中間テーブル
- ✅ `post_links` - 記事×記事リンク中間テーブル
- ✅ `post_project_links` - 記事×プロジェクトリンク中間テーブル
- ✅ `qiita_cache` - Qiitaキャッシュテーブル（将来実装）

**ファイル**: `supabase/migrations/20260208000000_initial_schema.sql`

#### シードデータ
- ✅ タグデータ（14件）
- ✅ 記事データ（10件）
- ✅ プロジェクトデータ（6件）
- ✅ 進行中データ（6件）
- ✅ 固定ページデータ（about, links）

**ファイル**: `supabase/seed.sql`

---

### 2. Server Actions（70%）

#### 記事（Posts） - `src/lib/actions/posts.ts`
- ✅ `getPosts()` - 記事一覧取得（ページネーション、タグフィルタ、検索、ソート）
- ✅ `getPostBySlug()` - スラッグから記事取得（閲覧数自動インクリメント）
- ✅ `getRelatedPosts()` - 関連記事取得（タグ類似度ソート）
- ✅ `getRelatedPostsByTagsWithRandom()` - 関連記事取得（関連性評価 + ランダマイズ）
- ⏳ `createPost()` - 記事作成（未実装）
- ⏳ `updatePost()` - 記事更新（未実装）
- ⏳ `deletePost()` - 記事削除（未実装）

#### プロジェクト（Projects） - `src/lib/actions/projects.ts`
- ✅ `getProjects()` - プロジェクト一覧取得（ステータス・タグフィルタ）
- ✅ `getProjectBySlug()` - スラッグからプロジェクト取得
- ✅ `createProject()` - プロジェクト作成（2026-02-08実装）
- ✅ `updateProject()` - プロジェクト更新（2026-02-08実装）
- ✅ `deleteProject()` - プロジェクト削除（2026-02-08実装）

#### 進行中（In Progress） - `src/lib/actions/in-progress.ts`
- ✅ `getInProgressItems()` - 進行中アイテム一覧取得（ステータスフィルタ）
- ✅ `getInProgressById()` - IDから進行中アイテム取得
- ⏳ `createInProgress()` - 進行中アイテム作成（未実装）
- ⏳ `updateInProgress()` - 進行中アイテム更新（未実装）
- ⏳ `deleteInProgress()` - 進行中アイテム削除（未実装）

#### タグ（Tags） - `src/lib/actions/tags.ts`
- ✅ `getTags()` - 全タグ取得
- ✅ `getTagsWithCount()` - タグと使用回数取得
- ✅ `getTagBySlug()` - スラッグからタグ取得
- ⏳ `createTag()` - タグ作成（未実装）
- ⏳ `updateTag()` - タグ更新（未実装）
- ⏳ `deleteTag()` - タグ削除（未実装）

#### 固定ページ（Pages） - `src/lib/actions/pages.ts`
- ✅ `getPage()` - 固定ページ取得（home/about/links）
- ✅ `getAllPages()` - 全固定ページ取得
- ⏳ `updatePage()` - 固定ページ更新（未実装）

---

### 3. 公開ページ（80%）

#### ホームページ - `src/app/(public)/page.tsx`
- ✅ ヒーローセクション（モック）
- ✅ 最新記事セクション（モック）
- ✅ 最新プロジェクトセクション（モック）
- ⏳ DB連携（未実装）

#### 読み物一覧 - `src/app/(public)/posts/page.tsx`
- ✅ 記事一覧表示（PostsList コンポーネント）
- ✅ タグフィルタ（PostsFilter コンポーネント）
- ✅ 検索機能（デバウンス処理付き）
- ✅ ページネーション（Pagination コンポーネント）
- ✅ ソート機能（URLパラメータ経由）
- ✅ 結果サマリー表示

#### 記事詳細 - `src/app/(public)/posts/[slug]/page.tsx`
- ⏳ 記事本文表示（未実装）
- ⏳ 目次自動生成（未実装）
- ⏳ 関連記事表示（未実装）
- ⏳ シェアボタン（未実装）

#### 作ったもの - `src/app/(public)/works/page.tsx`
- ✅ プロジェクト一覧表示（カードギャラリー）
- ✅ タグフィルタ（ProjectsFilter コンポーネント）
- ✅ DB連携済み
- ✅ 詳細ページへのリンク統合（2026-02-08）

#### プロジェクト詳細 - `src/app/(public)/works/[slug]/page.tsx`
- ✅ プロジェクト基本情報表示（2026-02-08実装）
- ✅ 横スクロールギャラリー + Lightbox（2026-02-08実装）
- ✅ 技術スタック円グラフ（Chart.js）（2026-02-08実装）
- ✅ 本文コンテンツ（Tiptap JSONレンダリング）（2026-02-08実装）
- ✅ 関連記事表示（関連性評価 + ランダマイズ）（2026-02-08実装）
- ✅ OGP設定（2026-02-08実装）
- ✅ **エラー修正完了**（2026-02-09）
  - ✅ Hydration Error 修正（ProjectCard を Client Component 化）
  - ✅ 外部画像ドメイン設定（next.config.ts）
  - ✅ Dialog アクセシビリティ対応（DialogTitle + VisuallyHidden）
  - ✅ ギャラリーインジケーター連動機能実装

#### 進行中のこと - `src/app/(public)/progress/page.tsx`
- ✅ ステータス別タブ表示
- ✅ 進行中アイテム一覧表示
- ✅ プログレスバー表示
- ✅ DB連携済み
- ✅ 完了プロジェクトへのリンク統合（2026-02-08）

#### 自己紹介 - `src/app/(public)/about/page.tsx`
- ✅ プロフィール表示
- ✅ DB連携済み（metadata から情報取得）

#### 関連リンク - `src/app/(public)/links/page.tsx`
- ✅ リンク一覧表示（カテゴリ別）
- ✅ DB連携済み（metadata から情報取得）

---

### 4. 管理画面（20%）

#### レイアウト
- ✅ `AdminSidebar` - サイドバーナビゲーション（Blue Archive風デザイン）
- ✅ `AdminLayout` - 管理画面共通レイアウト

#### ダッシュボード - `src/app/(admin)/admin/dashboard/page.tsx`
- ⏳ 統計情報表示（モックのみ）
- ⏳ 最近の記事・プロジェクト一覧（モックのみ）

#### 記事管理
- **記事一覧** - `src/app/(admin)/admin/posts/page.tsx`
  - ⏳ 記事一覧表示（モックのみ）
  - ⏳ ステータスフィルタ（未実装）
  - ⏳ 検索機能（未実装）

- **記事作成** - `src/app/(admin)/admin/posts/new/page.tsx`
  - ✅ Tiptapエディタ統合
  - ✅ リッチテキスト編集機能
  - ✅ 画像挿入・リサイズ
  - ✅ 二段組レイアウト
  - ✅ テーブル挿入・削除
  - ✅ プレビュー機能
  - ⏳ 保存処理（未実装）

- **記事編集** - `src/app/(admin)/admin/posts/[id]/page.tsx`
  - ⏳ 記事編集画面（未実装）

- **プレビュー** - `src/app/(admin)/admin/posts/preview/page.tsx`
  - ✅ 記事プレビュー表示
  - ✅ デバイス切替（Desktop/Tablet/Mobile）
  - ✅ 公開レイアウトでの確認

#### プロジェクト管理
- ✅ プロジェクト一覧（2026-02-08実装）
  - ✅ カード形式一覧表示
  - ✅ 新規作成・編集ボタン
  - ✅ タグ・開発期間表示
  - ✅ 外部リンク対応
- ⏳ プロジェクト作成（コンポーネント準備完了、フォーム未実装）
  - ✅ `TechStackInput` コンポーネント（2026-02-08実装）
  - ✅ `ImageUploadMultiple` コンポーネント（2026-02-08実装）
  - ✅ `createProject()` Server Action（2026-02-08実装）
  - ⏳ 作成フォーム統合（未実装）
- ⏳ プロジェクト編集（未実装）

#### 進行中管理
- ⏳ 進行中一覧（モックのみ）
- ⏳ 進行中作成（未実装）
- ⏳ 進行中編集（未実装）

#### バックアップ - `src/app/(admin)/admin/backup/page.tsx`
- ⏳ エクスポート機能（モックのみ）
- ⏳ インポート機能（未実装）

---

### 5. UIコンポーネント

#### レイアウト - `src/components/layout/`
- ✅ `Header.tsx` - サイトヘッダー
- ✅ `Footer.tsx` - サイトフッター
- ✅ `AdminSidebar.tsx` - 管理画面サイドバー

#### 共通 - `src/components/common/`
- ✅ `GradientAccent.tsx` - グラデーションアクセント
- ✅ `AccentCard.tsx` - アクセントカード

#### 記事 - `src/components/posts/`
- ✅ `PostsList.tsx` - 記事一覧表示
- ✅ `PostsFilter.tsx` - タグフィルタ・検索
- ✅ `Pagination.tsx` - ページネーション
- ⏳ `PostCard.tsx` - 記事カード（未作成）
- ⏳ `PostContent.tsx` - 記事本文表示（未作成）
- ⏳ `TableOfContents.tsx` - 目次（未作成）

#### プロジェクト - `src/components/projects/`
- ✅ `ProjectsFilter.tsx` - タグフィルタ
- ✅ `ProjectGallery.tsx` - 横スクロールギャラリー + Lightbox（2026-02-08実装）
- ✅ `TechStackChart.tsx` - 技術スタック円グラフ（Chart.js）（2026-02-08実装）
- ✅ `ProjectContent.tsx` - プロジェクト本文表示（Tiptap JSON）（2026-02-08実装）
- ✅ `RelatedPosts.tsx` - 関連記事表示（2026-02-08実装）

#### 管理画面 - `src/components/admin/`
- ✅ `TechStackInput.tsx` - 技術スタック入力（動的フォーム）（2026-02-08実装）
- ✅ `ImageUploadMultiple.tsx` - 複数画像アップロード（2026-02-08実装）

#### エディタ - `src/components/editor/`
- ✅ `TiptapEditor.tsx` - メインエディタ
- ✅ `EditorToolbar.tsx` - ツールバー（全機能実装済み）
- ✅ `PreviewModal.tsx` - プレビューモーダル
- ✅ `extensions/ColumnLayout.tsx` - 二段組レイアウト
- ✅ `extensions/ResizableImage.tsx` - リサイズ可能画像
- ✅ `extensions/TableWithDelete.tsx` - 削除可能テーブル

#### UI（shadcn/ui） - `src/components/ui/`
- ✅ Button, Card, Input, Textarea, Select, Tabs
- ✅ Badge, Avatar, Dropdown Menu, Navigation Menu
- ✅ Sheet, Dialog, Sonner（トースト）
- ✅ Separator, Scroll Area, Label, Slider, Popover, Tooltip

---

### 6. 型定義（100%）

**ファイル**: `src/types/database.ts`

- ✅ `Post`, `PostWithTags`, `PostWithRelations`
- ✅ `Project`, `ProjectWithTags`
- ✅ `InProgress`, `InProgressWithProject`
- ✅ `Tag`, `TagWithCount`
- ✅ `Page`
- ✅ `Database`（Supabase型定義）

---

### 7. スタイル（100%）

**ファイル**: `src/styles/globals-pattern1-sky-coral.css`

- ✅ Blue Archive風カラースキーム（oklch）
- ✅ 空→宇宙→雲の背景グラデーション
- ✅ Tiptap proseスタイルカスタマイズ
- ✅ 二段組レイアウトCSS
- ✅ リサイズ可能画像CSS
- ✅ テーブルスタイル
- ✅ コードブロックスタイル（黒背景）
- ✅ レスポンシブデザイン

---

## 🟡 進行中機能

### 1. 管理画面CRUD操作

**優先度**: 高

- 🔨 記事作成・更新・削除
- 🔨 プロジェクト作成・更新・削除
- 🔨 進行中アイテム作成・更新・削除
- 🔨 固定ページ編集
- 🔨 タグ管理

**必要なServer Actions**:
- `createPost()`, `updatePost()`, `deletePost()`
- `createProject()`, `updateProject()`, `deleteProject()`
- `createInProgress()`, `updateInProgress()`, `deleteInProgress()`
- `updatePage()`, `createTag()`, `updateTag()`, `deleteTag()`

---

### 2. 記事詳細ページ

**優先度**: 高

- 🔨 記事本文表示（Tiptap JSONレンダリング）
- 🔨 目次自動生成（h2/h3から）
- 🔨 関連記事表示（実装済みのServer Action使用）
- 🔨 シェアボタン（Twitter/Facebook/Link）
- 🔨 閲覧数表示
- 🔨 読了時間表示

**ファイル**: `src/app/(public)/posts/[slug]/page.tsx`

---

## ⏳ 未実装機能

### 優先度: 高

#### 1. 認証機能
- ⏳ Supabase Auth統合
- ⏳ Google OAuth実装
- ⏳ 管理者ログイン画面
- ⏳ セッション管理
- ⏳ ログアウト機能

**関連ファイル（作成予定）**:
- `src/lib/supabase/auth.ts`
- `src/app/(admin)/login/page.tsx`

---

#### 2. 画像アップロード
- ⏳ Supabase Storageへのアップロード
- ⏳ クライアント側WebP変換（browser-image-compression）
- ⏳ 画像リサイズ・最適化
- ⏳ プログレス表示

**関連ファイル（作成予定）**:
- `src/lib/actions/images.ts`
- `src/components/editor/ImageUploader.tsx`

---

#### 3. バックアップ・エクスポート
- ⏳ JSON形式エクスポート
- ⏳ Markdown形式エクスポート
- ⏳ ZIP一括ダウンロード
- ⏳ インポート機能（重複検出・スキップ）

**関連ファイル（作成予定）**:
- `src/lib/actions/backup.ts`
- `src/app/(admin)/admin/backup/page.tsx`（更新）

---

### 優先度: 中

#### 4. 検索機能強化
- ⏳ PostgreSQL全文検索（`pg_trgm` + `to_tsvector`）
- ⏳ 検索インデックス最適化
- ⏳ 検索結果ハイライト

---

#### 5. OGP画像自動生成
- ⏳ Vercel OG Image使用
- ⏳ 記事タイトル・タグから自動生成
- ⏳ カスタムテンプレート

**関連ファイル（作成予定）**:
- `src/app/api/og/route.tsx`

---

#### 6. Qiita連携
- ⏳ Qiita API v2統合
- ⏳ 外部記事取得・キャッシュ
- ⏳ 自動更新（Cron）

**関連ファイル（作成予定）**:
- `src/lib/actions/qiita.ts`
- `src/app/api/qiita/route.ts`

---

### 優先度: 低

#### 7. コメント機能
- ⏳ コメントテーブル作成
- ⏳ コメント投稿・削除
- ⏳ BOT対策（reCAPTCHA v3）
- ⏳ Rate Limiting
- ⏳ 管理者承認制

---

#### 8. RSS/Atom Feed
- ⏳ RSS 2.0フィード生成
- ⏳ Atom 1.0フィード生成
- ⏳ `/feed.xml`, `/atom.xml`エンドポイント

---

#### 9. サイトマップ自動生成
- ⏳ 動的サイトマップ生成
- ⏳ `/sitemap.xml`エンドポイント

---

#### 10. 記事シリーズ機能
- ⏳ シリーズテーブル作成
- ⏳ シリーズ管理画面
- ⏳ シリーズナビゲーション

---

## 🎉 最近の実装完了

### 2026-02-09: プロジェクト詳細ページのエラー修正完了
- **Hydration Error 修正**
  - 問題: `<Link>` 内に `<a>` タグがネストされていた
  - 解決: ProjectCard を Client Component 化、`useRouter` でプログラマティック遷移
- **外部画像ドメイン設定**
  - next.config.ts に `remotePatterns` 追加（placehold.co, *.supabase.co）
- **Dialog アクセシビリティ対応**
  - ProjectGallery に `DialogTitle` + `VisuallyHidden` 追加
- **ギャラリーインジケーター連動機能**
  - scroll イベント + `getBoundingClientRect()` で位置ベース検出
  - スクロールに連動してインジケーター（点々）が自動更新

### 2026-02-08: プロジェクト詳細ページ実装完了（IMP-C）
- データスキーマ拡張（steps_count, used_ai, gallery_images, tech_stack）
- Server Actions CRUD（createProject, updateProject, deleteProject）
- 詳細ページ実装（/works/[slug]）
- 横スクロールギャラリー + Lightbox
- 技術スタック円グラフ（Chart.js）
- 関連記事表示（関連性評価 + ランダマイズ）
- プロジェクト管理画面一覧

---

## 📝 実装計画（次のステップ）

### フェーズ1: CRUD操作実装（2週間）
1. Server ActionsにCUD操作追加
2. Zodバリデーション実装
3. 管理画面の記事作成・編集完成
4. 画像アップロード機能実装

### フェーズ2: 記事詳細ページ実装（1週間）
1. 記事詳細ページ作成
2. 目次自動生成
3. 関連記事表示
4. シェアボタン

### フェーズ3: 認証実装（1週間）
1. Supabase Auth統合
2. ログイン画面作成
3. セッション管理
4. RLSポリシー適用

### フェーズ4: 最適化・デプロイ（1週間）
1. パフォーマンス最適化
2. SEO対策
3. OGP画像設定
4. Vercelデプロイ

---

## 🔗 関連ドキュメント

- [要件定義](../lv1/requirements.md)
- [アーキテクチャ](../lv1/architecture_v2.md)
- [技術スタック](../lv1/tech-stack.md)
- [データスキーマ](../lv2/data-schema.md)
- [Server Actions仕様](../lv2/api-spec.md)
- [コンポーネント仕様](./component-spec.md)
- [エディタ実装状況](./editor-implementation-status.md)
- [ページ実装状況](./pages-implementation.md)

---

**最終更新**: 2026-02-09
**次回更新予定**: プロジェクト作成・編集フォーム実装完了時
