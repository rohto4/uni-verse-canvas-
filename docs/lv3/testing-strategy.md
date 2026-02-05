# Testing Strategy (Claude Reference)

## 1. テストピラミッド

| 種別 | 目的 | カバレッジ目標 | ツール |
|-----|------|-------------|-------|
| Unit | ロジック検証 | 70%以上 | Jest + RTL |
| Integration | API・DB連携 | 主要エンドポイント | Jest + Supabase |
| E2E | ユーザーシナリオ | クリティカルパス | Playwright |

## 2. Unit Test対象

### 必須
- `lib/utils/`: slug, date, image, backup, markdown
- `lib/validations/`: 全Zodスキーマ (100%)
- ビジネスロジック: 時限投稿判定, タグフィルタ, 関連記事推薦

### 推奨
- Hooks: useAuth, usePosts, useTheme, useFormValidation
- カスタムコンポーネント (shadcn/uiは不要)

## 3. Integration Test対象
- POST/PUT/DELETE /api/posts
- POST /api/backup/export
- POST /api/qiita/refresh
- RLSポリシー検証

## 4. E2E シナリオ
1. 記事投稿フロー: ログイン→作成→保存→エクスポート→公開確認
2. 時限投稿フロー: スケジュール設定→公開前非表示→公開後表示
3. タグフィルタフロー: タグ選択→URL更新→結果表示

## 5. カバレッジ目標

| ファイル種別 | 目標 |
|------------|-----|
| lib/utils/*.ts | 90%以上 |
| lib/validations/*.ts | 100% |
| lib/api/*.ts | 80%以上 |
| app/api/*.ts | 70%以上 |
| components/ui/*.tsx | 不要 |

## 6. テストデータ

### Fixtures
`tests/fixtures/posts.json` - 静的テストデータ

### Factories
```typescript
// tests/factories/postFactory.ts
function createPost(overrides?: Partial<Post>): Post
function createPosts(count: number): Post[]
```

## 7. モック

### Supabase
```typescript
// tests/mocks/supabase.ts
function createMockSupabaseClient()
// from, select, insert, auth.getSession等をjest.fn()
```

### 外部API
```typescript
// tests/mocks/qiita.ts (MSW)
rest.get('https://qiita.com/api/v2/users/:username/items', ...)
```

## 8. CI/CD

```yaml
# .github/workflows/test.yml
jobs:
  unit-test: npm run test:unit --coverage
  integration-test: npm run test:integration (needs: unit-test)
  e2e-test: npm run test:e2e (needs: integration-test)
```

## 9. npm scripts
```json
{
  "test": "jest",
  "test:unit": "jest --testPathPattern=tests/unit",
  "test:integration": "jest --testPathPattern=tests/integration",
  "test:e2e": "playwright test",
  "test:coverage": "jest --coverage"
}
```

## 10. 実行タイミング
- コード保存: Unit (watch)
- コミット前: Unit全体
- PR: Unit + Integration
- マージ前: 全テスト
- デプロイ前: 全テスト + カバレッジ
