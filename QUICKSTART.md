# クイックスタートガイド

**対象**: 開発者・AIエージェント
**最終更新**: 2026-02-09

---

## 🤖 AIエージェントの方へ

複数のエージェントによる並列開発が可能です。

**必読ドキュメント**:
- **[AGENT_GUIDE.md](docs/AGENT_GUIDE.md)** - エージェント向け実装ガイド（Lock機構、タスク管理）
- **[docs/lv4/00-overview.md](docs/lv4/00-overview.md)** - 全体進捗・機能別実装状況

**タスク選択**:
1. `.locks/tasks/active-tasks.json` を確認
2. `status: "pending"` かつ `dependencies: []` のタスクを選択
3. Lock取得後、実装開始

---

## 👨‍💻 人間の開発者の方へ

エラーを解消して機能を有効化するための最小手順です。

## 🚀 3ステップで起動

### 1️⃣ 環境変数を設定

プロジェクトルートに `.env.local` ファイルを作成:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

**取得方法**:
Supabase Dashboard → Project Settings → API → Project URL と anon public キーをコピー

---

### 2️⃣ データベースをセットアップ

**Supabase Studio** (https://app.supabase.com) で:

1. **SQL Editor** を開く
2. `supabase/migrations/20260208000000_initial_schema.sql` の内容を貼り付けて **Run**
3. `supabase/seed.sql` の内容を貼り付けて **Run**

---

### 3️⃣ アプリを起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

---

## ✅ 動作確認

- `/posts` - 記事10件表示
- `/works` - プロジェクト6件表示
- `/progress` - 進行中6件表示
- `/about` - 自己紹介表示
- `/links` - リンク表示

---

## ❌ エラーが出る場合

### 「supabaseUrl is required」
→ `.env.local` の環境変数を確認 → 開発サーバー再起動

### データが表示されない
→ Supabase Studio の Table Editor でデータを確認

### その他のエラー
→ `docs/ACTIVATION_CHECKLIST.md` の詳細チェックリストを参照

---

**詳細**: `docs/ACTIVATION_CHECKLIST.md`

---

## 📚 ドキュメント構成

### AIエージェント向け
- **[AGENT_GUIDE.md](docs/AGENT_GUIDE.md)** - 実装ガイド・Lock機構
- **[docs/lv4/](docs/lv4/)** - 機能別実装状況
  - `00-overview.md` - 全体概要
  - `01-posts-feature.md` - 読み物機能
  - `02-projects-feature.md` - 作ったもの機能
  - `06-auth-feature.md` - 認証機能
  - その他

### 設計書
- **[docs/claude.md](docs/claude.md)** - コード生成ルール
- **[docs/default/DDD.md](docs/default/DDD.md)** - ドキュメント駆動開発方針
- **[docs/lv1/](docs/lv1/)** - 要件定義・アーキテクチャ
- **[docs/lv2/](docs/lv2/)** - データスキーマ・API仕様
- **[docs/lv3/](docs/lv3/)** - コンポーネント仕様

---

## 🎯 次のステップ

### 優先度の高いタスク
1. **記事詳細ページ実装** - `docs/lv4/01-posts-feature.md`
2. **認証機能実装** - `docs/lv4/06-auth-feature.md`
3. **記事作成のServer Actions** - `docs/lv4/01-posts-feature.md`

### 並列実行可能なタスク
- 記事詳細ページ（posts）
- 認証機能（auth）
- プロジェクト作成フォーム（projects）

**詳細**: `.locks/tasks/active-tasks.json`
