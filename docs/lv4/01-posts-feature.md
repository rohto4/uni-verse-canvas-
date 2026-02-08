# 読み物（Posts）機能 実装状況

記事の一覧・詳細・作成・編集機能の実装状況です。

**最終更新**: 2026-02-09
**進捗率**: 70%

---

## 📊 実装状況サマリー

| 機能 | 状況 | ファイル |
|------|------|---------|
| 記事一覧ページ | ✅ 完了 | `src/app/(public)/posts/page.tsx` |
| 記事詳細ページ | ⏳ 未実装 | `src/app/(public)/posts/[slug]/page.tsx` |
| 記事作成画面（エディタ） | ✅ 完了 | `src/app/(admin)/admin/posts/new/page.tsx` |
| 記事作成（保存処理） | ⏳ 未実装 | Server Actions未実装 |
| 記事一覧（管理画面） | 🟡 モックのみ | `src/app/(admin)/admin/posts/page.tsx` |
| 記事編集画面 | ⏳ 未実装 | `src/app/(admin)/admin/posts/[id]/page.tsx` |
| 記事削除機能 | ⏳ 未実装 | Server Actions未実装 |

---

## ✅ 実装完了機能

### 1. 記事一覧ページ（公開側）

**ファイル**: `src/app/(public)/posts/page.tsx`

#### 実装機能
- ✅ 記事一覧表示（10件/ページ）
- ✅ タグフィルタリング（AND検索 - 複数タグ選択可能）
- ✅ 検索機能（タイトル・抜粋・本文）
- ✅ ページネーション（省略記号付き）
- ✅ ソート機能（最新順・古い順・人気順）
- ✅ 結果サマリー表示（「10件中1-10件を表示」）
- ✅ Suspenseによる段階的レンダリング

#### 使用コンポーネント
- `PostsList` - 記事一覧表示（Server Component）
- `PostsFilter` - タグフィルタ・検索（Client Component）
- `Pagination` - ページネーション（Client Component）

#### 使用Server Actions
```typescript
// 記事一覧取得
const result = await getPosts({
  page: Number(searchParams.page) || 1,
  tags: searchParams.tags?.split(',') || [],
  search: searchParams.search || '',
  limit: 10,
  sort: 'latest'
})

// タグ一覧取得
const tags = await getTagsWithCount()
```

#### URLパラメータ
- `?page=1` - ページ番号
- `?tags=nextjs,react` - タグフィルタ（カンマ区切り、AND検索）
- `?search=TypeScript` - 検索キーワード
- `?sort=popular` - ソート順（latest/oldest/popular）

#### エラーハンドリング
- タグが0件の場合は何も表示しない
- 記事が0件の場合は「記事が見つかりませんでした」と表示
- フィルタクリア機能を提供

#### パフォーマンス最適化
- Server ActionsによるServer-side データフェッチ
- Suspenseによる段階的レンダリング
- useTransitionによる非同期UI更新
- デバウンス処理（検索: 500ms）

---

### 2. 記事作成画面（エディタ）

**ファイル**: `src/app/(admin)/admin/posts/new/page.tsx`

#### 実装機能
- ✅ タイトル入力欄
- ✅ 抜粋（excerpt）入力欄
- ✅ タグ入力（カンマ区切り）
- ✅ カテゴリ選択
- ✅ 公開状態選択（下書き/公開/限定公開）
- ✅ Tiptapエディタ（全機能実装済み）
  - リッチテキスト編集
  - 画像挿入・リサイズ
  - 二段組レイアウト
  - テーブル挿入・削除
  - コードブロック（シンタックスハイライト）
  - YouTube埋め込み
  - リンク挿入
  - チェックリスト
- ✅ プレビュー機能（別タブで開く）
- ⏳ 保存処理（未実装）

#### 使用コンポーネント
- `TiptapEditor` - メインエディタ
- `EditorToolbar` - ツールバー
- `PreviewModal` - プレビュー機能
- `ResizableImage` - リサイズ可能画像
- `ColumnLayout` - 二段組レイアウト
- `TableWithDelete` - 削除可能テーブル

---

## ⏳ 未実装機能

### 1. 記事詳細ページ（公開側）

**ファイル**: `src/app/(public)/posts/[slug]/page.tsx`（未作成）

#### 実装予定機能
- ⏳ 記事本文表示（Tiptap JSONレンダリング）
- ⏳ 目次自動生成（h2/h3から）
- ⏳ 関連記事表示（3件）
- ⏳ シェアボタン（Twitter/Facebook/Link）
- ⏳ 閲覧数・読了時間表示
- ⏳ カバー画像表示
- ⏳ OGP設定

#### 必要なServer Actions
```typescript
// 記事取得（閲覧数自動インクリメント）
const post = await getPostBySlug(params.slug)

// 関連記事取得
const relatedPosts = await getRelatedPosts(post.id, 3)
```

#### 必要なコンポーネント（未作成）
- `PostContent` - 記事本文表示（Tiptap JSONレンダリング）
- `TableOfContents` - 目次
- `ShareButtons` - シェアボタン
- `RelatedPosts` - 関連記事

#### 実装参考
- プロジェクト詳細ページ（`/works/[slug]`）の実装パターンを流用可能
- `ProjectContent` → `PostContent` として再利用
- `RelatedPosts` → そのまま流用可能

---

### 2. 記事作成・更新・削除（Server Actions）

**ファイル**: `src/lib/actions/posts.ts`（追加予定）

#### 実装予定機能

```typescript
// 記事作成
export interface CreatePostInput {
  title: string
  slug: string
  content: JSONContent
  excerpt: string | null
  status: 'draft' | 'scheduled' | 'published'
  published_at: string | null
  cover_image: string | null
  ogp_image: string | null
  tags: string[]  // Tag IDs
}

export async function createPost(input: CreatePostInput): Promise<PostWithTags | null>

// 記事更新
export async function updatePost(id: string, input: Partial<CreatePostInput>): Promise<PostWithTags | null>

// 記事削除
export async function deletePost(id: string): Promise<{ success: boolean; error?: string }>

// 画像アップロード
export async function uploadPostImage(file: File): Promise<string | null>  // URL返却
```

#### 実装ロジック
1. **バリデーション**: Zodスキーマで入力値検証
2. **スラッグ生成**: タイトルから自動生成（重複チェック）
3. **画像アップロード**: Supabase Storageにアップロード
4. **タグ紐付け**: `post_tags` テーブルに登録
5. **エラーハンドリング**: 失敗時はnull返却、コンソールにログ

#### 参考実装
- `src/lib/actions/projects.ts` の createProject(), updateProject(), deleteProject() をベースに実装

---

### 3. 記事一覧（管理画面）

**ファイル**: `src/app/(admin)/admin/posts/page.tsx`

#### 実装予定機能
- ⏳ 記事一覧表示（テーブル形式）
- ⏳ ステータスフィルタ（全て/下書き/公開済み/予約投稿）
- ⏳ 検索機能
- ⏳ ソート機能
- ⏳ 編集・削除機能
- ⏳ ページネーション

#### UI構成
```
┌─────────────────────────────────┐
│  フィルタ（ステータス・検索）      │
├─────────────────────────────────┤
│  記事一覧テーブル                 │
│  - タイトル                      │
│  - ステータス                    │
│  - 公開日                       │
│  - 編集/削除ボタン                │
└─────────────────────────────────┘
```

---

### 4. 記事編集画面

**ファイル**: `src/app/(admin)/admin/posts/[id]/page.tsx`（未作成）

#### 実装予定機能
- ⏳ 記事データ取得・表示
- ⏳ 記事作成画面と同じエディタUI
- ⏳ 更新処理
- ⏳ 削除処理

#### 必要なServer Actions
```typescript
// 記事取得（下書きも含む）
const post = await getPostById(params.id)

// 記事更新
const updated = await updatePost(params.id, data)

// 記事削除
await deletePost(params.id)
```

---

## 🎯 次のステップ

### 優先度: 高 🔥

#### 1. 記事詳細ページ実装（1-2日）

**ファイル**:
- `src/app/(public)/posts/[slug]/page.tsx`
- `src/components/posts/PostContent.tsx`
- `src/components/posts/TableOfContents.tsx`

**実装内容**:
1. ページレイアウト作成
2. PostContentコンポーネント作成（Tiptap JSONレンダリング）
3. 目次自動生成（h2/h3抽出）
4. 関連記事表示（既存のServer Action使用）
5. シェアボタン実装
6. OGP設定

**参考**:
- プロジェクト詳細ページ（`/works/[slug]`）の実装パターンを流用

---

#### 2. 記事作成のServer Actions実装（2-3日）

**ファイル**:
- `src/lib/actions/posts.ts`（追加）
- `src/lib/validations/post.ts`（Zodスキーマ）

**実装内容**:
1. createPost() 実装
2. updatePost() 実装
3. deletePost() 実装
4. uploadPostImage() 実装（Supabase Storage）
5. Zodバリデーション実装
6. エラーハンドリング

**参考**:
- `src/lib/actions/projects.ts` をベースに実装

---

#### 3. 記事作成画面の保存処理統合（1日）

**ファイル**:
- `src/app/(admin)/admin/posts/new/page.tsx`（更新）

**実装内容**:
1. フォーム送信処理
2. Server Actions呼び出し
3. 成功時の処理（リダイレクト、トースト表示）
4. エラー時の処理（エラーメッセージ表示）

---

### 優先度: 中 🟡

#### 4. 記事一覧（管理画面）実装（1-2日）

**ファイル**:
- `src/app/(admin)/admin/posts/page.tsx`（更新）
- `src/components/admin/PostsTable.tsx`

**実装内容**:
1. テーブルコンポーネント作成
2. ステータスフィルタ実装
3. 検索機能実装
4. 編集・削除ボタン実装
5. ページネーション実装

---

#### 5. 記事編集画面実装（1日）

**ファイル**:
- `src/app/(admin)/admin/posts/[id]/page.tsx`

**実装内容**:
1. 記事データ取得
2. エディタに初期値設定
3. 更新処理実装
4. 削除処理実装

---

### 優先度: 低 ⏸️

#### 6. 画像最適化・OGP画像自動生成

**ファイル**:
- `src/app/api/og/route.tsx`（Vercel OG Image）

**実装内容**:
1. OGP画像自動生成
2. 画像最適化処理（WebP変換）

---

## 📚 関連ドキュメント

### 設計書
- [データスキーマ](../lv2/data-schema.md) - Postsテーブル定義
- [Server Actions仕様](../lv2/api-spec.md) - getPosts(), getPostBySlug(), getRelatedPosts()
- [コンポーネント仕様](../lv3/component-spec.md) - PostsList, PostsFilter, Pagination

### 実装状況
- [全体概要](./00-overview.md)
- [エディタ機能](./07-editor-feature.md)
- [ページ別実装状況](./pages-implementation.md)

### 参考資料
- [記事機能実装ドキュメント](./POSTS_IMPLEMENTATION.md)（旧ファイル）

---

## 💡 実装のヒント

### 記事詳細ページの実装パターン

プロジェクト詳細ページ（`/works/[slug]`）と同じパターンで実装できます：

```typescript
// src/app/(public)/posts/[slug]/page.tsx

export default async function PostDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  // 記事取得
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  // 関連記事取得
  const relatedPosts = await getRelatedPosts(post.id, 3)

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-16 py-12">
      {/* ヘッダー */}
      <article>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>

        {/* 本文 */}
        <PostContent content={post.content} />

        {/* タグ */}
        <div className="flex gap-2">
          {post.tags.map(tag => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>
      </article>

      {/* 関連記事 */}
      <RelatedPosts posts={relatedPosts} />
    </div>
  )
}
```

### PostContentコンポーネントの実装パターン

```typescript
// src/components/posts/PostContent.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from '@/components/editor/extensions'

export function PostContent({ content }: { content: JSONContent }) {
  const editor = useEditor({
    extensions,
    content,
    editable: false,
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className="prose prose-lg max-w-none">
      <EditorContent editor={editor} />
    </div>
  )
}
```

---

**最終更新**: 2026-02-09
**次回更新予定**: 記事詳細ページ実装完了時
