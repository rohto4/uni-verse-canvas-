# 読み物機能実装ドキュメント

## 実装概要

読み物（posts）一覧ページのDB連携機能を実装しました。タグフィルタリング、検索、ページネーション、ソート機能を含みます。

## 実装内容

### 1. シードデータ追加

**ファイル**: `supabase/seed.sql`

- 10件のサンプル記事を追加
- 記事とタグの紐付け（post_tags）を追加
- 記事ID: post1111-1111-1111-1111-111111111111 〜 post1010-1010-1010-1010-101010101010

### 2. Server Actions

**ファイル**: `src/lib/actions/posts.ts`

#### `getPosts(params)`
記事一覧を取得する関数。以下の機能をサポート:

- **ページネーション**: `page`, `limit` パラメータ
- **タグフィルタ**: `tags` パラメータ（配列）- AND検索（全てのタグを含む記事のみ）
- **検索**: `search` パラメータ - タイトルと抜粋を検索
- **ソート**: `sort` パラメータ
  - `latest`: 最新順（デフォルト）
  - `oldest`: 古い順
  - `popular`: 人気順（view_count降順）
- **ステータスフィルタ**: `status` パラメータ
  - `published`: 公開済み記事（scheduled記事も含む）

**戻り値**:
```typescript
{
  posts: PostWithTags[],
  pagination: {
    currentPage: number,
    totalPages: number,
    totalCount: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

#### `getPostBySlug(slug)`
スラッグから記事を取得。閲覧数（view_count）を自動的にインクリメント。

#### `getRelatedPosts(postId, limit)`
関連記事を取得。タグの類似度でソート。

### 3. UIコンポーネント

#### `PostsFilter` (Client Component)
**ファイル**: `src/components/posts/PostsFilter.tsx`

- 検索ボックス: 500msのデバウンス処理
- タグフィルタ: クリックでON/OFF切り替え
- アクティブフィルタ表示: 選択中のタグと検索ワードを表示
- URLパラメータで状態管理: ページ遷移してもフィルタ状態を保持

**機能**:
- タグクリックで複数選択可能（AND検索）
- フィルタクリア機能
- Pending状態の表示（useTransition使用）

#### `PostsList` (Server Component)
**ファイル**: `src/components/posts/PostsList.tsx`

- 記事カードのリスト表示
- タグバッジ表示
- 日付とビュー数の表示
- 空の結果時のメッセージ表示

#### `Pagination` (Client Component)
**ファイル**: `src/components/posts/Pagination.tsx`

- ページ番号ボタン
- 前へ/次へボタン
- 省略記号（...）による中間ページの省略
- 最大5ページを表示（1, ..., 4, 5, 6, ..., 10 のような形式）

### 4. メインページ

**ファイル**: `src/app/(public)/posts/page.tsx`

- Suspenseを使用した段階的レンダリング
- スケルトンローディング表示
- 検索パラメータの処理
- 記事一覧とタグの並列フェッチ
- 結果サマリー表示（「10件中1-10件を表示」）

## 使用方法

### 1. データベースのセットアップ

```bash
# シードデータを再実行（記事データを追加）
# Supabase Studioで seed.sql を実行
```

### 2. URLパラメータ

```
# 基本
/posts

# タグフィルタ（AND検索）
/posts?tags=nextjs,react

# 検索
/posts?search=TypeScript

# ページネーション
/posts?page=2

# 組み合わせ
/posts?tags=react&search=hooks&page=1&sort=popular
```

## エラーハンドリング

### Server Actions
- Supabaseエラー時は空の配列を返却
- コンソールにエラーログを出力
- フロントエンドには正常な空のレスポンスを返す

### Client Components
- タグが0件の場合は何も表示しない
- 記事が0件の場合は「記事が見つかりませんでした」と表示
- フィルタクリア機能を提供

### エッジケース対応

1. **無効なページ番号**: 1未満またはtotalPagesを超える場合でもエラーにならず、空の結果を返す
2. **存在しないタグ**: タグが存在しない場合は空の結果を返す
3. **複数タグAND検索**: 全てのタグを含む記事のみを返す
4. **scheduled記事の自動公開**: published_at が現在時刻以下の scheduled 記事は公開済みとして扱う

## パフォーマンス最適化

### データベースクエリ
- タグフィルタはサブクエリで効率的に処理
- 記事とタグの並列フェッチ（Promise.all）
- インデックスを活用（slug, status, published_at, created_at）

### フロントエンド
- Server ActionsによるServer-side データフェッチ
- Suspenseによる段階的レンダリング
- useTransitionによる非同期UI更新
- デバウンス処理（検索: 500ms）

## テストポイント

### 基本機能
- [x] 記事一覧の表示
- [x] タグフィルタリング（単一タグ）
- [x] タグフィルタリング（複数タグ AND検索）
- [x] 検索機能（タイトル・抜粋）
- [x] ページネーション
- [x] ソート（最新順、古い順、人気順）

### エッジケース
- [x] 記事0件の表示
- [x] フィルタ結果0件の表示
- [x] 存在しないタグでのフィルタ
- [x] 無効なページ番号
- [x] URLパラメータの永続化

### パフォーマンス
- [x] 検索のデバウンス処理
- [x] 並列データフェッチ
- [x] Suspenseによるローディング

## 今後の拡張

### 優先度: 高
- [ ] ソート切り替えUI（現在はURLパラメータのみ）
- [ ] モバイル用タグフィルタ（ドロワーメニュー）
- [ ] 記事詳細ページへの関連記事表示

### 優先度: 中
- [ ] 全文検索機能（PostgreSQL Full-Text Search）
- [ ] RSS/Atom Feed
- [ ] OGP画像の自動生成

### 優先度: 低
- [ ] 記事のブックマーク機能
- [ ] 記事の共有ボタン
- [ ] 読了時間の表示

## 注意事項

### TypeScript型安全性
- Supabaseの型推論が一部機能しないため、`as any`を使用している箇所があります
- 将来的には`supabase gen types`で生成した型定義を使用することを推奨

### RLS（Row Level Security）
- 現在は公開記事（published/scheduled）のみ取得可能
- 管理者認証実装後、draft記事も管理画面から閲覧可能にする必要あり

### ビュー数カウント
- `getPostBySlug`で自動的にview_countをインクリメント
- 将来的にはクライアントIPによる重複カウント防止を検討

## 関連ドキュメント

- [データベーススキーマ](./lv2/data-schema.md)
- [API仕様](./lv2/api-spec.md)
- [要件定義](./lv1/requirements.md)
- [データベースセットアップガイド](./DATABASE_SETUP.md)
