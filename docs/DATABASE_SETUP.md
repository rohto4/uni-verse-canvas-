# データベースセットアップガイド

このガイドでは、Supabaseプロジェクトのデータベースをセットアップする手順を説明します。

## 前提条件

- Supabaseプロジェクトが作成済みであること
- プロジェクトのURLとAnon Keyを取得済みであること

## セットアップ手順

### 1. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を記述してください:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**重要**: `your_supabase_url_here` と `your_supabase_anon_key_here` を、実際のSupabaseプロジェクトの値に置き換えてください。

### 2. マイグレーションの実行

Supabase Studioで以下の手順を実行します:

1. Supabaseダッシュボード（https://app.supabase.com）にログイン
2. 対象のプロジェクトを選択
3. 左サイドバーから「SQL Editor」を選択
4. `supabase/migrations/20260208000000_initial_schema.sql` ファイルの内容を全てコピー
5. SQL Editorにペーストして「Run」ボタンをクリック

**確認**: エラーが出ないことを確認してください。成功すると、以下のテーブルが作成されます:
- tags
- posts
- projects
- in_progress
- pages
- post_tags
- project_tags
- post_links
- post_project_links
- qiita_cache

### 3. シードデータの投入

同様にSupabase Studioで以下を実行します:

1. SQL Editorを開く
2. `supabase/seed.sql` ファイルの内容を全てコピー
3. SQL Editorにペーストして「Run」ボタンをクリック

**確認**: 以下のデータが投入されたことを確認してください:
- タグ: 14件
- プロジェクト: 6件
- 進行中のこと: 6件
- ページ: 2件（about, links）

### 4. データの確認

Supabase Studioの「Table Editor」で各テーブルのデータを確認できます:

1. 左サイドバーから「Table Editor」を選択
2. 各テーブル（projects, in_progress, tags, pages）を選択
3. データが正しく投入されているか確認

### 5. アプリケーションの起動

環境変数とデータベースの準備ができたら、開発サーバーを起動します:

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開き、以下のページで実際のデータが表示されることを確認してください:

- `/progress` - 進行中のこと
- `/works` - 作ったもの
- `/about` - 自己紹介
- `/links` - 関連リンク

## トラブルシューティング

### データが表示されない場合

1. `.env.local` ファイルが正しく設定されているか確認
2. 開発サーバーを再起動（Ctrl+Cで停止 → `npm run dev`）
3. ブラウザのコンソールでエラーメッセージを確認

### マイグレーションエラーが出る場合

- すでにテーブルが存在している可能性があります
- その場合は、既存のテーブルを削除してから再度マイグレーションを実行してください

### シードデータエラーが出る場合

- UUIDの重複エラーの場合は、seed.sqlの最初にある`TRUNCATE`文でテーブルをクリアしてから再実行してください

## データのカスタマイズ

シードデータは仮のデータです。実際のデータに置き換えるには:

### 方法1: Supabase Studioから直接編集

1. Table Editorで各テーブルを開く
2. 行をクリックして編集
3. Saveボタンで保存

### 方法2: SQLで更新

SQL Editorで UPDATE文を実行:

```sql
-- 例: 自己紹介ページのメタデータを更新
UPDATE pages
SET metadata = jsonb_set(
  metadata,
  '{name}',
  '"あなたの名前"'::jsonb
)
WHERE page_type = 'about';
```

### 方法3: 管理画面を実装して編集

今後、管理画面から直接編集できる機能を実装予定です。

## 次のステップ

- [ ] 管理画面でのCRUD操作実装
- [ ] 画像アップロード機能の実装
- [ ] 記事（posts）機能の実装
- [ ] 認証機能の実装

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Next.js + Supabase統合ガイド](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
