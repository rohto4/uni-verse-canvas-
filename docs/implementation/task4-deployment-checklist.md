# TASK-4: 本番環境設定チェックリスト

最終更新: 2026-03-01

---

## 1. Vercel 環境変数設定

**場所**: Vercel Dashboard > Project Settings > Environment Variables

以下の環境変数を本番環境に設定してください:

```
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_ID>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SUPABASE_PROJECT_ID=<PROJECT_ID>
```

**確認項目:**
- [ ] Production 環境に上記4つの変数が設定されている
- [ ] Preview 環境にも同じ値が設定されている（オプション）

---

## 2. Supabase Dashboard 設定

### 2.1 Site URL（リダイレクト元）

**場所**: Supabase Dashboard > Authentication > URL Configuration > Site URL

```
https://<本番ドメイン>
```

例: `https://uni-verse-canvas.vercel.app`

**確認項目:**
- [ ] Site URL が本番ドメインに設定されている

### 2.2 Redirect URLs（OAuth コールバック）

**場所**: Supabase Dashboard > Authentication > URL Configuration > Redirect URLs

以下を追加してください:

```
https://<本番ドメイン>/api/auth/callback
```

例: `https://uni-verse-canvas.vercel.app/api/auth/callback`

**確認項目:**
- [ ] 本番ドメインの `/api/auth/callback` が追加されている
- [ ] ローカル開発用の `http://localhost:3000/api/auth/callback` も保持（開発継続時）

---

## 3. Google Cloud Console 設定

**場所**: [Google Cloud Console](https://console.cloud.google.com) > OAuth 2.0 クライアント

### 3.1 クライアント ID の確認

Supabase Dashboard > Authentication > Providers > Google から、
クライアント ID を確認してください。

### 3.2 Google Cloud での登録

Google Cloud Console で OAuth クライアントを編集し、以下を追加:

**承認済みのリダイレクト URI:**
```
https://<本番ドメイン>/api/auth/callback
```

例: `https://uni-verse-canvas.vercel.app/api/auth/callback`

**確認項目:**
- [ ] Google Cloud Console で本番 URL がリダイレクト URI に登録されている
- [ ] ローカル開発用の `http://localhost:3000/api/auth/callback` も保持

---

## 4. 本番環境でのテスト

デプロイ後、本番環境で以下をテストしてください:

### 4.1 Google ログイン フロー

```
1. https://<本番ドメイン>/login にアクセス
2. 「Googleでログイン」ボタンをクリック
3. Google のログイン画面に遷移
4. Google でログイン
5. /admin/dashboard にリダイレクトされることを確認
```

**確認項目:**
- [ ] Google ログインが完了する
- [ ] `/admin/dashboard` にリダイレクトされる
- [ ] 管理画面が表示される

### 4.2 認証ガード テスト

```
1. シークレットウィンドウで本番サイトを開く
2. https://<本番ドメイン>/admin/dashboard にアクセス
3. /login にリダイレクトされることを確認
```

**確認項目:**
- [ ] 未認証ユーザーが `/admin` にアクセスするとリダイレクトされる
- [ ] middleware.ts が正常に動作している

### 4.3 エラーページ テスト

```
1. https://<本番ドメイン>/nonexistent にアクセス
2. 404 ページが表示される（ユーモア付き）
```

**確認項目:**
- [ ] 存在しないページで 404 が表示される
- [ ] エラーページがスタイル適用されている

---

## 5. トラブルシューティング

### Google ログインが失敗する場合

**原因候補:**
- Site URL が本番ドメインに設定されていない
- Redirect URI が Google Cloud / Supabase に登録されていない
- 環境変数が正しく設定されていない

**確認:**
```bash
# Vercel デプロイログで環境変数が読み込まれているか確認
# Supabase Logs で認証エラーを確認
```

### Admin 画面にアクセスできない場合

**原因候補:**
- admins テーブルにユーザーが登録されていない
- middleware.ts が動作していない（Edge Function エラー）

**確認:**
```
1. Supabase Dashboard > SQL Editor で以下を実行:
   SELECT * FROM admins;
   → 自分のユーザー ID が登録されているか確認

2. Vercel > Deployments で最新デプロイのログを確認
```

### CORS / Cookie エラーが出る場合

**確認:**
- Supabase の Site URL が正確に一致しているか
- ブラウザの開発者ツール > Application > Cookies で
  `sb-*` のクッキーが正しく設定されているか

---

## 完了チェック

すべての項目にチェックが入ったら、本番環境でのリリースが可能です。

- [ ] 1. Vercel 環境変数設定
- [ ] 2.1 Supabase Site URL
- [ ] 2.2 Supabase Redirect URLs
- [ ] 3.2 Google Cloud リダイレクト URI
- [ ] 4.1 Google ログイン テスト
- [ ] 4.2 認証ガード テスト
- [ ] 4.3 エラーページ テスト

**本番リリース可能: ☐**
