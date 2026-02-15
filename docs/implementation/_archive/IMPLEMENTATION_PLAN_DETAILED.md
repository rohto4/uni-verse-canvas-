# 実装計画（詳細）

最終更新: 2026-02-10

このドキュメントは Lv4 実装状況を受けて、未実装機能／モック状態の機能をすべて実装するための詳細指示書です。
各タスクは「目的 → 影響ファイル → ステップ実装手順 → 重要コード例 → テスト / 検証 → 見積（工数）」の順で記載します。

---

## 全体方針
- 小さな単位（1 PR=1機能/修正）に分割する。
- 先にデータ整合（RLS／service role）を確保してから CRUD/UI を順次実装する。
- 各 PR に必ず手順付きのレビュー checklist と簡易テスト手順を添付する。

---

## 優先度: 高（実装指示）

1) 認証と RLS の整備
 - 目的
   - 管理操作を安全に行うために Supabase Auth を利用し、管理者のみが更新系操作を行えるようにする。
 - 関連ドキュメント: `docs/implementation/06-auth-feature.md`
 - 影響ファイル
   - 新規: `src/lib/supabase/auth.ts`
   - 更新: `src/lib/supabase/server.ts`（既に service role 優先化が入っているため参照）
   - 新規マイグレーション例: `supabase/migrations/20260210_add_admins_table.sql`
 - 実装手順（ステップ）
   1. Supabase 側に管理者判定用テーブルを作成する SQL を追加する。
      - ファイル: `supabase/migrations/20260210_add_admins_table.sql`
      - 内容（例）:
        ```sql
        CREATE TABLE IF NOT EXISTS admins (
          user_id uuid PRIMARY KEY,
          role text DEFAULT 'admin',
          created_at timestamptz DEFAULT now()
        );
        ```
   2. RLS 方針（運用案）をドキュメント化する。短期運用は service role による管理操作、長期運用は `admins` を用いた RLS を追加。
      - 例ポリシー（将来適用）:
        ```sql
        CREATE POLICY "admin_write_in_progress" ON in_progress
          FOR ALL
          USING (exists (select 1 from admins where user_id = auth.uid()));
        ```
   3. サーバー／クライアントで利用する auth ヘルパーを実装する。
      - ファイル: `src/lib/supabase/auth.ts`
      - 必要関数:
        - `createClientForBrowser()` - ブラウザ用 supabase client
        - `getSessionServer()` - Server Side で session を確認するユーティリティ
        - `isAdminByUid(uid: string)` - サーバーで admins テーブルを確認する関数
   4. 管理画面のレイアウト（`src/app/(admin)/layout.tsx` など）に server-side guard を追加し、非管理者は `/admin/login` にリダイレクトする。
 - 重要コード例（抜粋）
   ```ts
   // src/lib/supabase/auth.ts (抜粋)
   import { createServerClient } from './server'

   export async function isAdminByUid(uid: string) {
     const supabase = createServerClient()
     const { data } = await supabase.from('admins').select('user_id').eq('user_id', uid).limit(1).single()
     return !!data
   }
   ```
 - テスト / 検証
   - 管理者アカウントでログイン後、記事作成/更新/削除が成功することを確認。
   - 非管理者アカウントでは更新系 API が拒否されることを確認。
 - 見積（概算）: 2日

2) バックアップ: インポート機能実装
 - 目的
   - 管理画面から JSON バックアップをアップロードし、DB を復元できるようにする（重複検出・スキップ・ロールバック対応）。
 - 関連ドキュメント: `docs/implementation/05-admin-feature.md`
 - 影響ファイル
   - 新規: `src/lib/actions/backup.ts`
   - 新規 API: `src/app/api/backup/import/route.ts`
   - 更新: `src/app/(admin)/admin/backup/page.tsx`（UI にファイル選択とインポート実行を追加）
 - 実装手順（ステップ）
   1. Zod スキーマを定義する（バックアップ JSON の期待構造）。
      - ファイル: `src/lib/actions/backup.ts`
      - 例: `BackupSchema = z.object({ posts: z.array(postSchema).optional(), ... })`
   2. サーバー API (`/api/backup/import`) を作成する。
      - 受信: JSON body（または multipart でファイル）→ Zod で検証。
      - 書き込み順序: tags → projects → posts → post_tags → in_progress。
      - 各挿入前に slug/unique key で既存をチェックし、重複はスキップする（UI でオプション指定可能）。
      - 途中エラー時は補償（成功した挿入を roll-back）を行う。
   3. UI 側: `backup/page.tsx` のインポートボタンをイベントで `/api/backup/import` に POST する。結果（imported/skipped/errors）を表示。
 - 重要コード例（pseudo）
   ```ts
   // api/backup/import/route.ts
   const body = await req.json()
   const parsed = BackupSchema.safeParse(body)
   if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
   // insert tags -> projects -> posts  ... with checks
   ```
 - テスト / 検証
   - 正常ファイル、重複ファイル、不正フォーマットの 3 パターンを試験。DB 状態が期待通りになることを確認。ロールバックの挙動を確認。
 - 見積（概算）: 3日

3) 記事詳細ページ（PostContent / TOC / Share）
 - 目的
   - 公開側で Tiptap JSON をレンダリングし、目次・読了時間・シェア機能を提供する。
 - 関連ドキュメント: `docs/implementation/01-posts-feature.md`
 - 影響ファイル
   - 新規: `src/components/posts/PostContent.tsx`, `src/components/posts/TableOfContents.tsx`, `src/components/posts/PostShare.tsx`
   - 更新: `src/app/(public)/posts/[slug]/page.tsx`
 - 実装手順（ステップ）
   1. `PostContent.tsx`: `useEditor({ content, editable:false, immediatelyRender:false })` を使い安全にレンダリング。
   2. `TableOfContents.tsx`: Tiptap JSON をトラバースして見出し(h2/h3) を抽出、ID を生成してリンク一覧を表示。クリックで scrollIntoView を実行。
   3. `PostShare.tsx`: Twitter, Facebook, Copy Link, navigator.share をサポート。
   4. `page.tsx` で `getPostBySlug()` の content を `PostContent` に渡し、TOC と関連記事を並べる。
 - 重要コード例（TOC 生成）
   ```ts
   function walk(node){
     if (node.type === 'heading' && (node.attrs.level===2||node.attrs.level===3)) {
       const text = node.content?.map(c=>c.text||'').join('')
       items.push({ level: node.attrs.level, text, id: slugify(text) })
     }
     (node.content||[]).forEach(walk)
   }
   ```
 - テスト / 検証
   - 見出しが多い記事で TOC のリンクが正しくジャンプすること、読み込み時に見出しに id が付与されること。
 - 見積: 2日

4) 管理ダッシュボードの実データ化
 - 目的
   - ダッシュボードカードに実際の統計（記事数、今月の閲覧、進行中件数、最近の投稿）を表示する。
 - 関連ドキュメント: `docs/implementation/05-admin-feature.md`
 - 影響ファイル
   - 新規: `src/lib/actions/metrics.ts`
   - 更新: `src/app/(admin)/admin/dashboard/page.tsx`
 - 実装手順
   1. `metrics.ts`: SQL で集計クエリ（総記事数、月別閲覧合計、予約記事数、最新記事5件）を実装。
   2. サーバーコンポーネントで呼び出し、cards に埋め込む。
 - テスト: DB の集計とダッシュボードの数値が一致することを確認。
 - 見積: 1日

---

## 優先度: 中（実装指示）

5) タグ管理 CRUD
 - 目的: 管理画面からタグを作成・更新・削除できるようにする。
 - 影響ファイル
   - 更新: `src/lib/actions/tags.ts` に `createTag`, `updateTag`, `deleteTag` を実装
   - 新規/更新: 管理 UI `src/app/(admin)/admin/tags/page.tsx` を作る
 - 実装手順（ステップ）
   1. actions/tags.ts に Zod バリデーションと挿入・更新ロジックを追加。
   2. 管理 UI: リスト・編集モーダル・新規フォーム・削除確認ダイアログを作成。
 - テスト: slug 重複、削除時の cascade（post_tags/project_tags）を確認。
 - 見積: 1.5日

6) 記事一覧の管理フィルタ（ステータス・検索）
 - 目的: 管理側記事一覧でステータスやキーワード検索を行えるようにする
 - 影響ファイル: `src/app/(admin)/admin/posts/page.tsx`
 - 実装手順
   1. UI に status セレクトと検索ボックスを追加。サーバ側 getPosts のパラメータでフィルタする。
 - 見積: 1日

7) バックアップの ZIP / Markdown 強化
 - 目的: 複数リソースを ZIP 化してダウンロード、Markdown に FrontMatter を追加
 - 影響ファイル: `src/app/api/backup/route.ts`（既存）を拡張
 - 実装: `archiver` 等で ZIP 生成。Markdown は YAML front matter を先頭に付与。
 - 見積: 1日

---

## 優先度: 低

8) Qiita 更新の自動化（Cron）
 - 目的: Qiita API から記事を取得して `qiita_cache` に保存、管理画面から更新トリガーも可能にする
 - 関連ドキュメント: `docs/implementation/99-future-features.md`
 - 影響ファイル: `src/lib/actions/qiita.ts`, `src/app/api/qiita/route.ts`
 - 見積: 2日

9) コメント機能（将来設計）
 - 目的: 将来的なコメント実装のための DB 設計とモデレーションワークフローを設計しておく
 - 関連ドキュメント: `docs/implementation/99-future-features.md`
 - 成果物: ER 図、API 仕様、RLS ポリシー草案

---

## テスト戦略（実装別）
- Unit: Server Actions の成功・失敗パターンを jest で
- Integration: DB 書き込み→読み取り→削除のサイクル
- E2E: Playwright で管理ログイン→記事 CRUD→記事詳細の確認

## デプロイ手順（要約）
1. マイグレーションを supabase に適用
2. Vercel/Hosting に `SUPABASE_SERVICE_ROLE_KEY` を secrets として設定
3. スモークテスト（管理 CRUD）を実施

---

## 実行の進め方（短期ガイド）
1. Issue を上記タスクごとに切る（PR 単位に分割）。
2. 最初の PR は「認証・RLS 可視化（admins テーブル + auth helper）」にする。レビュー後 staging で動作確認。
3. 次に「バックアップ インポート API + UI」を作成。並行して記事詳細ページを実装。

---

このドキュメントを基に、必要であれば私が各タスクの PR を直接作成します。どのタスクから着手しますか？
