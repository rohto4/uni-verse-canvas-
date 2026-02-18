# 読み物（Posts）機能 実装状況

記事の一覧・詳細・作成・編集機能の実装状況です。

**最終更新**: 2026-02-19
**進捗率**: 100%

---

## 📊 実装状況サマリー

| 機能 | 状況 | ファイル |
|------|------|---------|
| **公開画面** |
| 記事一覧ページ | ✅ 完了 | `src/app/(public)/posts/page.tsx` |
| 記事詳細ページ | ✅ 完了 | `src/app/(public)/posts/[slug]/page.tsx` |
| **管理画面** |
| 記事一覧ページ | ✅ 完了 | `src/app/(admin)/admin/posts/page.tsx` |
| 記事作成ページ | ✅ 完了 | `src/app/(admin)/admin/posts/new/page.tsx` |
| 記事編集ページ | ✅ 完了 | `src/app/(admin)/admin/posts/[id]/page.tsx` |
| **バックエンド** |
| Server Actions (CRUD) | ✅ 完了 | `src/lib/actions/posts.ts` |

---

## ✅ 実装完了機能

### 1. 公開側: 記事一覧ページ

**ファイル**: `src/app/(public)/posts/page.tsx`

- ✅ 記事一覧表示（10件/ページ）
- ✅ タグフィルタリング（AND検索）
- ✅ キーワード検索機能
- ✅ ページネーション
- ✅ ソート機能
- ✅ Suspenseによる段階的レンダリング
- ✅ 使用コンポーネント: `PostsList`, `PostsFilter`, `Pagination`

### 2. 公開側: 記事詳細ページ

**ファイル**: `src/app/(public)/posts/[slug]/page.tsx`

- ✅ **記事本文の表示**: `getPostBySlug`で取得したTiptap JSONコンテンツを`PostContent`コンポーネントでレンダリング。
- ✅ **目次の自動生成**: 記事内のh2/h3見出しから目次を動的に生成し、スムーズスクロールを実装。
- ✅ **関連記事の表示**: タグに基づいて関連する記事を最大3件表示。
- ✅ **RLS対応**: `post_tags`/`post_links` の公開読み取りポリシー追加（詳細ページでのタグ取得に必須）。
- ✅ **シェアボタン**: `ShareButtons`コンポーネントを実装。Twitter, Facebook, リンクコピー、Native Shareに対応。
- ✅ **メタ情報表示**: 閲覧数、読了時間の目安、公開日を表示。
- ✅ **OGP対応**: 動的なOGPタグ（Open Graph, Twitter Card）を生成。

---

### 3. 管理側: CRUD機能

#### Server Actions (`src/lib/actions/posts.ts`)
- ✅ **createPost**: Zodバリデーション、トランザクション（記事作成＋タグ紐付け）を実装。
- ✅ **updatePost**: 部分更新、タグの再設定、トランザクション補償を実装。
- ✅ **deletePost**: 記事と関連タグを削除。
- ✅ **getPostById**: IDで記事を取得（編集画面用）。

#### 記事一覧ページ (`src/app/(admin)/admin/posts/page.tsx`)
- ✅ `getPosts`と連携し、全ステータスの記事一覧を表示。
- ✅ ステータスフィルタ（すべて/下書き/予約/公開）機能。
- ✅ キーワード検索機能。
- ✅ 記事ごとの編集・削除ドロップダウンメニュー。
- ✅ `deletePost`アクションと連携した非同期削除、トースト通知。

#### 記事作成ページ (`src/app/(admin)/admin/posts/new/page.tsx`)
- ✅ `TiptapEditor`を統合した高機能エディタUI。
- ✅ タイトル、スラッグ（自動生成）、抜粋、公開設定、タグ選択などのメタデータ入力。
- ✅ `createPost`アクションと連携した保存処理。
- ✅ Zodバリデーションに基づいたエラーハンドリングとトースト通知。
- ✅ プレビュー機能、Markdownエクスポート機能。
- ✅ 操作ボタン（プレビュー/エクスポート/保存）をタイトル右に配置。
- ✅ 右カラムのカード配置をフラットに整列（カバー/OGP/関連記事/関連プロジェクト）。

#### 記事編集ページ (`src/app/(admin)/admin/posts/[id]/page.tsx`)
- ✅ `getPostById`で記事データを取得し、フォームに初期表示。
- ✅ `updatePost`アクションと連携した更新処理。
- ✅ 未保存の変更がある場合に「保存」ボタンを有効化する状態管理。
- ✅ 最終保存時刻の表示。
- ✅ プレビュー機能、削除機能（ダイアログ付き）。

---

## 🎯 次のステップ

主要な機能の実装は完了しました。今後はテスト/SEO/運用準備を進めます。

---

## 📚 関連ドキュメント

- [データスキーマ](../specs/data-schema.md) - Postsテーブル定義
- [Server Actions仕様](../specs/api-spec.md) - Posts関連API
- [全体概要](./00-overview.md)

---

**最終更新**: 2026-02-19
