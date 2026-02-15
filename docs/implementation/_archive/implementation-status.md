# UniVerse Canvas 実装状況

プロジェクト全体の実装状況を一元管理するドキュメントです。

**最終更新**: 2026-02-15

---

## 📊 進捗サマリー

| カテゴリ | 進捗率 | 状況 |
|---------|-------|------|
| **データベース** | 100% | ✅ 完了 |
| **Server Actions** | 95% | ✅ 完了（タグ・ページ管理のCUD操作を除く） |
| **公開ページ** | 90% | 🟡 進行中（記事詳細ページが未実装） |
| **管理画面** | 85% | 🟢 ほぼ完了（ダッシュボード・バックアップ機能がモック状態） |
| **認証** | 0% | ⏳ 未着手 |
| **デプロイ** | 0% | ⏳ 未着手 |

**全体進捗**: 約80%

---

## ✅ 実装完了機能

### 1. データベース（100%）

- ✅ テーブル設計・作成完了
- ✅ シードデータ投入完了

---

### 2. Server Actions（95%）

#### 記事（Posts） - `src/lib/actions/posts.ts`
- ✅ `getPosts`, `getPostBySlug`, `getPostById`, `getRelatedPosts`, `getRelatedPostsByTagsWithRandom`
- ✅ `createPost`, `updatePost`, `deletePost`

#### プロジェクト（Projects） - `src/lib/actions/projects.ts`
- ✅ `getProjects`, `getProjectBySlug`, `getProjectById`
- ✅ `createProject`, `updateProject`, `deleteProject`

#### 進行中（In Progress） - `src/lib/actions/in-progress.ts`
- ✅ `getInProgressItems`, `getInProgressById`
- ✅ `createInProgress`, `updateInProgress`, `deleteInProgress`

#### タグ（Tags） - `src/lib/actions/tags.ts`
- ✅ `getTags`, `getTagsWithCount`, `getTagBySlug`
- ⏳ `createTag`, `updateTag`, `deleteTag` (未実装)

#### 固定ページ（Pages） - `src/lib/actions/pages.ts`
- ✅ `getPage`, `getAllPages`
- ⏳ `updatePage` (未実装)

#### 画像（Images） - `src/lib/actions/storage.ts`
- ✅ `uploadFile`

---

### 3. 公開ページ（90%）

- ✅ **ホーム**: モック表示（DB連携は未実装）
- ✅ **読み物一覧**: 機能完了（フィルタ、検索、ページネーション含む）
- ✅ **作ったもの一覧**: 機能完了
- ✅ **プロジェクト詳細**: 機能完了
- ✅ **進行中のこと一覧**: 機能完了
- ✅ **自己紹介**: 機能完了
- ✅ **関連リンク**: 機能完了
- ⏳ **記事詳細**: 未実装

---

### 4. 管理画面（85%）

- ✅ **レイアウト**: `AdminSidebar`, `AdminLayout` 完了
- ✅ **記事管理**: 一覧、新規作成、編集、削除の全機能完了
- ✅ **プロジェクト管理**: 一覧、新規作成、編集、削除の全機能完了
- ✅ **進行中管理**: 一覧、新規作成、編集、削除の全機能完了
- 🟡 **ダッシュボード**: モック表示（DB連携は未実装）
- 🟡 **バックアップ**: モック表示（機能未実装）

---

### 5. UIコンポーネント & その他

- ✅ **UIコンポーネント**: `shadcn/ui`ベースのコンポーネント群はほぼ完了
- ✅ **エディタ**: `Tiptap`ベースのエディタ機能は完了
- ✅ **型定義**: `src/types/database.ts` は最新の状態
- ✅ **スタイル**: 基本的なテーマとスタイルは完了

---

## ⏳ 未実装機能（優先度順）

### 優先度: 高 🔥

1.  **認証機能**
    - Supabase Auth（Google OAuth）を使用したログイン・ログアウト機能の実装
    - 管理画面へのアクセス制御（認証必須化）
    - 関連ファイル: `src/lib/supabase/auth.ts`, `src/app/login/page.tsx`, `src/app/(admin)/layout.tsx`

2.  **公開側 記事詳細ページ**
    - Tiptapで作成された記事コンテンツの表示
    - 目次、関連記事、シェア機能の実装
    - 関連ファイル: `src/app/(public)/posts/[slug]/page.tsx`

### 優先度: 中 🟡

3.  **管理ダッシュボードのデータ連携**
    - 統計情報（記事数など）をDBから取得して表示
    - 関連ファイル: `src/app/(admin)/admin/dashboard/page.tsx`

4.  **バックアップ・インポート機能**
    - JSON/Markdown形式でのデータエクスポート機能の実装
    - 関連ファイル: `src/app/(admin)/admin/backup/page.tsx`, `src/app/api/backup/route.ts`

### 優先度: 低 ⏸️

5.  **タグ・固定ページ管理機能**
    - 管理画面からのタグ、固定ページの作成・編集機能
6.  **ホームページのDB連携**
    - 最新記事・プロジェクトをDBから取得して表示
7.  **その他拡張機能**
    - Qiita連携、コメント機能、全文検索強化など

---

## 🎉 最近の実装完了

### 2026-02-15: 設計書と実装の同期
- `implementation-status.md` を現状のコードベースに合わせて更新。
- 管理画面のCRUD機能が完了していることを反映。
- 次のタスクとして「認証」と「記事詳細ページ」を再定義。

### 2026-02-10: 進行中アイテム管理機能（CRUD・管理画面）実装
- **Server Actions**: `createInProgress`, `updateInProgress`, `deleteInProgress` を実装し、一覧・作成・更新・削除の全操作をサポート。
- **管理画面**: 進行中アイテムの一覧・作成・編集画面を実装。

### 2026-02-10: プロジェクト管理機能（CRUD・画像アップロード）実装
- **Server Actions (Projects)**: `createProject`, `updateProject`, `deleteProject` のAPI連携完了。
- **管理画面**: プロジェクト作成・編集画面の実装完了。

### 2026-02-10: 記事CRUD（Server Actions）と管理画面実装（作成・一覧・編集）
- **Server Actions実装**: `createPost`, `updatePost`, `deletePost`
- **管理画面**: 記事の作成・一覧・編集機能の実装完了。

---

## 🔗 関連ドキュメント

- [要件定義](./requirements.md)
- [アーキテクチャ](../architecture/system-architecture.md)
- [技術スタック](../config/tech-stack.md)
- [データスキーマ](../specs/data-schema.md)
- [Server Actions仕様](../specs/api-spec.md)
- [コンポーネント仕様](../specs/component-spec.md)

---
