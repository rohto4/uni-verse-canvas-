# 機能有効化チェックリスト

このセッションで実装した機能を有効化するために必要な作業のチェックリストです。

## ✅ 事前準備

### Supabaseプロジェクト情報
- [OK] Supabaseプロジェクトが作成済み
- [OK] プロジェクトURLを確認済み（`https://[project-id].supabase.co`）
- [OK] Anon Key（公開鍵）を確認済み
- [OK] Supabase Studioにアクセス可能

### ローカル環境
- [OK] Node.js がインストール済み
- [OK] `npm install` が完了している
- [OK] プロジェクトディレクトリに移動済み

---

## 🔧 環境変数設定

### .env.local ファイル作成
- [OK] プロジェクトルートに `.env.local` ファイルを作成
- [OK] 以下の2つの環境変数を設定:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
  ```
- [OK] URLとキーを実際の値に置き換え（`your_actual_...` を削除）
- [OK] ファイル保存を確認

### 環境変数の確認方法
```bash
# Supabase Dashboard → Project Settings → API
# URL: Project URL
# Anon Key: anon public (公開鍵)
```

---

## 🗄️ データベースセットアップ

### マイグレーション実行
- [OK] Supabase Studioを開く（https://app.supabase.com）
- [OK] 対象プロジェクトを選択
- [OK] 左サイドバー → **SQL Editor** を開く
- [OK] `supabase/migrations/20260208000000_initial_schema.sql` の内容を全てコピー
- [OK] SQL Editorにペースト
- [OK] **Run** ボタンをクリック
- [OK] エラーが出ないことを確認
- [OK] "Success. No rows returned" のようなメッセージを確認

### テーブル作成の確認
以下のテーブルが作成されていることを確認:
- [OK] `tags` テーブル
- [OK] `posts` テーブル
- [OK] `projects` テーブル
- [OK] `in_progress` テーブル
- [OK] `pages` テーブル
- [OK] `post_tags` テーブル（中間テーブル）
- [OK] `project_tags` テーブル（中間テーブル）
- [OK] `post_links` テーブル（中間テーブル）
- [OK] `post_project_links` テーブル（中間テーブル）
- [OK] `qiita_cache` テーブル

**確認方法**: 左サイドバー → **Table Editor** で各テーブルを確認

---

## 📊 シードデータ投入

### シードSQL実行
- [OK] Supabase Studio → **SQL Editor** を開く
- [OK] `supabase/seed.sql` の内容を全てコピー
- [OK] SQL Editorにペースト
- [OK] **Run** ボタンをクリック
- [OK] エラーが出ないことを確認


### データ投入の確認
**Table Editor** で以下のデータを確認:
- [OK] `tags`: 14件のタグデータ
- [OK] `posts`: 10件の記事データ
- [OK] `projects`: 6件のプロジェクトデータ
- [OK] `in_progress`: 6件の進行中データ
- [OK] `pages`: 2件のページデータ（about, links）
- [OK] `post_tags`: 記事とタグの紐付けデータ
- [OK] `project_tags`: プロジェクトとタグの紐付けデータ

---

## 🚀 アプリケーション起動

### 開発サーバー起動
- [OK] ターミナルでプロジェクトディレクトリに移動
- [OK] 以下のコマンドを実行:
  ```bash
  npm run dev
  ```
- [OK] エラーが出ないことを確認
- [OK] "ready started server on ..." のメッセージを確認
- [OK] ブラウザで http://localhost:3000 を開く

---

## 🧪 動作確認

### 各ページの表示確認
- [OK] **ホーム** (http://localhost:3000) - エラーなく表示される
- [OK] **読み物一覧** (http://localhost:3000/posts) - 記事10件が表示される
- [OK] **作ったもの** (http://localhost:3000/works) - プロジェクト6件が表示される
- [OK] **進行中のこと** (http://localhost:3000/progress) - 進行中6件が表示される
- [OK] **自己紹介** (http://localhost:3000/about) - プロフィールが表示される
- [OK] **関連リンク** (http://localhost:3000/links) - リンク一覧が表示される

### 読み物ページの機能確認
- [OK] **記事一覧表示**: 10件の記事が表示される
- [OK] **タグフィルタ**: タグをクリックしてフィルタリングできる
- [OK] **検索機能**: 検索ボックスに入力して記事を検索できる
- [OK] **ページネーション**: ページ番号をクリックできる（記事が10件以下の場合は表示されない）
- [OK] **タグバッジ**: 各記事にタグが表示される
- [OK] **日付とビュー数**: 公開日とビュー数が表示される

### エラーチェック
- [OK] ブラウザのコンソール（F12）にエラーが出ていない
- [OK] ターミナルにエラーログが出ていない
- [OK] ページ遷移時にエラーが発生しない

---

## ❌ トラブルシューティング

### エラーが出る場合、以下を確認:

#### 環境変数エラー
```
Error: supabaseUrl is required
```
- [OK] `.env.local` ファイルが存在するか
- [OK] ファイル名が `.env.local` になっているか（`.env.local.txt` などではない）
- [OK] 環境変数名が正しいか（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- [OK] 開発サーバーを再起動したか（環境変数変更後は必須）

#### データベース接続エラー
```
Error fetching posts: ...
```
- [OK] Supabase URLとAnon Keyが正しいか
- [OK] Supabaseプロジェクトが起動しているか（Paused状態でないか）
- [OK] RLSポリシーが正しく設定されているか

#### データが表示されない
- [OK] シードデータが正しく投入されているか（Table Editorで確認）
- [OK] ブラウザのキャッシュをクリアしたか
- [OK] ページをリロードしたか

#### TypeScriptエラー
```
Type error: ...
```
- [OK] `npm install` を実行したか
- [OK] `node_modules` を削除して再インストールしたか
  ```bash
  rm -rf node_modules
  npm install
  ```

---

## 📋 最終確認

### 完了チェック
- [OK] 全ページがエラーなく表示される
- [OK] データベースのデータが正しく表示される
- [OK] タグフィルタリングが動作する
- [△] 検索機能が動作する
- [OK] ページネーションが動作する
- [OK] ブラウザコンソールにエラーがない
- [OK] ターミナルにエラーログがない

### 次のステップ
- [ ] データをカスタマイズする（自己紹介、リンクなど）
- [ ] 本番環境へのデプロイ準備
- [ ] 管理画面の実装へ進む

---

## 🆘 サポート情報

### 関連ドキュメント
- `docs/DATABASE_SETUP.md` - データベースセットアップの詳細手順
- `docs/POSTS_IMPLEMENTATION.md` - 読み物機能の実装詳細
- `.env.local.example` - 環境変数のサンプル

### よくある質問

**Q: .env.localファイルはどこに置く？**
A: プロジェクトルート（package.jsonと同じ階層）

**Q: 環境変数を変更したのに反映されない**
A: 開発サーバーを再起動してください（Ctrl+C → npm run dev）

**Q: Supabaseのテーブルが見つからない**
A: マイグレーションSQLを実行したか確認してください

**Q: データが表示されない**
A: シードデータを投入したか、RLSポリシーが正しいか確認してください

**Q: 記事が0件表示される**
A: シードデータのpostsテーブルにデータが入っているか、statusが'published'になっているか確認してください

---

## ✨ 完了！

すべてのチェック項目が完了したら、UniVerse Canvasの基本機能が動作しています。

次は管理画面の実装や、データのカスタマイズを進めてください。
