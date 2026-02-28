# TASK-7: RLS ポリシー検証

最終更新: 2026-03-01

---

## 概要

Supabase の Row-Level Security (RLS) ポリシーが正しく機能しているか確認します。

**目的:**
- 公開ユーザーが公開済み記事のみ閲覧可能
- 管理者が全データへのアクセス権を持つ
- 権限のないアクセスは拒否される

---

## 確認手順

### 1. RLS ポリシーの存在確認

**Supabase Dashboard > SQL Editor で実行:**

```sql
-- RLS ポリシーの一覧表示
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**期待される結果:**
```
posts テーブル:
- Enable RLS
- Anonymous SELECT (published のみ)
- Authenticated SELECT (published のみ)
- Admin CRUD (全て)

projects テーブル:
- Enable RLS
- Anonymous SELECT (registered = true のみ)
- Admin CRUD (全て)

admins テーブル:
- Enable RLS
- Admin SELECT/INSERT
- Users own admin status SELECT

その他テーブル:
- Admin CRUD のみ
```

**確認項目:**
- [ ] posts テーブルに RLS ポリシーが有効
- [ ] projects テーブルに RLS ポリシーが有効
- [ ] admins テーブルに RLS ポリシーが有効

---

### 2. 権限テスト（SQL Editor）

#### 2.1 公開ユーザー (Anonymous) → Posts

```sql
-- ★ Supabase Dashboard で "Use Service Role" をOFFにして実行
-- (Anonymous アクセスをシミュレート)

SELECT id, title, status
FROM posts
LIMIT 5;
```

**期待**: published のレコードのみ取得

---

#### 2.2 管理者 (Service Role) → Posts

```sql
-- ★ Supabase Dashboard で "Use Service Role" をONにして実行

SELECT id, title, status
FROM posts
LIMIT 5;
```

**期待**: すべてのレコード（status = 'draft' も含む）が取得できる

---

#### 2.3 公開ユーザー (Anonymous) → Projects

```sql
-- ★ "Use Service Role" をOFFにして実行

SELECT id, name, registered
FROM projects
LIMIT 5;
```

**期待**: `registered = true` のレコードのみ取得

---

### 3. アプリケーション レベルでのテスト

#### 3.1 未認証ユーザー → 公開ページ

```
1. シークレットウィンドウで本番サイトを開く
2. https://<本番ドメイン>/posts にアクセス
3. 公開済み記事一覧が表示される
```

**確認項目:**
- [ ] 公開ページで記事一覧が表示される
- [ ] 下書き記事は表示されない

#### 3.2 未認証ユーザー → 管理ページ

```
1. シークレットウィンドウで本番サイトを開く
2. https://<本番ドメイン>/admin/dashboard にアクセス
3. /login にリダイレクトされる
```

**確認項目:**
- [ ] 未認証ユーザーが管理ページにアクセスできない

#### 3.3 認証済みユーザー（管理者） → 管理ページ

```
1. 本番環境で Google ログイン
2. https://<本番ドメイン>/admin/posts にアクセス
3. すべての記事（draft も含む）が表示される
```

**確認項目:**
- [ ] 管理者が全記事にアクセスできる

---

## トラブルシューティング

### RLS ポリシーが見つからない場合

**原因**: マイグレーションが本番 DB に適用されていない

**対応:**
```
1. Supabase Dashboard > SQL Editor で migration ファイルの内容を実行
   - supabase/migrations/20260215_add_rls_policies.sql
   - supabase/migrations/20260219_add_rls_link_tables.sql
```

### 公開ユーザーが下書き記事を見られる場合

**原因**: RLS ポリシーが正しく設定されていない

**確認:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'posts';
```

期待: `status = 'published'` のフィルター条件がポリシーに含まれている

### 管理者が記事を編集できない場合

**原因**: INSERT / UPDATE / DELETE ポリシーが不足している

**確認:**
```sql
SELECT cmd FROM pg_policies WHERE tablename = 'posts' AND roles::text ~ 'service_role';
```

期待: `SELECT`, `INSERT`, `UPDATE`, `DELETE` すべてが存在

---

## 完了チェック

すべての確認項目にチェックが入ったら、RLS が正しく機能しています。

- [ ] 1. RLS ポリシーの存在確認
- [ ] 2.1 Anonymous → Posts テスト
- [ ] 2.2 Service Role → Posts テスト
- [ ] 2.3 Anonymous → Projects テスト
- [ ] 3.1 未認証ユーザー → 公開ページ
- [ ] 3.2 未認証ユーザー → 管理ページ（リダイレクト）
- [ ] 3.3 認証済みユーザー → 管理ページ

**RLS 検証完了: ☐**

---

## 参考

- [Supabase RLS 公式ドキュメント](https://supabase.com/docs/guides/auth/row-level-security)
- `supabase/migrations/20260215_add_rls_policies.sql`
- `supabase/migrations/20260219_add_rls_link_tables.sql`
