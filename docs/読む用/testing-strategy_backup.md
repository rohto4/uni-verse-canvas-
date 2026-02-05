# docs/testing-strategy.md

## Document Metadata
- **Version**: 1.0.0
- **Last Updated**: 2026-02-04
- **Status**: Confirmed (確定版)
- **Owner**: Senior Fullstack Engineer (DDD Specialist)
- **Project Name**: UniVerse Canvas

---

## 1. テスト戦略概要

### 1.1 テスト方針
- **品質優先**: バグを早期に発見し、長期保守性を確保
- **自動化**: CI/CDパイプラインで自動実行
- **実用的**: 100%カバレッジは目指さず、重要箇所に注力
- **高速**: テスト実行時間は5分以内
- **メンテナブル**: テストコードも保守しやすく

### 1.2 テストピラミッド

```
        ┌─────────┐
        │  E2E    │  少数（クリティカルパスのみ）
        │  Tests  │  実行時間: 長い
        └─────────┘
      ┌─────────────┐
      │ Integration │  中程度
      │   Tests     │  実行時間: 中
      └─────────────┘
    ┌─────────────────┐
    │  Unit Tests     │  多数（ロジック中心）
    │                 │  実行時間: 短い
    └─────────────────┘
```

| テスト種別 | 目的 | 実行頻度 | カバレッジ目標 |
|----------|------|---------|--------------|
| **Unit Tests** | ロジック検証 | 毎コミット | 70%以上 |
| **Integration Tests** | API・DB連携検証 | 毎プルリクエスト | 主要エンドポイント |
| **E2E Tests** | ユーザーシナリオ検証 | デプロイ前 | クリティカルパス |

---

## 2. ユニットテスト

### 2.1 対象

#### A. ユーティリティ関数（必須）
- スラッグ生成
- 日時判定・フォーマット
- バリデーション
- 画像処理
- Markdown変換

#### B. ビジネスロジック（必須）
- 時限投稿判定
- タグフィルタリング
- 関連記事推薦
- エクスポート・インポート処理

#### C. React Hooks（推奨）
- useAuth
- usePosts
- useTheme
- useFormValidation

#### D. React コンポーネント（選択的）
- 共通UIコンポーネント（Button, Input等）は不要（shadcn/ui任せ）
- カスタムコンポーネントのみテスト

### 2.2 テストフレームワーク

| ツール | 用途 | バージョン |
|-------|------|----------|
| **Jest** | テストランナー | Latest |
| **React Testing Library** | Reactコンポーネントテスト | Latest |
| **@testing-library/jest-dom** | DOM assertion拡張 | Latest |
| **@testing-library/user-event** | ユーザーインタラクション | Latest |

### 2.3 ユーティリティ関数のテスト例

**ファイル**: `tests/unit/utils/slug.test.ts`

```typescript
import { generateSlug } from '@/lib/utils/slug'

describe('generateSlug', () => {
  it('should convert Japanese to romaji', () => {
    expect(generateSlug('こんにちは世界')).toBe('konnichiha-sekai')
  })
  
  it('should handle English text', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })
  
  it('should remove special characters', () => {
    expect(generateSlug('Hello! World?')).toBe('hello-world')
  })
  
  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('')
  })
  
  it('should truncate long text', () => {
    const longText = 'a'.repeat(300)
    const result = generateSlug(longText)
    expect(result.length).toBeLessThanOrEqual(200)
  })
  
  it('should return UUID fallback for invalid input', () => {
    const result = generateSlug('!@#$%^&*()')
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })
})
```

**ファイル**: `tests/unit/utils/date.test.ts`

```typescript
import { isPublished, formatDate } from '@/lib/utils/date'

describe('isPublished', () => {
  it('should return true for published status with past date', () => {
    const post = {
      status: 'published' as const,
      published_at: '2024-01-01T00:00:00Z'
    }
    expect(isPublished(post)).toBe(true)
  })
  
  it('should return false for scheduled status with future date', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    
    const post = {
      status: 'scheduled' as const,
      published_at: futureDate.toISOString()
    }
    expect(isPublished(post)).toBe(false)
  })
  
  it('should return true for scheduled status with past date', () => {
    const post = {
      status: 'scheduled' as const,
      published_at: '2024-01-01T00:00:00Z'
    }
    expect(isPublished(post)).toBe(true)
  })
  
  it('should return false for draft status', () => {
    const post = {
      status: 'draft' as const,
      published_at: null
    }
    expect(isPublished(post)).toBe(false)
  })
})

describe('formatDate', () => {
  it('should format ISO date to Japanese format', () => {
    expect(formatDate('2024-01-15T12:00:00Z')).toBe('2024年1月15日')
  })
  
  it('should handle invalid date', () => {
    expect(formatDate('invalid')).toBe('-')
  })
})
```

### 2.4 React Hooksのテスト例

**ファイル**: `tests/unit/hooks/useAuth.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

// Supabaseクライアントをモック
jest.mock('@/lib/supabase/client')

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('should return loading state initially', () => {
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } }
        })
      }
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
  })
  
  it('should return user when authenticated', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: mockUser } }
        }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } }
        })
      }
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    const { result } = renderHook(() => useAuth())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAdmin).toBe(true)
    })
  })
})
```

### 2.5 React コンポーネントのテスト例

**ファイル**: `tests/unit/components/PostCard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/post/PostCard'

const mockPost = {
  id: 'post-123',
  title: 'テスト記事',
  slug: 'test-post',
  excerpt: 'テスト記事の説明',
  status: 'published' as const,
  published_at: '2024-01-01T00:00:00Z',
  cover_image: null,
  view_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tags: [
    { id: 'tag-1', name: 'Tech', slug: 'tech', color: '#3B82F6' }
  ]
}

describe('PostCard', () => {
  it('should render post title', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('テスト記事')).toBeInTheDocument()
  })
  
  it('should render post excerpt', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('テスト記事の説明')).toBeInTheDocument()
  })
  
  it('should render tags', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })
  
  it('should have link to post detail', () => {
    render(<PostCard post={mockPost} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/posts/test-post')
  })
  
  it('should not render cover image when not provided', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
```

---

## 3. 統合テスト（Integration Tests）

### 3.1 対象

#### A. API Routes（必須）
- POST /api/posts
- PUT /api/posts/[id]
- DELETE /api/posts/[id]
- POST /api/backup/export
- POST /api/qiita/refresh

#### B. Database Operations（推奨）
- CRUD操作
- RLSポリシー検証
- トランザクション処理

### 3.2 テスト環境

- **データベース**: Supabase開発インスタンス（テスト専用スキーマ）
- **認証**: テストユーザーアカウント
- **外部API**: モック使用

### 3.3 API Routeのテスト例

**ファイル**: `tests/integration/api/posts.test.ts`

```typescript
import { POST, GET, PUT, DELETE } from '@/app/api/posts/route'
import { createClient } from '@/lib/supabase/server'

// テストヘルパー
function createMockRequest(method: string, body?: any): Request {
  return new Request('http://localhost:3000/api/posts', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/posts', () => {
  let supabase: ReturnType<typeof createClient>
  
  beforeAll(async () => {
    supabase = createClient()
    // テストユーザーでログイン
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test-password'
    })
  })
  
  afterAll(async () => {
    // テストデータクリーンアップ
    await supabase.from('posts').delete().eq('slug', 'test-post')
    await supabase.auth.signOut()
  })
  
  it('should create a new post', async () => {
    const requestBody = {
      title: 'テスト記事',
      slug: 'test-post',
      content: { type: 'doc', content: [] },
      status: 'draft',
      tags: []
    }
    
    const request = createMockRequest('POST', requestBody)
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.post.title).toBe('テスト記事')
  })
  
  it('should return 400 for invalid data', async () => {
    const requestBody = {
      title: '', // 空タイトル（バリデーションエラー）
      slug: 'test-post',
      content: { type: 'doc', content: [] },
    }
    
    const request = createMockRequest('POST', requestBody)
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_REQUIRED_FIELD')
  })
  
  it('should return 409 for duplicate slug', async () => {
    // 既存の記事を作成
    await supabase.from('posts').insert({
      title: '既存記事',
      slug: 'existing-post',
      content: { type: 'doc', content: [] }
    })
    
    const requestBody = {
      title: '新規記事',
      slug: 'existing-post', // 重複スラッグ
      content: { type: 'doc', content: [] },
      tags: []
    }
    
    const request = createMockRequest('POST', requestBody)
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(409)
    expect(data.error.code).toBe('BUSINESS_SLUG_DUPLICATE')
    
    // クリーンアップ
    await supabase.from('posts').delete().eq('slug', 'existing-post')
  })
  
  it('should return 401 for unauthenticated request', async () => {
    // ログアウト
    await supabase.auth.signOut()
    
    const requestBody = {
      title: 'テスト記事',
      slug: 'test-post',
      content: { type: 'doc', content: [] },
      tags: []
    }
    
    const request = createMockRequest('POST', requestBody)
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(401)
    expect(data.error.code).toBe('AUTH_REQUIRED')
    
    // 再ログイン
    await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'test-password'
    })
  })
})
```

---

## 4. E2Eテスト（End-to-End Tests）

### 4.1 対象シナリオ

#### クリティカルパス（必須）
1. **記事投稿フロー**
   - ログイン → 新規記事作成 → 保存 → エクスポート → 公開ページで確認
2. **時限投稿フロー**
   - スケジュール設定 → 公開時刻前は非表示 → 公開時刻後に表示
3. **タグフィルタフロー**
   - タグ選択 → URL更新 → フィルタ結果表示

### 4.2 テストツール

| ツール | 用途 | 優先度 |
|-------|------|-------|
| **Playwright** | E2Eテスト | 高（推奨） |
| **Cypress** | E2Eテスト | 中（代替案） |

### 4.3 Playwright テスト例

**ファイル**: `tests/e2e/post-creation.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('記事投稿フロー', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'test-password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin/dashboard')
  })
  
  test('新規記事を作成して公開できる', async ({ page }) => {
    // 新規記事作成ページへ移動
    await page.goto('/admin/posts/new')
    
    // タイトル入力
    await page.fill('input[name="title"]', 'E2Eテスト記事')
    
    // 本文入力
    await page.click('.ProseMirror')
    await page.keyboard.type('これはE2Eテストで作成された記事です。')
    
    // タグ選択
    await page.click('button:has-text("タグを選択")')
    await page.click('text=Tech')
    
    // ステータスを「公開」に設定
    await page.selectOption('select[name="status"]', 'published')
    
    // 保存
    await page.click('button:has-text("保存")')
    
    // 保存完了ページへ遷移
    await page.waitForURL(/\/admin\/posts\/.*\/saved/)
    expect(page.url()).toContain('/saved')
    
    // エクスポートボタンが表示されている
    await expect(page.locator('button:has-text("JSONダウンロード")')).toBeVisible()
    
    // 公開ページで確認
    await page.goto('/posts')
    await expect(page.locator('text=E2Eテスト記事')).toBeVisible()
  })
  
  test('下書きは公開ページに表示されない', async ({ page }) => {
    // 下書き作成
    await page.goto('/admin/posts/new')
    await page.fill('input[name="title"]', 'テスト下書き')
    await page.click('.ProseMirror')
    await page.keyboard.type('下書きコンテンツ')
    await page.selectOption('select[name="status"]', 'draft')
    await page.click('button:has-text("保存")')
    
    // 公開ページでは表示されない
    await page.goto('/posts')
    await expect(page.locator('text=テスト下書き')).not.toBeVisible()
  })
})

test.describe('タグフィルタフロー', () => {
  test('タグ選択でフィルタリングできる', async ({ page }) => {
    await page.goto('/posts')
    
    // 初期状態で全記事表示
    const allPosts = await page.locator('.post-card').count()
    expect(allPosts).toBeGreaterThan(0)
    
    // Techタグを選択
    await page.click('text=Tech')
    
    // URLが更新される
    await page.waitForURL(/tags=tech/)
    
    // フィルタ後の記事数が減る
    const filteredPosts = await page.locator('.post-card').count()
    expect(filteredPosts).toBeLessThanOrEqual(allPosts)
    
    // 全ての記事にTechタグが付いている
    const techBadges = await page.locator('text=Tech').count()
    expect(techBadges).toBe(filteredPosts)
  })
})
```

---

## 5. テストデータ管理

### 5.1 テストデータ戦略

| 種類 | 管理方法 | 使用場所 |
|-----|---------|---------|
| **Fixtures** | JSONファイル | Unit, Integration |
| **Factories** | コード生成 | Integration, E2E |
| **Seed データ** | SQLスクリプト | E2E |

### 5.2 Fixtures例

**ファイル**: `tests/fixtures/posts.json`

```json
{
  "validPost": {
    "id": "post-123",
    "title": "テスト記事",
    "slug": "test-post",
    "content": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "テスト本文" }
          ]
        }
      ]
    },
    "excerpt": "テスト記事の説明",
    "status": "published",
    "published_at": "2024-01-01T00:00:00Z",
    "tags": [
      { "id": "tag-1", "name": "Tech", "slug": "tech", "color": "#3B82F6" }
    ]
  },
  "draftPost": {
    "id": "post-456",
    "title": "下書き記事",
    "slug": "draft-post",
    "status": "draft",
    "published_at": null
  }
}
```

### 5.3 Factory例

**ファイル**: `tests/factories/postFactory.ts`

```typescript
import { faker } from '@faker-js/faker'

export function createPost(overrides?: Partial<Post>): Post {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    slug: faker.helpers.slugify(faker.lorem.words(3)),
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: faker.lorem.paragraph() }
          ]
        }
      ]
    },
    excerpt: faker.lorem.sentences(2),
    status: 'published',
    published_at: faker.date.past().toISOString(),
    cover_image: null,
    ogp_image: null,
    view_count: faker.number.int({ min: 0, max: 1000 }),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  }
}

export function createPosts(count: number, overrides?: Partial<Post>): Post[] {
  return Array.from({ length: count }, () => createPost(overrides))
}
```

**使用例**:
```typescript
import { createPost, createPosts } from '@/tests/factories/postFactory'

describe('PostList', () => {
  it('should render multiple posts', () => {
    const posts = createPosts(5)
    render(<PostList posts={posts} />)
    expect(screen.getAllByRole('article')).toHaveLength(5)
  })
  
  it('should render draft badge for draft posts', () => {
    const draftPost = createPost({ status: 'draft' })
    render(<PostCard post={draftPost} />)
    expect(screen.getByText('下書き')).toBeInTheDocument()
  })
})
```

---

## 6. モック・スタブ戦略

### 6.1 Supabaseクライアントのモック

**ファイル**: `tests/mocks/supabase.ts`

```typescript
export function createMockSupabaseClient() {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    }
  }
}
```

### 6.2 外部APIのモック

**ファイル**: `tests/mocks/qiita.ts`

```typescript
import { rest } from 'msw'
import { setupServer } from 'msw/node'

export const qiitaHandlers = [
  rest.get('https://qiita.com/api/v2/users/:username/items', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'qiita-123',
          title: 'Qiitaテスト記事',
          url: 'https://qiita.com/user/items/qiita-123',
          likes_count: 10,
          created_at: '2024-01-01T00:00:00Z'
        }
      ])
    )
  })
]

export const server = setupServer(...qiitaHandlers)

// テストセットアップ
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## 7. カバレッジ目標

### 7.1 全体目標

| 指標 | 目標値 | 測定方法 |
|-----|-------|---------|
| **Line Coverage** | 70%以上 | Jest --coverage |
| **Branch Coverage** | 65%以上 | Jest --coverage |
| **Function Coverage** | 75%以上 | Jest --coverage |

### 7.2 ファイル別目標

| ファイル種別 | カバレッジ目標 |
|------------|-------------|
| **lib/utils/*.ts** | 90%以上（ロジック中心） |
| **lib/api/*.ts** | 80%以上 |
| **lib/validations/*.ts** | 100%（クリティカル） |
| **components/editor/*.tsx** | 60%以上 |
| **components/ui/*.tsx** | 不要（shadcn/ui任せ） |
| **app/api/*.ts** | 70%以上 |

### 7.3 カバレッジレポート

```bash
# カバレッジ計測
npm run test:coverage

# HTML レポート生成
npm run test:coverage -- --coverageReporters=html

# CI/CD で閾値チェック
npm run test:coverage -- --coverageThreshold='{"global":{"lines":70}}'
```

---

## 8. CI/CDパイプライン統合

### 8.1 GitHub Actions ワークフロー

**ファイル**: `.github/workflows/test.yml`

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
  
  integration-test:
    runs-on: ubuntu-latest
    needs: unit-test
    
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
      SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
  
  e2e-test:
    runs-on: ubuntu-latest
    needs: integration-test
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 8.2 npm scripts

**ファイル**: `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

---

## 9. テスト実行計画

### 9.1 開発フロー別実行

| タイミング | 実行テスト | 所要時間 |
|----------|-----------|---------|
| **コード保存時** | Unit Tests（watch mode） | 数秒 |
| **コミット前** | Unit Tests（全体） | 1分 |
| **プルリクエスト** | Unit + Integration | 3分 |
| **マージ前** | Unit + Integration + E2E | 5分 |
| **デプロイ前** | 全テスト + カバレッジ | 10分 |

### 9.2 並列実行

```bash
# 並列実行で高速化
npm run test -- --maxWorkers=4

# E2Eテストも並列実行
npx playwright test --workers=2
```

---

## 10. テストメンテナンス

### 10.1 テストコード品質ルール

1. **AAA パターン**: Arrange, Act, Assert
2. **1テスト1検証**: 1つのテストケースで1つのことを検証
3. **明確な命名**: `it('should ...')` 形式
4. **独立性**: テスト間で依存しない
5. **高速実行**: 1テスト1秒以内

### 10.2 テストの定期見直し

- **月1回**: カバレッジレポート確認
- **リファクタリング時**: テストも一緒に更新
- **不要なテスト削除**: Flaky Testは修正or削除

---

## 11. テスト環境構築

### 11.1 Jest設定

**ファイル**: `jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/components/ui/**', // shadcn/ui除外
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      branches: 65,
      functions: 75,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**ファイル**: `jest.setup.js`

```javascript
import '@testing-library/jest-dom'

// グローバルモック
global.fetch = jest.fn()
```

### 11.2 Playwright設定

**ファイル**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 12. トラブルシューティング

### 12.1 よくある問題

| 問題 | 原因 | 解決策 |
|-----|------|-------|
| テストがタイムアウト | 非同期処理待機不足 | waitFor使用 |
| モックが効かない | モックタイミング問題 | beforeEach で初期化 |
| カバレッジが低い | テスト不足 | 重要ロジックに注力 |
| Flaky Test | 非決定的な処理 | タイムアウト調整・モック強化 |

### 12.2 デバッグ方法

```bash
# 特定のテストのみ実行
npm run test -- PostCard.test.tsx

# デバッグモード
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright UIモード
npx playwright test --ui
```

---

## 13. ドキュメント更新履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | 初版作成（テスト戦略確定版） |

---

## 承認状態

✅ **確定済み** - 本テスト戦略で開発を進めます。

次のステップ: Phase 3 のドキュメント作成 or 実装開始
