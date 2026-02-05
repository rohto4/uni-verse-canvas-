# docs/error-handling.md

## Document Metadata
- **Version**: 1.0.0
- **Last Updated**: 2026-02-04
- **Status**: Confirmed (確定版)
- **Owner**: Senior Fullstack Engineer (DDD Specialist)
- **Project Name**: UniVerse Canvas

---

## 1. エラーハンドリング概要

### 1.1 基本方針
- **ユーザー体験優先**: エラーメッセージは明確で実行可能
- **開発者フレンドリー**: デバッグに必要な情報を適切にログ出力
- **一貫性**: 全層で統一されたエラー処理
- **リトライ戦略**: 一時的なエラーは自動リトライ
- **グレースフルデグラデーション**: 部分的な障害でもサービス継続

### 1.2 エラー処理の層

| 層 | 役割 | 実装場所 |
|----|------|---------|
| **API Layer** | HTTP エラー、バリデーション | `/api/*` routes |
| **Database Layer** | DB接続エラー、クエリエラー | Supabase client |
| **Business Logic Layer** | ビジネスルール違反 | `lib/api/*` |
| **UI Layer** | ユーザー向けエラー表示 | Components |
| **Global Error Boundary** | 予期しないエラーキャッチ | `app/error.tsx` |

---

## 2. エラー分類

### 2.1 HTTPステータスコード別分類

| ステータス | 分類 | 説明 | 対応 |
|----------|------|------|------|
| **400** | バリデーションエラー | リクエスト形式不正 | ユーザーに修正を促す |
| **401** | 認証エラー | 未認証 | ログインページへリダイレクト |
| **403** | 認可エラー | 権限不足 | アクセス拒否メッセージ表示 |
| **404** | リソース未存在 | データが見つからない | 404ページ表示 |
| **409** | 競合エラー | データ競合 | リフレッシュを促す |
| **422** | セマンティックエラー | ビジネスルール違反 | 具体的なエラーメッセージ |
| **429** | Rate Limit超過 | リクエスト過多 | リトライ待機時間を表示 |
| **500** | サーバーエラー | 内部エラー | 汎用エラーメッセージ |
| **502/503** | サービス停止 | 外部サービス障害 | リトライ戦略 |

### 2.2 機能別エラー分類

#### A. ネットワークエラー
```typescript
export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = true
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}
```

**例**:
- タイムアウト
- 接続エラー
- DNS解決失敗

#### B. バリデーションエラー
```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

**例**:
- 必須フィールド未入力
- 形式不正（メールアドレス、URL等）
- 文字数制限超過

#### C. 認証・認可エラー
```typescript
export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'SESSION_EXPIRED'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}
```

**例**:
- セッション期限切れ
- 不正なトークン
- 権限不足

#### D. ビジネスロジックエラー
```typescript
export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}
```

**例**:
- スラッグ重複
- 公開日が過去
- タグ数上限超過

#### E. データベースエラー
```typescript
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError: any,
    public query?: string
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}
```

**例**:
- 接続タイムアウト
- クエリ構文エラー
- 制約違反

---

## 3. エラーコード体系

### 3.1 命名規則

```
[CATEGORY]_[SPECIFIC_ERROR]_[VARIANT?]

例:
- AUTH_INVALID_TOKEN
- VALIDATION_REQUIRED_FIELD
- DB_CONNECTION_TIMEOUT
- BUSINESS_SLUG_DUPLICATE
```

### 3.2 エラーコード一覧

#### 認証・認可 (AUTH_*)
| コード | 説明 | HTTPステータス |
|-------|------|--------------|
| `AUTH_REQUIRED` | 認証が必要 | 401 |
| `AUTH_INVALID_TOKEN` | トークン無効 | 401 |
| `AUTH_SESSION_EXPIRED` | セッション期限切れ | 401 |
| `AUTH_FORBIDDEN` | アクセス権限なし | 403 |
| `AUTH_PROVIDER_ERROR` | OAuth プロバイダエラー | 500 |

#### バリデーション (VALIDATION_*)
| コード | 説明 | HTTPステータス |
|-------|------|--------------|
| `VALIDATION_REQUIRED_FIELD` | 必須フィールド未入力 | 400 |
| `VALIDATION_INVALID_FORMAT` | 形式不正 | 400 |
| `VALIDATION_LENGTH_EXCEEDED` | 文字数超過 | 400 |
| `VALIDATION_INVALID_VALUE` | 不正な値 | 400 |
| `VALIDATION_TYPE_MISMATCH` | 型不一致 | 400 |

#### データベース (DB_*)
| コード | 説明 | HTTPステータス |
|-------|------|--------------|
| `DB_CONNECTION_ERROR` | 接続エラー | 500 |
| `DB_QUERY_ERROR` | クエリエラー | 500 |
| `DB_CONSTRAINT_VIOLATION` | 制約違反 | 409 |
| `DB_TIMEOUT` | タイムアウト | 504 |
| `DB_NOT_FOUND` | レコード未存在 | 404 |

#### ビジネスロジック (BUSINESS_*)
| コード | 説明 | HTTPステータス |
|-------|------|--------------|
| `BUSINESS_SLUG_DUPLICATE` | スラッグ重複 | 409 |
| `BUSINESS_INVALID_STATUS` | 不正なステータス遷移 | 422 |
| `BUSINESS_TAG_LIMIT_EXCEEDED` | タグ数上限超過 | 422 |
| `BUSINESS_PUBLISH_DATE_PAST` | 公開日が過去 | 422 |

#### 外部API (EXTERNAL_*)
| コード | 説明 | HTTPステータス |
|-------|------|--------------|
| `EXTERNAL_QIITA_API_ERROR` | Qiita APIエラー | 502 |
| `EXTERNAL_STORAGE_ERROR` | ストレージエラー | 502 |
| `EXTERNAL_TIMEOUT` | 外部APIタイムアウト | 504 |

#### システム (SYSTEM_*)
| コード | 説明 | HTTPステータス |
|-------|------|--------------|
| `SYSTEM_INTERNAL_ERROR` | 内部エラー | 500 |
| `SYSTEM_RATE_LIMIT_EXCEEDED` | Rate Limit超過 | 429 |
| `SYSTEM_MAINTENANCE` | メンテナンス中 | 503 |

---

## 4. ユーザー向けエラーメッセージ

### 4.1 メッセージ設計原則
1. **具体的**: 何が問題かを明確に
2. **実行可能**: ユーザーが取るべき行動を示す
3. **丁寧**: 攻撃的・技術的でない表現
4. **簡潔**: 1〜2文程度

### 4.2 メッセージマッピング

**ファイル**: `lib/errors/messages.ts`

```typescript
export const ERROR_MESSAGES: Record<string, string> = {
  // 認証・認可
  AUTH_REQUIRED: 'ログインが必要です。ログインページへ移動します。',
  AUTH_INVALID_TOKEN: 'セッションが無効です。再度ログインしてください。',
  AUTH_SESSION_EXPIRED: 'セッションが期限切れです。再度ログインしてください。',
  AUTH_FORBIDDEN: 'この操作を実行する権限がありません。',
  
  // バリデーション
  VALIDATION_REQUIRED_FIELD: '{field}は必須です。',
  VALIDATION_INVALID_FORMAT: '{field}の形式が正しくありません。',
  VALIDATION_LENGTH_EXCEEDED: '{field}は{max}文字以内で入力してください。',
  
  // ビジネスロジック
  BUSINESS_SLUG_DUPLICATE: 'このスラッグは既に使用されています。別のスラッグを指定してください。',
  BUSINESS_TAG_LIMIT_EXCEEDED: 'タグは最大{max}個まで選択できます。',
  BUSINESS_PUBLISH_DATE_PAST: '公開日時は現在以降の日時を指定してください。',
  
  // データベース
  DB_NOT_FOUND: '指定されたデータが見つかりません。',
  DB_CONNECTION_ERROR: 'データベース接続エラーが発生しました。しばらく待ってから再試行してください。',
  
  // 外部API
  EXTERNAL_QIITA_API_ERROR: 'Qiita APIとの通信に失敗しました。後ほど再試行してください。',
  EXTERNAL_STORAGE_ERROR: '画像のアップロードに失敗しました。ファイルサイズを確認してください。',
  
  // システム
  SYSTEM_RATE_LIMIT_EXCEEDED: 'リクエストが多すぎます。{seconds}秒後に再試行してください。',
  SYSTEM_MAINTENANCE: 'システムメンテナンス中です。しばらくお待ちください。',
  SYSTEM_INTERNAL_ERROR: '予期しないエラーが発生しました。管理者に連絡してください。',
}

export function getErrorMessage(
  code: string,
  params?: Record<string, any>
): string {
  let message = ERROR_MESSAGES[code] || ERROR_MESSAGES.SYSTEM_INTERNAL_ERROR
  
  // プレースホルダー置換
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value))
    })
  }
  
  return message
}
```

---

## 5. API層でのエラーハンドリング

### 5.1 統一エラーレスポンス

**型定義**:
```typescript
// types/api.ts
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    timestamp?: string
    requestId?: string
  }
}
```

### 5.2 エラーハンドリングミドルウェア

**ファイル**: `lib/api/errorHandler.ts`

```typescript
import { NextResponse } from 'next/server'

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  // カスタムエラー
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_INVALID_FIELD',
          message: getErrorMessage('VALIDATION_INVALID_FORMAT', { field: error.field }),
          details: { field: error.field, value: error.value },
          timestamp: new Date().toISOString(),
        }
      },
      { status: 400 }
    )
  }
  
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: getErrorMessage(error.code),
          timestamp: new Date().toISOString(),
        }
      },
      { status: error.code === 'UNAUTHENTICATED' ? 401 : 403 }
    )
  }
  
  if (error instanceof BusinessError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: getErrorMessage(error.code, error.context),
          details: error.context,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 422 }
    )
  }
  
  // Supabaseエラー
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any
    
    if (supabaseError.code === 'PGRST116') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DB_NOT_FOUND',
            message: getErrorMessage('DB_NOT_FOUND'),
            timestamp: new Date().toISOString(),
          }
        },
        { status: 404 }
      )
    }
    
    if (supabaseError.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DB_CONSTRAINT_VIOLATION',
            message: 'データの重複が検出されました。',
            timestamp: new Date().toISOString(),
          }
        },
        { status: 409 }
      )
    }
  }
  
  // デフォルトエラー
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'SYSTEM_INTERNAL_ERROR',
        message: getErrorMessage('SYSTEM_INTERNAL_ERROR'),
        timestamp: new Date().toISOString(),
      }
    },
    { status: 500 }
  )
}
```

### 5.3 API Routeでの使用例

```typescript
// app/api/posts/route.ts
import { handleApiError } from '@/lib/api/errorHandler'
import { requireAuth } from '@/lib/api/auth'
import { createPostSchema } from '@/lib/validations/post'

export async function POST(request: Request) {
  try {
    // 認証チェック
    const auth = await requireAuth()
    if (!auth.authorized) return auth.response
    
    // リクエストボディ取得
    const body = await request.json()
    
    // バリデーション
    const validatedData = createPostSchema.parse(body)
    
    // ビジネスロジック
    const supabase = createClient()
    
    // スラッグ重複チェック
    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', validatedData.slug)
      .single()
    
    if (existing) {
      throw new BusinessError(
        'Slug already exists',
        'BUSINESS_SLUG_DUPLICATE'
      )
    }
    
    // 記事作成
    const { data: post, error } = await supabase
      .from('posts')
      .insert(validatedData)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: { post }
    })
    
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## 6. クライアント側エラーハンドリング

### 6.1 APIクライアントラッパー

**ファイル**: `lib/api/client.ts`

```typescript
export class ApiClient {
  private async request<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new ApiError(
          data.error.message,
          data.error.code,
          response.status,
          data.error.details
        )
      }
      
      return data.data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // ネットワークエラー
      throw new NetworkError(
        'ネットワークエラーが発生しました。接続を確認してください。'
      )
    }
  }
  
  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'GET' })
  }
  
  async post<T>(url: string, body: any): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
  
  async put<T>(url: string, body: any): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }
  
  async delete<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
```

### 6.2 Reactコンポーネントでの使用

```typescript
// components/admin/PostEditorPage.tsx
import { useToast } from '@/contexts/ToastContext'
import { apiClient } from '@/lib/api/client'

export function PostEditorPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const handleSave = async (data: CreatePostRequest) => {
    setLoading(true)
    
    try {
      const post = await apiClient.post<Post>('/api/posts', data)
      
      addToast({
        type: 'success',
        message: '記事を保存しました'
      })
      
      router.push(`/admin/posts/${post.id}/saved`)
      
    } catch (error) {
      if (error instanceof ApiError) {
        // エラーコード別処理
        if (error.code === 'BUSINESS_SLUG_DUPLICATE') {
          addToast({
            type: 'error',
            message: error.message,
            duration: 5000
          })
        } else if (error.code === 'AUTH_SESSION_EXPIRED') {
          addToast({
            type: 'warning',
            message: error.message
          })
          router.push('/login')
        } else {
          addToast({
            type: 'error',
            message: error.message
          })
        }
      } else if (error instanceof NetworkError) {
        addToast({
          type: 'error',
          message: 'ネットワークエラーが発生しました'
        })
      } else {
        addToast({
          type: 'error',
          message: '予期しないエラーが発生しました'
        })
      }
    } finally {
      setLoading(false)
    }
  }
  
  return <div>{/* ... */}</div>
}
```

---

## 7. Global Error Boundary

### 7.1 Next.js Error Boundary

**ファイル**: `app/error.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーログ送信
    console.error('Global Error:', error)
    
    // 本番環境ではSentryなどに送信
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error)
    }
  }, [error])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">エラーが発生しました</h1>
        <p className="text-muted-foreground max-w-md">
          申し訳ございません。予期しないエラーが発生しました。
          <br />
          問題が解決しない場合は、管理者に連絡してください。
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>
            再試行
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            ホームへ戻る
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left max-w-2xl mx-auto">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              エラー詳細（開発環境のみ）
            </summary>
            <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
```

### 7.2 404 Not Found

**ファイル**: `app/not-found.tsx`

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">ページが見つかりません</h2>
        <p className="text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Button asChild>
          <Link href="/">ホームへ戻る</Link>
        </Button>
      </div>
    </div>
  )
}
```

---

## 8. ログ出力戦略

### 8.1 ログレベル

| レベル | 用途 | 出力先 |
|-------|------|-------|
| **ERROR** | エラー発生時 | Console + Sentry |
| **WARN** | 警告（処理は継続） | Console |
| **INFO** | 重要な処理の記録 | Console（本番は無効化） |
| **DEBUG** | デバッグ情報 | Console（開発環境のみ） |

### 8.2 ロガー実装

**ファイル**: `lib/logger.ts`

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'development') {
      return true
    }
    
    // 本番環境ではwarn以上のみ
    return ['warn', 'error'].includes(level)
  }
  
  private formatMessage(level: LogLevel, message: string, context?: any) {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
    }
  }
  
  debug(message: string, context?: any) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }
  
  info(message: string, context?: any) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context))
    }
  }
  
  warn(message: string, context?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }
  
  error(message: string, error?: Error, context?: any) {
    if (this.shouldLog('error')) {
      const logData = this.formatMessage('error', message, {
        ...context,
        error: {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        }
      })
      
      console.error(logData)
      
      // 本番環境ではSentryに送信
      if (process.env.NODE_ENV === 'production') {
        // Sentry.captureException(error, { extra: context })
      }
    }
  }
}

export const logger = new Logger()
```

### 8.3 使用例

```typescript
// app/api/posts/route.ts
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    logger.info('Creating new post', { userId: auth.userId })
    
    const post = await createPost(data)
    
    logger.info('Post created successfully', { postId: post.id })
    
    return NextResponse.json({ success: true, data: { post } })
    
  } catch (error) {
    logger.error('Failed to create post', error as Error, {
      userId: auth.userId,
      data,
    })
    
    return handleApiError(error)
  }
}
```

---

## 9. リトライ戦略

### 9.1 リトライ可能なエラー

- ネットワークタイムアウト
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout
- 一時的なDB接続エラー

### 9.2 リトライ実装

**ファイル**: `lib/retry.ts`

```typescript
interface RetryOptions {
  maxRetries: number
  delayMs: number
  backoff: 'linear' | 'exponential'
  retryableErrors?: string[]
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxRetries,
    delayMs,
    backoff,
    retryableErrors = ['NETWORK_ERROR', 'DB_CONNECTION_ERROR']
  } = options
  
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      // リトライ可能なエラーかチェック
      const isRetryable = error instanceof NetworkError ||
        (error instanceof ApiError && retryableErrors.includes(error.code))
      
      if (!isRetryable || attempt === maxRetries) {
        throw error
      }
      
      // 待機時間計算
      const delay = backoff === 'exponential'
        ? delayMs * Math.pow(2, attempt)
        : delayMs * (attempt + 1)
      
      logger.warn(`Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}
```

### 9.3 使用例

```typescript
// lib/api/qiita.ts
export async function fetchQiitaArticles(username: string) {
  return withRetry(
    async () => {
      const response = await fetch(`https://qiita.com/api/v2/users/${username}/items`)
      
      if (!response.ok) {
        throw new NetworkError('Qiita API error', response.status)
      }
      
      return response.json()
    },
    {
      maxRetries: 3,
      delayMs: 1000,
      backoff: 'exponential',
    }
  )
}
```

---

## 10. フロントエンドエラー表示

### 10.1 Toast通知

```typescript
// contexts/ToastContext.tsx
export function useToast() {
  const { addToast } = useContext(ToastContext)
  
  const showError = (message: string, duration?: number) => {
    addToast({ type: 'error', message, duration })
  }
  
  const showSuccess = (message: string) => {
    addToast({ type: 'success', message })
  }
  
  return { showError, showSuccess, addToast }
}
```

### 10.2 インラインエラー

```typescript
// components/ui/input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <div>
      <input
        className={cn(
          'input-base',
          error && 'border-destructive',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}
```

---

## 11. 監視・アラート（将来実装）

### 11.1 エラートラッキング（Sentry）

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  
  beforeSend(event, hint) {
    // 特定のエラーを除外
    if (hint.originalException instanceof ValidationError) {
      return null
    }
    return event
  },
})
```

### 11.2 アラート条件

- エラー発生率が閾値超過（5分間で10件以上）
- 特定のエラーコードが連続発生
- API レスポンスタイム異常

---

## 12. ドキュメント更新履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | 初版作成（エラーハンドリング設計確定版） |

---

## 承認状態

✅ **確定済み** - 本エラーハンドリング設計で開発を進めます。

次のステップ: `docs/testing-strategy.md`（テスト戦略書）の作成
