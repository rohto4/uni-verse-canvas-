# Agents Plan (Team Development)

最終更新: 2026-02-19

## 方針
- DDD準拠: 先に設計書更新 → 実装（承認不要の指示に従う）
- Lock運用は対象タスク着手時に実施
- 司令塔(Prometheus)は実装せず分担と進行管理に専念

## 役割マトリクス（計画）

| ID | 担当 | 役割 | 主要タスク | 先行ドキュメント | 予定成果物 |
|---|---|---|---|---|---|
| A1 | general | 管理画面設定の網羅化 | 管理画面から設定不可項目の特定/追加UI/Actions | `docs/specs/component-spec.md`, `docs/specs/api-spec.md`, `docs/implementation/05-admin-feature.md` | 管理画面の設定UI・Server Actions拡張 |
| A2 | general | リンク/クリックUX改善 | クリック可能範囲拡大、リンク欠落修正 | `docs/specs/component-spec.md`, `docs/implementation/00-overview.md` | 公開/管理UIのリンク改善 |
| A3 | general | テーマ統一（活力向上） | 管理画面の色調をブルアカ基調で統一 | `docs/specs/requirements.md`, `docs/implementation/05-admin-feature.md` | 管理画面テーマ更新 |
| A4 | general | テスト戦略100%カバレッジ | テスト設計/実装/安定化 | `docs/testing/testing-strategy.md` | Unit/Integration/E2Eスクリプト、カバレッジ100% |
| A5 | general | Projects公開/非公開強調 + 公開リンク設定 | フィルタUI強調、公開項目リンク設定 | `docs/specs/component-spec.md`, `docs/specs/api-spec.md`, `docs/specs/data-schema.md` | UI・DB/Action拡張 |
| A6 | general | テストデータSQL | posts/projectsのINSERT/DELETE SQL作成 | `docs/specs/data-schema.md` | `docs/` 配下SQLファイル |
| A7 | general | ドキュメント更新/残タスク | 実装反映、次候補整理、追加改善 | `docs/implementation/*`, `docs/specs/*` | 最新化＋次タスク一覧 |

## 実績（完了後に追記）

### A1 管理画面設定の網羅化
- 実績: 管理画面の不足設定を追加（ホーム編集/タグ管理/ポスト追加フィールド/進行中完了関連など）
- 主要変更: `docs/specs/data-schema.md`, `docs/specs/api-spec.md`, `docs/implementation/05-admin-feature.md`, `docs/implementation/00-overview.md`
- 実装変更: 管理画面ページ/クライアント/Server Actions 多数
- 差分: 予定より範囲拡大（公開ページとアクションの整合も同時に修正）

### A2 リンク/クリックUX改善
- 実績: カード/行のフルクリック化、キーボード操作対応、ネストリンク回避
- 主要変更: `docs/specs/requirements.md`, 公開/管理UIのカード・一覧
- 差分: なし

### A3 テーマ統一（活力向上）
- 実績: 管理画面に`.admin-theme`を追加し専用トークンをスコープ適用
- 主要変更: `src/app/(admin)/AdminClientLayout.tsx`, `src/styles/globals-pattern1-sky-coral.css`
- 差分: なし

### A4 テスト100%カバレッジ
- 実績: テスト戦略更新、Vitest/Playwright設定、Unit/Integration/E2E追加
- 主要変更: `docs/testing/testing-strategy.md`, `vitest.config.ts`, `package.json`, `playwright.config.ts`, `tests/**`
- 差分: 実行は未実施（カバレッジ100%の実証は未完）

### A5 Projects公開/非公開強調 + 公開リンク設定
- 実績: 公開リンク設定（download/website）追加、フィルタ強調
- 主要変更: `docs/specs/data-schema.md`, `docs/specs/api-spec.md`, `docs/specs/component-spec.md`, `docs/implementation/02-projects-feature.md`
- 実装変更: `supabase/migrations/20260218_add_project_public_links.sql`, UI/フォーム/一覧/詳細
- 差分: DBマイグレーション適用済み（リモートDBリセット後に反映）

### A6 テストデータSQL
- 実績: 20件posts/10件projectsのINSERT SQL + 安全なDELETE SQL
- 主要変更: `supabase/seed-test-data.sql`, `supabase/reset-test-data.sql`
- 差分: 画像URLはプレースホルダ（差し替え必要）

### A8 追加運用修正（管理画面・アップロード・RLS）
- 実績: 管理画面の配置調整、固定ページの保存ボタン左寄せ、SNS候補拡充、画像アップロードのバケット自動作成に対応
- 主要変更: `src/lib/actions/storage.ts`, `src/components/layout/AdminSidebar.tsx`, `src/components/admin/PostEditorClient.tsx`, `src/components/admin/InProgressList.tsx`, `src/components/admin/LinksPageForm.tsx`
- 実装変更: `supabase/migrations/20260219_add_rls_link_tables.sql`
- 差分: 進行ゲージの表示方式をマスク方式に更新

### A7 ドキュメント同期/残タスク
- 実績: 主要ドキュメントの最新化、残タスク一覧と候補整理
- 主要変更: `docs/implementation/remaining-tasks.md` ほか
- 差分: なし
