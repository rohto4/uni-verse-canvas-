# View Count 実数化プラン

最終更新: 2026-02-20

## 目的
- 記事詳細の閲覧数を「実際の閲覧」に近づける
- メタデータ生成や一覧取得による二重カウントを防止

## 方針（推奨）
### A. アプリ内トラッキング（推奨・低コスト）
1. `getPostBySlug` は閲覧数を更新しない
2. 記事詳細ページでクライアント側から `trackPostView` を呼ぶ
3. 簡易デデュープ（cookie）を追加

**メリット**: 追加インフラなし、実装範囲が限定
**デメリット**: 厳密なユニーク訪問ではない

### B. 外部解析の導入（選択肢）
- Vercel Analytics などのイベントAPIで計測
- DBに戻す場合は、集計APIを作成して表示

**メリット**: 解析が強い
**デメリット**: DBへ反映する実装が必要

## 実装ステップ（A案）
1. `docs/specs/api-spec.md` に `trackPostView` を定義
2. `src/lib/actions/posts.ts`
   - `getPostBySlug` から view_count 更新を削除
   - `trackPostView(postId)` を追加（`view_count + 1`）
3. `src/app/(public)/posts/[slug]/page.tsx`
   - `PostViewCount`（client）で閲覧数を表示し、`trackPostView` を呼ぶ
4. 同一ブラウザの重複を抑制
   - `post_viewed_{postId}` cookie を 24h で設定
   - cookie がある場合は更新しない（1日1回まで）

## 影響ファイル
- `docs/specs/api-spec.md`
- `src/lib/actions/posts.ts`
- `src/app/(public)/posts/[slug]/page.tsx`
- `src/components/posts/PostViewCount.tsx`

## 受け入れ条件
- 記事詳細の表示1回で view_count が +1
- メタデータ生成で view_count が増加しない
- 同一ブラウザでの閲覧数上昇は1日1回まで
