# 作ったもの（Projects）機能 実装状況

プロジェクトの一覧・詳細・作成・編集機能の実装状況です。

**最終更新**: 2026-02-19
**進捗率**: 100%

---

## 📊 実装状況サマリー

| 機能 | 状況 | ファイル |
|------|------|---------|
| プロジェクト一覧ページ | ✅ 完了 | `src/app/(public)/works/page.tsx` |
| プロジェクト詳細ページ | ✅ 完了 | `src/app/(public)/works/[slug]/page.tsx` |
| プロジェクト管理一覧 | ✅ 完了 | `src/app/(admin)/admin/projects/page.tsx` |
| プロジェクト作成画面 | ✅ 完了 | `src/app/(admin)/admin/projects/new/page.tsx` |
| プロジェクト編集画面 | ✅ 完了 | `src/app/(admin)/admin/projects/[id]/page.tsx` |
| Server Actions CRUD | ✅ 完了 | `src/lib/actions/projects.ts` |

---

## ✅ 実装完了機能

### 1. 公開側ページ

#### プロジェクト一覧ページ (`/works`)
- ✅ カード形式でのプロジェクト一覧表示
- ✅ タグ、公開/非公開によるフィルタリング機能
- ✅ DB連携済み

#### プロジェクト詳細ページ (`/works/[slug]`)
- ✅ プロジェクトの全情報（基本情報、実績、ギャラリー、技術スタック、本文）を表示
- ✅ 横スクロール可能な画像ギャラリー（Lightbox付き）
- ✅ Chart.jsを使用した技術スタック円グラフ
- ✅ Tiptapで作成されたコンテンツのレンダリング
- ✅ 関連するブログ記事の表示機能
- ✅ Hydrationエラー、アクセシビリティ対応済み

---

### 2. 管理側ページ

#### プロジェクト管理一覧 (`/admin/projects`)
- ✅ カード形式でのプロジェクト一覧表示
- ✅ 新規作成、編集ページへのリンク

#### プロジェクト作成画面
- ✅ 余白（`p-6 lg:p-8`）を追加し、管理画面と統一。

#### プロジェクト作成・編集ページ
- ✅ **`ProjectForm`コンポーネント**による共通化されたフォームUI
- ✅ `react-hook-form`と`zod`による厳密なバリデーション
- ✅ 基本情報、URL、日付、開発規模などの入力
- ✅ **`ImageUploadMultiple`**コンポーネントによるカバー画像・ギャラリー画像のアップロード
- ✅ **`TechStackInput`**コンポーネントによる技術スタックの動的入力
- ✅ **`TiptapEditor`**による詳細コンテンツの編集
- ✅ `createProject`, `updateProject` Server Actionsとの連携
- ✅ 公開リンク（download/website）の設定
- ✅ 作成・更新後のトースト通知とページ遷移

---

### 3. バックエンド

#### Server Actions (`src/lib/actions/projects.ts`)
- ✅ `createProject`, `updateProject`, `deleteProject` のCRUD操作をすべて実装
- ✅ `getProjects`, `getProjectBySlug`, `getProjectById` のデータ取得処理を実装

#### データスキーマ
- ✅ `projects`テーブルに`steps_count`, `used_ai`, `gallery_images`, `tech_stack`などのショーケース用カラムを追加済み
- ✅ `public_link_type`, `public_link_url` の追加マイグレーション適用済み

---

## 🎯 次のステップ

この機能に関する主要な実装はすべて完了しました。今後はテスト/SEO/運用準備を優先します。

---

## 📚 関連ドキュメント

- [データスキーマ](../specs/data-schema.md) - Projectsテーブル定義
- [Server Actions仕様](../specs/api-spec.md) - Projects関連API
- [全体概要](./00-overview.md)
