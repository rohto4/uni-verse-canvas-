# 認証機能 実装状況

Supabase Auth + Google OAuthによる認証機能の実装状況です。

**最終更新**: 2026-02-09
**進捗率**: 0%

---

## 📊 実装状況サマリー

| 機能 | 状況 | ファイル |
|------|------|---------|
| Supabase Auth統合 | ⏳ 未実装 | `src/lib/supabase/auth.ts` |
| ログイン画面 | ⏳ 未実装 | `src/app/(admin)/login/page.tsx` |
| ログアウト機能 | ⏳ 未実装 | - |
| セッション管理 | ⏳ 未実装 | `src/lib/supabase/middleware.ts` |
| RLSポリシー適用 | ⏳ 未実装 | `supabase/migrations/*.sql` |

---

## ⏳ 未実装機能

### 1. Supabase Auth統合

**ファイル**: `src/lib/supabase/auth.ts`（未作成）

#### 実装予定機能
```typescript
// サインイン
export async function signIn(): Promise<User | null>

// サインアウト
export async function signOut(): Promise<void>

// セッション取得
export async function getSession(): Promise<Session | null>

// ユーザー情報取得
export async function getUser(): Promise<User | null>
```

---

### 2. ログイン画面

**ファイル**: `src/app/(admin)/login/page.tsx`（未作成）

#### 実装予定機能
- ⏳ Google OAuthログインボタン
- ⏳ ロゴ・タイトル表示
- ⏳ エラーメッセージ表示
- ⏳ ログイン成功時のリダイレクト（/admin/dashboard）

---

### 3. セッション管理

**ファイル**: `src/lib/supabase/middleware.ts`（未作成）

#### 実装予定機能
- ⏳ セッション検証
- ⏳ 未認証時のリダイレクト（→ /login）
- ⏳ 認証済み時のリダイレクト（/login → /admin/dashboard）

---

### 4. RLSポリシー適用

**ファイル**: `supabase/migrations/*.sql`

#### 実装予定機能
```sql
-- 管理者全権限ポリシー
CREATE POLICY "管理者全権限" ON posts FOR ALL
USING (auth.uid() = '管理者UUID');

-- 一般ユーザー閲覧ポリシー
CREATE POLICY "一般ユーザー閲覧" ON posts FOR SELECT
USING (
  status = 'published' OR
  (status = 'scheduled' AND published_at <= NOW())
);
```

---

## 🎯 次のステップ

### 優先度: 高 🔥

#### 認証機能実装（2-3日）

**実装順序**:
1. Supabase Auth統合
2. ログイン画面作成
3. セッション管理（Middleware）
4. RLSポリシー適用
5. 管理画面への認証壁設置

---

## 📝 実装例

### ログイン画面

```typescript
// src/app/(admin)/login/page.tsx
'use client'

import { signIn } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const handleSignIn = async () => {
    await signIn()
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-3xl font-bold text-center">
          UniVerse Canvas
        </h1>
        <Button onClick={handleSignIn} size="lg" className="w-full">
          Googleでログイン
        </Button>
      </div>
    </div>
  )
}
```

---

## 🔗 関連ドキュメント

- [技術スタック](../lv1/tech-stack.md) - Supabase Auth
- [アーキテクチャ](../lv1/architecture_v2.md) - 認証設計
- [全体概要](./00-overview.md)

---

**最終更新**: 2026-02-09
