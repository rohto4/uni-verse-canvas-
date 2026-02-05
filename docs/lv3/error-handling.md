# Error Handling (Claude Reference)

## 1. エラー分類

| 種類 | クラス | HTTPステータス |
|-----|-------|--------------|
| Network | NetworkError | 502/503/504 |
| Validation | ValidationError | 400 |
| Auth | AuthError | 401/403 |
| Business | BusinessError | 409/422 |
| Database | DatabaseError | 404/500 |

## 2. エラーコード体系

### AUTH_*
- `AUTH_REQUIRED` (401): 認証が必要
- `AUTH_INVALID_TOKEN` (401): トークン無効
- `AUTH_SESSION_EXPIRED` (401): セッション期限切れ
- `AUTH_FORBIDDEN` (403): 権限なし

### VALIDATION_*
- `VALIDATION_REQUIRED_FIELD` (400): 必須フィールド未入力
- `VALIDATION_INVALID_FORMAT` (400): 形式不正
- `VALIDATION_LENGTH_EXCEEDED` (400): 文字数超過

### DB_*
- `DB_NOT_FOUND` (404): レコード未存在
- `DB_CONSTRAINT_VIOLATION` (409): 制約違反
- `DB_CONNECTION_ERROR` (500): 接続エラー

### BUSINESS_*
- `BUSINESS_SLUG_DUPLICATE` (409): スラッグ重複
- `BUSINESS_INVALID_STATUS` (422): 不正ステータス遷移
- `BUSINESS_TAG_LIMIT_EXCEEDED` (422): タグ数上限超過

### EXTERNAL_*
- `EXTERNAL_QIITA_API_ERROR` (502): Qiita APIエラー
- `EXTERNAL_STORAGE_ERROR` (502): ストレージエラー

### SYSTEM_*
- `SYSTEM_RATE_LIMIT_EXCEEDED` (429): Rate Limit超過
- `SYSTEM_INTERNAL_ERROR` (500): 内部エラー

## 3. API レスポンス形式
```typescript
// 成功
{ success: true, data: T }

// エラー
{ success: false, error: { code: string, message: string, details?: any, timestamp: string } }
```

## 4. API エラーハンドラ
```typescript
// lib/api/errorHandler.ts
function handleApiError(error: unknown): NextResponse {
  // ValidationError → 400
  // AuthError → 401/403
  // BusinessError → 422
  // Supabase PGRST116 → 404
  // Supabase 23505 → 409
  // default → 500
}
```

## 5. クライアントAPIクライアント
```typescript
// lib/api/client.ts
class ApiClient {
  async request<T>(url, options): Promise<T>
  // !response.ok → ApiError throw
  // catch → NetworkError throw
}
```

## 6. Global Error Boundary
- `app/error.tsx`: 予期しないエラー表示 + 再試行ボタン
- `app/not-found.tsx`: 404ページ

## 7. ログ戦略
- ERROR: Console + Sentry(本番)
- WARN: Console
- INFO/DEBUG: 開発環境のみ

## 8. リトライ戦略
```typescript
// lib/retry.ts
async function withRetry<T>(fn, options: { maxRetries: 3, delayMs: 1000, backoff: 'exponential' })
// 対象: NetworkError, DB_CONNECTION_ERROR
```

## 9. ユーザーメッセージ
- 具体的 + 実行可能 + 丁寧 + 簡潔
- `lib/errors/messages.ts` でコード→メッセージマッピング
- プレースホルダー対応: `{field}`, `{max}`, `{seconds}`
