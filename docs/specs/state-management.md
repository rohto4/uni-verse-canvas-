# State Management

## 1. 現状（実装済み）

- UI状態はコンポーネント内`useState`中心
- Server StateはServer Components + Server Actionsで取得
- カスタムHooks/Contextは未実装

## 2. 基本方針（目標）
- ローカル優先: コンポーネント固有はuseState
- Context最小化: 本当に必要な場合のみ
- Server State分離: Supabase + ISRで管理

## 3. 状態分類

| 分類 | 管理方法 | 例 |
|-----|---------|---|
| ローカルUI | useState | モーダル開閉、フォーム入力 |
| グローバルUI | React Context | ダークモード、サイドバー |
| Server State | Supabase + ISR | 記事、プロジェクト |
| 認証 | Supabase Auth | ユーザー、セッション |
| フォーム | Controlled + Zod | 入力値、バリデーション |

## 4. Context一覧（計画）

### ThemeContext
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}
// LocalStorageに永続化、システム設定フォールバック
```

### SidebarContext
```typescript
interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}
```

### ToastContext
```typescript
interface Toast { id: string; type: 'success' | 'error' | 'info' | 'warning'; message: string; duration?: number }
interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}
// 自動削除: duration || 3000ms
```

## 5. Server State パターン

### サーバーコンポーネント (ISR)
```typescript
// app/(public)/posts/page.tsx
export const revalidate = 3600 // 1時間
// Supabaseから直接取得、キャッシュ
```

### クライアントサイド (Hook)
```typescript
// hooks/usePosts.ts
// fetch → useState → return { data, loading, error, refetch }
```

## 6. フォームバリデーション
```typescript
// hooks/useFormValidation.ts
function useFormValidation<T extends z.ZodType>(schema: T) {
  // schema.parse → errors状態管理
  return { errors, validate }
}
```

## 7. 永続化

| 対象 | ストレージ | 用途 |
|-----|----------|------|
| テーマ | LocalStorage | ダークモード設定 |
| 下書き | LocalStorage | エディタ自動保存(5秒間隔) |
| 検索条件 | SessionStorage | 一時的なフィルタ状態 |

## 8. パフォーマンス
- useMemo: 検索結果フィルタリング等
- useCallback: イベントハンドラ
- React.memo: PostCard等の繰り返しコンポーネント
