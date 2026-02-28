# セキュリティ監査レポート

**監査実施日**: 2026-03-01
**監査対象**: UniVerse Canvas - Posts・Works 動的ページのセキュリティ分析
**監査員**: Claude Code Security Analyzer

---

## 脆弱性サマリー

| 重要度 | 件数 | 脆弱性タイプ |
|--------|------|----------|
| Critical | 1 | SQL Injection 相当の検索クエリ問題 |
| High | 2 | XSS 関連（直接 DOM 注入は無いが関連） |
| Medium | 2 | URL バリデーション・例外処理の不足 |
| Low | 3 | ベストプラクティス未達成 |

**全体リスク評価**: **Medium** （適切に修正すれば容易に改善可能）

---

## 脆弱性詳細

### 1. SQL Injection 相当の検索クエリ生成問題

**脆弱性タイプ**: SQL Injection 相当（Supabase PostgREST API）
**ファイル**: `/G/devwork/uni-verse-canvas/src/lib/actions/posts.ts`
**行番号**: 205-206
**重要度**: **Critical**

#### 現在のコード

```typescript
// Line 203-207
if (search) {
  // Limit search length to prevent performance issues
  const searchTerm = search.slice(0, 20)
  query = query.or(`title.ilike.*${searchTerm}*,excerpt.ilike.*${searchTerm}*,content::text.ilike.*${searchTerm}*`)
}
```

#### 問題点

1. **リアルタイム SQL 構築**: `searchTerm` が直接 PostgREST フィルタ文字列に埋め込まれている
2. **ワイルドカード文字のエスケープなし**: `*` は `ilike` 演算子のワイルドカード
3. **特殊文字によるフィルタロジック崩壊**:
   - `%` や `_` などを含むと意図しない結果が返る
   - `*` 文字を含むと検索クエリが破損する可能性

#### 攻撃シナリオ

```
URL: /posts?search=test*malicious,excerpt.ilike.*)or(true,content::text.ilike.*(
```

攻撃者が特殊文字を含む検索キーワードを入力した場合、PostgREST フィルタ構文が破損し、予期しないクエリ動作が発生します。

#### リスク評価

- **Supabase の利点**: サーバー側で RLS（Row-Level Security）が有効であれば権限外のデータアクセスは防止される
- **実際のリスク**: パフォーマンス攻撃や予期しない検索結果が返される可能性

#### 修正方法の提案

```typescript
if (search) {
  // Limit search length to prevent performance issues
  const searchTerm = search.slice(0, 20)

  // Special characters that have meaning in ILIKE should be escaped
  const escapedTerm = searchTerm
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/%/g, '\\%')    // Escape %
    .replace(/_/g, '\\_')    // Escape _

  // Use proper PostgREST filtering with escaped content
  query = query.or(
    `title.ilike.%${escapedTerm}%,` +
    `excerpt.ilike.%${escapedTerm}%,` +
    `content::text.ilike.%${escapedTerm}%`
  )
}
```

**または、より安全な方法：**

Supabase Client SDK が提供するパラメータ化クエリ機構を使用：

```typescript
// Supabase の RPC（Remote Procedure Call）を活用
// または、フロントエンドで単純なキーワード分割を行わない
```

---

### 2. XSS（検索クエリ表示）

**脆弱性タイプ**: Stored/Reflected XSS 準備段階
**ファイル**: `/G/devwork/uni-verse-canvas/src/components/posts/PostsFilter.tsx`
**行番号**: 144
**重要度**: **High**

#### 現在のコード

```typescript
// Line 142-146
{searchQuery && (
  <Badge variant="default">
    検索: {searchQuery}
  </Badge>
)}
```

#### 問題点

1. **URL パラメータが React コンポーネントに直接表示される**
   - `searchQuery = searchParams.get('search')` (Line 22)
   - React 自動エスケープに依存しているが、コンテキスト依存

2. **危険なシナリオ**:
   - 現在の実装では React が自動的に HTML エンティティにエスケープするため、実質的な XSS リスクは低い
   - ただし、将来的にこのコンポーネントが拡張される際の脆弱性源になる可能性

#### リスク評価

- **現在**: React の自動エスケープにより **保護されている**
- **将来のリスク**: コンポーネント拡張時に属性値に埋め込まれたりする場合に脆弱化

#### 修正方法の提案

```typescript
// 現在の実装は安全ですが、明示的にバリデーション/サニタイズを追加

import DOMPurify from 'dompurify'

{searchQuery && (
  <Badge variant="default">
    検索: {DOMPurify.sanitize(searchQuery)}
  </Badge>
)}
```

**または、入力値のホワイトリスト管理:**

```typescript
// 検索キーワードの長さと文字種を制限
const isValidSearchQuery = (query: string): boolean => {
  return /^[a-zA-Z0-9\s\-ぁ-ん一-龥々〆ゝゞ\p{Hiragana}\p{Katakana}ー、。!！?？]*$/u.test(query) &&
         query.length <= 50
}

if (isValidSearchQuery(searchQuery)) {
  return <Badge>検索: {searchQuery}</Badge>
}
```

---

### 3. URL パラメータ値の検証不足（Dynamic Routes）

**脆弱性タイプ**: URL Traversal / Invalid Route Access
**ファイル**:
- `/G/devwork/uni-verse-canvas/src/app/(public)/posts/[slug]/page.tsx` (Line 55)
- `/G/devwork/uni-verse-canvas/src/app/(public)/works/[slug]/page.tsx` (Line 46)

**行番号**: 55, 46
**重要度**: **Medium**

#### 現在のコード

```typescript
// posts/[slug]/page.tsx - Line 53-55
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)
```

```typescript
// works/[slug]/page.tsx - Line 45-46
const { slug } = await params
const project = await getProjectBySlug(slug)
```

#### 問題点

1. **Slug 形式の検証がない**
   - `/posts/[slug]` は任意の文字列を受け付ける
   - `slug` が `../../../etc/passwd` のようなパス走査文字列の場合、データベースクエリは失敗するが予測不可

2. **存在しないリソースへのアクセス**
   - 404 が返される（`notFound()`）ため直接的な脆弱性ではない
   - ただし、スラッグの正規性チェックがないため、ログ分析が困難

#### リスク評価

- **現在の実装**: Supabase の `eq('slug', slug)` クエリ結果が null なら 404 返却するため、**実質的な脆弱性は低い**
- **潜在的リスク**: ログ汚染、キャッシング戦略への影響

#### 修正方法の提案

```typescript
// utility function to validate slug format
function isValidSlug(slug: string): boolean {
  // Allow alphanumeric, hyphens, and underscores only
  // Slug should be 3-100 characters
  return /^[a-z0-9_-]{3,100}$/i.test(slug)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params

  // Validate slug format first
  if (!isValidSlug(resolvedParams.slug)) {
    return {
      title: 'Page Not Found',
    }
  }

  const post = await getPostBySlug(resolvedParams.slug)
  if (!post) {
    return { title: 'Page Not Found' }
  }

  // ... rest of metadata generation
}
```

---

### 4. Share URL 生成時の検証不足

**脆弱性タイプ**: Open Redirect / URL Injection
**ファイル**: `/G/devwork/uni-verse-canvas/src/components/posts/ShareButtons.tsx`
**行番号**: 27, 38-43
**重要度**: **High**

#### 現在のコード

```typescript
// Line 27-29
const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
const encodedUrl = encodeURIComponent(shareUrl)
const encodedTitle = encodeURIComponent(title)

// Line 38-43
const shareOnTwitter = () => {
  window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank')
}

const shareOnFacebook = () => {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
}
```

#### 問題点

1. **`url` パラメータがそのまま外部 URL に埋め込まれる**
   - `url={/posts/${post.slug}}` は相対パスだが、props を外部から注入された場合のリスク
   - プロップドリリングで信頼できないデータが流れる可能性

2. **JavaScript Protocol Injection の可能性**
   ```
   url="javascript:alert('XSS')"  // 親コンポーネントから注入された場合
   ```

3. **外部サービスへのリダイレクト確認がない**
   - Twitter / Facebook のシェアエンドポイントへの URL 形式検証なし

#### リスク評価

- **現在**: コンポーネント使用時に正規表現でチェック（`/posts/${post.slug}`）されているため、**実質的リスク低い**
- **潜在的リスク**: 共通化されたコンポーネントのため、将来的な誤用

#### 修正方法の提案

```typescript
interface ShareButtonsProps {
  url: string
  title: string
}

// URL validation function
function isValidShareUrl(url: string): boolean {
  try {
    // Ensure relative paths start with /
    if (url.startsWith('/')) {
      return /^\/[a-z0-9_/-]+$/i.test(url)
    }
    // Ensure absolute URLs are from same origin only
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    return urlObj.origin === (typeof window !== 'undefined' ? window.location.origin : '')
  } catch {
    return false
  }
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  // Validate input
  if (!isValidShareUrl(url)) {
    console.error('Invalid share URL:', url)
    return null
  }

  // ... rest of component
}
```

---

### 5. View Count API の認証・レート制限不足

**脆弱性タイプ**: CSRF / Brute Force / Rate Limiting 欠如
**ファイル**:
- `/G/devwork/uni-verse-canvas/src/app/api/posts/track-view/route.ts`
- `/G/devwork/uni-verse-canvas/src/components/posts/PostViewCount.tsx`

**行番号**:
- route.ts: 8-45
- PostViewCount.tsx: 33-39

**重要度**: **Medium**

#### 現在のコード

```typescript
// route.ts - Line 8-45
export async function POST(request: Request) {
  let payload: TrackViewPayload

  try {
    payload = (await request.json()) as TrackViewPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const postId = payload.postId
  if (!postId || typeof postId !== 'string') {
    return NextResponse.json({ success: false, error: 'postId is required' }, { status: 400 })
  }

  const supabase = await createServerClient()

  const { data: currentPost, error: fetchError } = await supabase
    .from('posts')
    .select('view_count')
    .eq('id', postId)
    .single()

  if (fetchError || !currentPost) {
    return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
  }

  const nextCount = (currentPost.view_count || 0) + 1
  const { error: updateError } = await supabase
    .from('posts')
    .update({ view_count: nextCount })
    .eq('id', postId)

  if (updateError) {
    return NextResponse.json({ success: false, error: 'Failed to update view count' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

```typescript
// PostViewCount.tsx - Line 33-39
fetch('/api/posts/track-view', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ postId }),
}).catch(() => {})
```

#### 問題点

1. **CSRF 保護なし**
   - POST エンドポイントに対する Origin/Referer チェックがない
   - トークンベースの CSRF 防止機構がない

2. **レート制限なし**
   - 同じクライアントが短時間に大量の `/api/posts/track-view` リクエストを送信可能
   - view_count が恣意的に操作される可能性

3. **Cookie/SameSite の明示的な指定**
   - PostViewCount.tsx で `SameSite=Lax` を使用しているが、API 呼び出し元での CSRF トークン確認がない

4. **クライアント側の Cookie チェックの回避**
   - Cookie の確認は JavaScript で簡単に回避可能
   - サーバー側でも同じ PostId に対する重複呼び出しチェックがない

#### リスク評価

- **数値改ざん**: 高リスク（`view_count` が正確性を失う）
- **DDoS**: 中リスク（単一エンドポイントへの集中攻撃ベクトル）

#### 修正方法の提案

```typescript
// route.ts - CSRF & Rate Limiting 対応版

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiter を初期化（環境変数が必要）
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 1時間に5回まで
})

export async function POST(request: Request) {
  // 1. Origin/Referer チェック
  const origin = request.headers.get('origin') || request.headers.get('referer')
  const allowedOrigins = [
    'https://uni-verse-canvas.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL,
  ]

  if (!origin || !allowedOrigins.some(allowed => origin.includes(allowed))) {
    return NextResponse.json(
      { success: false, error: 'CORS policy violation' },
      { status: 403 }
    )
  }

  // 2. クライアント識別子の取得（IP + User-Agent）
  const clientIp = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const clientId = `${clientIp}:${userAgent}`

  // 3. Rate limiting チェック
  try {
    const { success } = await ratelimit.limit(clientId)
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Rate limiting 失敗時もリクエストを許可するが、ログに記録
  }

  let payload: TrackViewPayload

  try {
    payload = (await request.json()) as TrackViewPayload
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const postId = payload.postId
  if (!postId || typeof postId !== 'string' || !/^[a-f0-9-]+$/i.test(postId)) {
    return NextResponse.json({ success: false, error: 'postId is invalid' }, { status: 400 })
  }

  // ... 以下、既存ロジック
}
```

---

### 6. 検索パラメータのページング値検証不足

**脆弱性タイプ**: DoS / Integer Overflow
**ファイル**: `/G/devwork/uni-verse-canvas/src/app/(public)/posts/page.tsx`
**行番号**: 49
**重要度**: **Low**

#### 現在のコード

```typescript
// Line 49
const page = Number(searchParams.page) || 1
```

#### 問題点

1. **ページ数の上限チェックなし**
   - 攻撃者が `?page=999999999999` などを指定した場合、大きなオフセットでデータベースクエリが実行される
   - パフォーマンス攻撃（DB への負荷）

2. **負の値チェックなし**
   - `?page=-100` などでも計算により予期しない結果

#### 修正方法の提案

```typescript
// Line 49-52
const pageNum = Number(searchParams.page) || 1
const page = Math.max(1, Math.min(pageNum, 10000)) // 最大 10000 ページまで

// または、より厳密に:
const page = (() => {
  const p = Number(searchParams.page)
  if (!Number.isInteger(p) || p < 1) return 1
  if (p > 10000) return 10000
  return p
})()
```

---

### 7. ソート順序値の検証

**脆弱性タイプ**: DoS / Enum Bypass
**ファイル**: `/G/devwork/uni-verse-canvas/src/app/(public)/posts/page.tsx`
**行番号**: 52
**重要度**: **Low**

#### 現在のコード

```typescript
// Line 52
const sort = searchParams.sort || 'latest'
```

#### 問題点

1. **型定義は厳密だが、実行時には検証されていない**
   - TypeScript の型定義: `sort?: 'latest' | 'oldest' | 'popular'`
   - しかし、JavaScript は型情報を持たない
   - `/posts?sort=malicious` で予期しない値が渡される可能性

#### 修正方法の提案

```typescript
// Line 52-53
const validSorts = ['latest', 'oldest', 'popular']
const sort = (validSorts.includes(searchParams.sort) ? searchParams.sort : 'latest') as 'latest' | 'oldest' | 'popular'
```

---

### 8. リソースの所有権確認（認証関連）

**脆弱性タイプ**: Broken Access Control
**ファイル**: `/G/devwork/uni-verse-canvas/src/lib/supabase/auth.server.ts`
**行番号**: 30-66
**重要度**: **Medium**

#### 現在のコード

```typescript
// Line 30-66
export async function isAdminByUid(uid: string): Promise<boolean> {
  if (!uid) return false

  const adminSupabase = createAdminClient()

  // ... 初回ブートストラップロジック
  // ... admin テーブルチェック
}
```

#### 問題点

1. **初回アクセス時の自動 Admin 昇格**
   - `count === 0` の場合、呼び出したユーザーが自動的に admin に昇格される
   - これは意図的な設計かもしれないが、セキュリティレビューが必要

2. **admin テーブルが空の状態で最初のリクエスト**
   - 攻撃者が最初にシステムにアクセスして Admin になる可能性

#### リスク評価

- **プロダクション環境**: リスク度依存
  - Supabase の RLS でテーブルアクセスが制限されていれば、事実上この関数の呼び出しは limit される
  - ただし、初期セットアップ時の慎重な設定が必須

#### 修正方法の提案

```typescript
/**
 * Admin bootstrap: 初回のみ許可される管理者を明示的に指定
 */
export async function isAdminByUid(
  uid: string,
  allowBootstrap: boolean = false
): Promise<boolean> {
  if (!uid) return false

  const adminSupabase = createAdminClient()
  const { count, error: countError } = await adminSupabase
    .from('admins')
    .select('user_id', { count: 'exact', head: true })

  if (!countError && (count ?? 0) === 0) {
    if (!allowBootstrap) {
      console.warn('Admin table is empty and bootstrap is not allowed. Use isAdminByUid(uid, true)')
      return false
    }

    // Bootstrap は環境変数で指定した UID のみ
    const bootstrapUid = process.env.ADMIN_BOOTSTRAP_UID
    if (!bootstrapUid || uid !== bootstrapUid) {
      console.warn('Bootstrap request from non-authorized UID:', uid)
      return false
    }

    const { error: insertError } = await adminSupabase
      .from('admins')
      .insert({ user_id: uid })

    if (insertError) {
      console.error('Error bootstrapping admin user:', insertError)
      return false
    }

    return true
  }

  // ... 通常の admin チェック
}
```

---

## セキュリティベストプラクティス: 現在の強化点

### 利点

1. ✅ **Supabase RLS（Row-Level Security）**: 権限ベースのアクセス制御が実装されている
2. ✅ **Server Components**: 機密情報（APIキー）がクライアントに露出しない
3. ✅ **React 自動エスケープ**: XSS リスクを低減
4. ✅ **Next.js Dynamic Routes**: 404 ハンドリングが自動化されている
5. ✅ **Type Safety**: TypeScript で基本的な型チェックが行われている

### 改善が必要な領域

1. ❌ **入力値バリデーション**: URL パラメータ、検索クエリのサニタイズが不十分
2. ❌ **API レート制限**: 認証なしエンドポイントにレート制限がない
3. ❌ **CSRF 保護**: POST エンドポイントに明示的なトークンチェックがない
4. ❌ **SQL インジェクション対策**: 文字列結合によるクエリ生成がある
5. ❌ **ロギング・監視**: セキュリティイベントの記録機構が不明確

---

## 推奨される優先対応リスト

### 🔴 Priority 1 (すぐに対応)

1. **検索クエリの SQL Injection 対策** (posts.ts Line 206)
   - 特殊文字のエスケープ、またはパラメータ化クエリの採用
   - 推定工数: 1-2時間

2. **View Count API の CSRF・Rate Limiting** (track-view/route.ts)
   - Origin チェック、レート制限機構の追加
   - 推定工数: 2-3時間

### 🟠 Priority 2 (1-2週間以内)

3. **URL パラメータの入力値検証** (全動的ページ)
   - Slug フォーマット、ページ数、ソート順序の厳密なチェック
   - 推定工数: 2-3時間

4. **ShareButtons コンポーネントの URL バリデーション**
   - URL の正規性確認、JavaScript protocol 排除
   - 推定工数: 1時間

### 🟡 Priority 3 (セキュリティ監査後)

5. **Admin Bootstrap 機構の強化** (auth.server.ts)
   - 環境変数による明示的な UID 指定
   - 推定工数: 1時間

6. **ロギング・監視機構の実装**
   - セキュリティイベント（ブルートフォース、不正アクセス）の記録
   - 推定工数: 4-6時間

---

## 実装チェックリスト

- [ ] 検索クエリの特殊文字エスケープ実装
- [ ] View Count API に CORS/CSRF チェック追加
- [ ] Rate Limiting ライブラリの統合（Upstash など）
- [ ] URL パラメータの入力値バリデーション関数作成
- [ ] ShareButtons の URL 検証追加
- [ ] Admin Bootstrap の環境変数化
- [ ] セキュリティテストの自動化（OWASPトップ10）
- [ ] 本番環境でのレート制限・監視設定確認
- [ ] Content Security Policy (CSP) ヘッダーの追加
- [ ] Supabase RLS ルールの監査

---

## 参考資料

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Supabase セキュリティドキュメント](https://supabase.com/docs/guides/auth)
- [Next.js セキュリティベストプラクティス](https://nextjs.org/docs/pages/building-your-application/configuring/content-security-policy)
- [PostgREST フィルタ構文](https://postgrest.org/en/v11/references/api/overview.html#operators)

---

**監査員署名**: Claude Code Security Analyzer
**監査完了日**: 2026-03-01
**次回監査推奨日**: 2026-06-01（修正完了後の再監査）
