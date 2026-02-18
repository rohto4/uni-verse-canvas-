# Testing Strategy (DDD)

## 1. スコープ (DDD)
- 対象: ドメインロジックとAPI層の正しさを100%カバレッジで担保
- 対象外: UI描画の視覚差分（E2Eで軽量検証のみ）
- 方針: 例外がある場合は明記し、例外以外は100%を維持

## 2. 対象ファイル (初期スコープ)

| 区分 | 対象 | 目標 |
|------|------|------|
| Core Logic | `src/lib/actions/**/*.ts`, `src/lib/utils.ts` | 100% |
| Supabase helpers | `src/lib/supabase/**/*.ts` | 100% |
| API routes | `src/app/api/**/*.ts` | 100% |
| Generated/Types | `src/types/**` | 対象外 |

## 3. カバレッジ方針 (DDD)
- Unit: 純粋ロジック/分岐/エラーパスを網羅（Supabase/Nextはモック）
- Integration: API routesとserver actionsをRequest/Response単位で検証
- E2E: クリティカル動線のスモーク（Playwrightで最低限）
- 収集対象: 上記スコープのみ `vitest` の `coverage.include` で明示

## 4. UI例外 (100%未達の合理的理由)

| ファイル | 目標 | 理由 |
|---------|------|------|
| `src/components/editor/TiptapEditor.tsx` | 70% | TipTapの内部DOM/拡張が重く、全分岐の制御が困難 |
| `src/components/editor/EditorToolbar.tsx` | 70% | TipTap APIに依存し分岐網羅が難しい |
| `src/components/editor/extensions/ResizableImage.tsx` | 60% | Canvas/ResizeObserver依存でJSDOM限界 |
| `src/components/editor/extensions/TableWithDelete.tsx` | 60% | TipTap node viewの分岐が多い |
| `src/components/projects/TechStackChart.tsx` | 60% | Chart.jsの描画依存で完全網羅不可 |

## 5. テストデータ/モック
- `tests/helpers/supabase.ts` でSupabaseクエリを擬似実装
- `next/cache`, `next/headers` 等のNext依存はユニットテストでモック

## 6. npm scripts
```json
{
  "test": "vitest run",
  "test:unit": "vitest run tests/unit",
  "test:integration": "vitest run tests/integration",
  "test:e2e": "playwright test",
  "test:coverage": "vitest run --coverage"
}
```

## 7. 実行タイミング
- 保存時: Unit (watch)
- コミット前: Unit + Coverage
- PR: Unit + Integration
- マージ前: 全テスト
- デプロイ前: 全テスト + Coverage
