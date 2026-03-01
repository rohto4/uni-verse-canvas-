# 認証機能 実装状況

Supabase Auth + Google OAuthによる認証機能の実装状況です。

**最終更新**: 2026-03-01
**進捗率**: 100%

---

## 📊 実装状況サマリー

| 機能 | 状況 | ファイル |
|------|------|---------|
| Supabase Auth統合 | ✅ 完了 | `src/lib/supabase/auth.client.ts`, `src/lib/supabase/auth.server.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts` |
| ログイン画面 | ✅ 完了 | `src/app/login/page.tsx` |
| ログアウト機能 | ✅ 完了 | `src/components/layout/AdminSidebar.tsx` |
| セッション管理 | ✅ 完了 | `src/proxy.ts`, `src/app/api/auth/callback/route.ts` |
| RLSポリシー適用 | ✅ 完了 | `supabase/migrations/20260215_add_rls_policies.sql` |
| Server Action 認証ガード | ✅ 完了 | `src/lib/supabase/auth.server.ts` (`requireAdmin`), 全 write actions |

---

## ✅ 実装完了機能

### 1. Supabase Auth統合 (SSR対応)

- ✅ **`@supabase/ssr`の導入**: Next.js App Routerでのクッキーベースの認証に対応。
- ✅ **Server/Client Client**: `createServerClient` (async) と `createBrowserClient` を実装。
- ✅ **Auth Helper**: client/server分離。
  - Client: `signInWithGoogle`, `signOut` (`src/lib/supabase/auth.client.ts`)
  - Server: `getSessionServer`, `getUserServer`, `isAdminByUid` (`src/lib/supabase/auth.server.ts`)
  - `next/headers` を使う処理は server 側に限定し、Client Component からは import しない。

### 2. ログイン画面

**ファイル**: `src/app/login/page.tsx`

- ✅ Google OAuthログインボタン。
- ✅ ブルーアーカイブ風の清涼感あるデザイン。
- ✅ ログイン状態の管理、エラーハンドリング（トースト通知）。

### 3. ログアウト機能

**ファイル**: `src/components/layout/AdminSidebar.tsx`

- ✅ サイドバー最下部にログアウトボタンを配置。
- ✅ `signOut`アクションを呼び出し、確認ダイアログを表示。

### 4. セッション管理・保護

- ✅ **Proxy (`src/proxy.ts`)**: 
    - セッションの自動リフレッシュ（クッキー同期）。
    - `/admin` 配下の全ルートを認証必須に。
    - ログイン済みユーザーが `/login` にアクセスした際のリダイレクト。
- ✅ **Auth Callback (`src/app/api/auth/callback/route.ts`)**: 
    - OAuth後の `code` をセッションに交換し、クッキーに保存。

### 5. RLSポリシー適用

**ファイル**: `supabase/migrations/20260215_add_rls_policies.sql`

- ✅ `admins`テーブルに基づいた権限管理。
- ✅ 一般ユーザーは「公開済み」記事のみ閲覧可能。
- ✅ 管理者は全テーブルのCRUDが可能。

### 6. Server Action 認証ガード (2026-03-01追加)

**ファイル**: `src/lib/supabase/auth.server.ts`

- ✅ `requireAdmin()` ヘルパー関数を追加。`getUserServer()` + `isAdminByUid()` を組み合わせた再利用可能なガード。
- ✅ 全書き込み Server Action の先頭に `if (!(await requireAdmin())) return ...` を追加。
  - `posts.ts`: `createPost`, `updatePost`, `deletePost`
  - `projects.ts`: `createProject`, `updateProject`, `deleteProject`
  - `in-progress.ts`: `createInProgress`, `updateInProgress`, `deleteInProgress`
  - `tags.ts`: `createTag`, `updateTag`, `deleteTag`
  - `storage.ts`: `uploadFile`
  - `pages.ts`: `upsertPage`
- ✅ 書き込み操作はすべて `createAdminClient()`（サービスロールキー）を使用し RLS をバイパス。

### 7. ブラウザクライアント遅延初期化 (2026-03-01追加)

**ファイル**: `src/lib/supabase/client.ts`, `src/lib/supabase/auth.client.ts`

- ✅ モジュールレベルの `createBrowserClient()` 呼び出しを遅延シングルトン `getSupabaseClient()` に変更。
- ✅ Vercel ビルド時のプリレンダリングで env 変数未定義エラーが発生していた問題を修正。

---

## 🎯 次のステップ

認証機能の基盤が完成し、本番デプロイ済み。今後はテスト/SEO/監視を進めます。

---

## 🔗 関連ドキュメント

- [プロジェクト設定](../PROJECT.md) - 技術スタック
- [システムアーキテクチャ](../architecture/system-architecture.md) - 認証設計
- [全体概要](./00-overview.md)
