# 作ったもの詳細ページ・管理機能 実装プラン

**作成日**: 2026-02-08
**対象機能**: プロジェクト詳細ページ（/works/[slug]）および管理画面

---

## 📋 実装概要

### 採用仕様
**案③：テクニカル・ショーケース型** を実装します。

### 実装範囲
1. プロジェクト詳細ページ（公開側）
2. プロジェクト作成・編集画面（管理側）
3. データスキーマ拡張
4. Server Actions実装（CRUD）

---

## 1. データスキーマ拡張

### 1.1 追加カラム

`projects` テーブルに以下のカラムを追加します。

```sql
-- マイグレーションファイル: supabase/migrations/20260208_add_project_showcase_fields.sql

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS steps_count INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS used_ai JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT NULL;

COMMENT ON COLUMN projects.steps_count IS 'おおよその開発規模（ステップ数）';
COMMENT ON COLUMN projects.used_ai IS '使用した生成AI（配列: ["Claude Sonnet 4.5", "GitHub Copilot"]）';
COMMENT ON COLUMN projects.gallery_images IS 'ギャラリー画像URL配列';
COMMENT ON COLUMN projects.tech_stack IS '技術スタック・言語使用率（例: {"TypeScript": 45.2, "CSS": 30.1, ...}）';
```

### 1.2 TypeScript型定義の更新

**ファイル**: `src/types/database.ts`

```typescript
export interface Project {
  id: string
  title: string
  slug: string
  description: string
  content: JSONContent | null
  demo_url: string | null
  github_url: string | null
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  status: 'completed' | 'archived'

  // 新規追加フィールド
  steps_count: number | null              // 開発規模（ステップ数）
  used_ai: string[] | null                // 使用した生成AI（例: ["Claude Sonnet 4.5"]）
  gallery_images: string[] | null         // ギャラリー画像URL配列
  tech_stack: Record<string, number> | null  // 技術スタック（言語: 使用率%）

  created_at: string
  updated_at: string
}
```

---

## 2. プロジェクト詳細ページ実装

### 2.1 ページ構成

**ファイル**: `src/app/(public)/works/[slug]/page.tsx`

```
┌─────────────────────────────────────────────────┐
│  ヘッダー基本情報（実績の定量化）                  │
│  - タイトル・説明                                │
│  - 開発期間（start_date - end_date）              │
│  - 開発規模（steps_count）                        │
│  - 使用した生成AI（used_ai）                      │
│  - リリースページURL（demo_url）                  │
├─────────────────────────────────────────────────┤
│  ビジュアルセクション（横スクロールギャラリー）     │
│  - gallery_images を横スクロール表示              │
│  - 画像クリックで拡大表示（Lightbox）             │
├──────────────────────────────┬──────────────────┤
│  本文コンテンツ                │  技術分析         │
│  (Tiptap JSON レンダリング)     │  (円グラフ)       │
│                              │  tech_stack表示   │
│                              │                  │
├──────────────────────────────┴──────────────────┤
│  タグ・シェアボタン                                │
├─────────────────────────────────────────────────┤
│  関連記事（動的レコメンド）                        │
│  - タグ類似度または新着順で3件表示                 │
└─────────────────────────────────────────────────┘
```

### 2.2 必要なコンポーネント

#### 新規作成

1. **`ProjectGallery.tsx`** - 横スクロールギャラリー
   - 画像の横スクロール表示
   - 画像クリックで拡大表示（Lightbox）
   - レスポンシブ対応

2. **`TechStackChart.tsx`** - 技術スタック円グラフ
   - `tech_stack`データを円グラフで表示
   - Recharts or Chart.js使用
   - カラフルな可視化

3. **`ProjectContent.tsx`** - プロジェクト本文表示
   - Tiptap JSONのレンダリング
   - Postsの`PostContent`コンポーネントと同様のロジック

4. **`RelatedPosts.tsx`** - 関連記事表示
   - 3記事をカード形式で表示
   - タグ類似度でソート

#### 既存コンポーネント流用

- `Badge` - タグ表示
- `Button` - 外部リンクボタン
- `Card` - セクション区切り
- `Separator` - 区切り線

### 2.3 Server Actions

**ファイル**: `src/lib/actions/projects.ts`（既存）

```typescript
// 既存の getProjectBySlug() をそのまま使用
// 新規フィールドも自動的に取得される
```

**ファイル**: `src/lib/actions/posts.ts`（既存）

```typescript
// 関連記事取得（ランダム性を考慮）
export async function getRelatedPostsByTags(tagIds: string[], limit: number = 3): Promise<PostWithTags[]>
```

---

## 3. プロジェクト管理画面実装

### 3.1 プロジェクト一覧ページ

**ファイル**: `src/app/(admin)/admin/projects/page.tsx`

#### 機能
- プロジェクト一覧表示（テーブル形式）
- ステータスフィルタ（完了済み/アーカイブ）
- 新規作成ボタン
- 編集・削除ボタン

### 3.2 プロジェクト作成ページ

**ファイル**: `src/app/(admin)/admin/projects/new/page.tsx`

#### 入力フォーム

```
┌─────────────────────────────────────────────────┐
│  基本情報                                        │
│  - タイトル（title）                             │
│  - スラッグ（slug）                              │
│  - 説明（description）                           │
│  - 開始日（start_date）                          │
│  - 終了日（end_date）                            │
│  - ステータス（status）                          │
├─────────────────────────────────────────────────┤
│  実績情報                                        │
│  - 開発規模（steps_count）                       │
│  - 使用した生成AI（used_ai）- 複数選択可能        │
│  - デモURL（demo_url）                           │
│  - GitHubリポジトリURL（github_url）              │
├─────────────────────────────────────────────────┤
│  ビジュアル                                      │
│  - カバー画像（cover_image）- アップロード         │
│  - ギャラリー画像（gallery_images）- 複数枚        │
├─────────────────────────────────────────────────┤
│  技術スタック                                    │
│  - 言語・使用率入力（tech_stack）                 │
│    例: TypeScript: 45.2%, CSS: 30.1%            │
├─────────────────────────────────────────────────┤
│  詳細説明（Tiptapエディタ）                       │
│  - content（JSONContent）                        │
│  - 記事作成と同じエディタを流用                   │
├─────────────────────────────────────────────────┤
│  タグ設定                                        │
│  - タグ選択（複数選択可能）                       │
├─────────────────────────────────────────────────┤
│  プレビュー | 下書き保存 | 公開                   │
└─────────────────────────────────────────────────┘
```

#### 使用コンポーネント

- `TiptapEditor` - 記事作成と同じエディタ（流用）
- `Input` - 基本入力フィールド
- `Textarea` - 説明入力
- `Select` - ステータス選択
- `MultiSelect` or `Combobox` - タグ選択
- `ImageUploader` - 画像アップロード（複数枚対応）
- `TechStackInput` - 技術スタック入力（カスタムコンポーネント）

### 3.3 プロジェクト編集ページ

**ファイル**: `src/app/(admin)/admin/projects/[id]/page.tsx`

- 作成ページと同じUI
- データ取得して初期値を設定
- 更新処理を実装

---

## 4. Server Actions実装（CRUD）

### 4.1 Create

**ファイル**: `src/lib/actions/projects.ts`

```typescript
export interface CreateProjectInput {
  title: string
  slug: string
  description: string
  content: JSONContent | null
  demo_url: string | null
  github_url: string | null
  cover_image: string | null
  start_date: string | null
  end_date: string | null
  status: 'completed' | 'archived'
  steps_count: number | null
  used_ai: string[] | null
  gallery_images: string[] | null
  tech_stack: Record<string, number> | null
  tags: string[]  // Tag IDs
}

export async function createProject(input: CreateProjectInput): Promise<ProjectWithTags | null>
```

### 4.2 Update

```typescript
export async function updateProject(id: string, input: Partial<CreateProjectInput>): Promise<ProjectWithTags | null>
```

### 4.3 Delete

```typescript
export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }>
```

---

## 5. コンポーネント詳細仕様

### 5.1 ProjectGallery

**ファイル**: `src/components/projects/ProjectGallery.tsx`

```typescript
interface ProjectGalleryProps {
  images: string[]  // 画像URL配列
  alt: string       // alt属性
}
```

#### 機能
- 横スクロール可能なギャラリー
- 画像クリックで拡大表示（Lightboxダイアログ）
- 左右矢印ボタンでスクロール
- インジケーター表示（現在の画像位置）

#### 実装技術
- `useRef` でスクロールコンテナ参照
- `Dialog` (shadcn/ui) でLightbox実装
- スムーズスクロール（`scrollBehavior: 'smooth'`）

---

### 5.2 TechStackChart

**ファイル**: `src/components/projects/TechStackChart.tsx`

```typescript
interface TechStackChartProps {
  data: Record<string, number>  // 例: {"TypeScript": 45.2, "CSS": 30.1}
}
```

#### 機能
- 円グラフで技術スタックを可視化
- 各セクションに言語名・パーセンテージ表示
- レスポンシブサイズ調整

#### 実装技術
- **Recharts** - Reactチャートライブラリ
  - `npm install recharts`
  - `PieChart`, `Pie`, `Cell`, `Tooltip`, `Legend`使用

#### 代替案
- **Chart.js** + `react-chartjs-2`
- **SVG手動実装**（軽量だが複雑）

**推奨**: Recharts（Reactフレンドリー、型安全）

---

### 5.3 ProjectContent

**ファイル**: `src/components/projects/ProjectContent.tsx`

```typescript
interface ProjectContentProps {
  content: JSONContent
}
```

#### 機能
- Tiptap JSONをHTMLレンダリング
- Proseスタイル適用（記事と同じスタイル）

#### 実装
- `generateHTML()` from `@tiptap/html`
- `dangerouslySetInnerHTML` でレンダリング
- または `EditorContent` (editable=false)

**Posts の PostContent と同じロジックを流用**

---

### 5.4 RelatedPosts

**ファイル**: `src/components/projects/RelatedPosts.tsx`

```typescript
interface RelatedPostsProps {
  projectId: string
  limit?: number
}
```

#### 機能
- プロジェクトのタグに基づいて関連記事を取得
- カード形式で3件表示
- 「もっと見る」リンク（/posts へ遷移）

#### データ取得
```typescript
// タグIDを取得
const project = await getProjectBySlug(slug)
const tagIds = project.tags.map(t => t.id)

// 関連記事を取得
const relatedPosts = await getRelatedPostsByTags(tagIds, 3)
```

---

### 5.5 TechStackInput（管理画面用）

**ファイル**: `src/components/admin/TechStackInput.tsx`

```typescript
interface TechStackInputProps {
  value: Record<string, number>
  onChange: (value: Record<string, number>) => void
}
```

#### 機能
- 言語名と使用率を入力
- 動的に行を追加・削除
- 合計が100%になるようバリデーション

#### UI
```
言語名         使用率 (%)        削除
[ TypeScript ] [ 45.2 ]         [×]
[ CSS        ] [ 30.1 ]         [×]
[ HTML       ] [ 24.7 ]         [×]
[+ 追加]

合計: 100.0%
```

---

## 6. ナビゲーション・リンク

### 6.1 プロジェクト一覧 → 詳細ページ

**ファイル**: `src/app/(public)/works/page.tsx`（既存）

- カード全体を `<Link>` でラップ
- href: `/works/${project.slug}`

```tsx
<Link href={`/works/${project.slug}`} className="block">
  <Card>...</Card>
</Link>
```

### 6.2 進行中のこと → 完了済みプロジェクト詳細

**ファイル**: `src/app/(public)/progress/page.tsx`（既存）

- 完了ステータスのアイテムに「プロジェクト詳細を見る」リンクを追加

```tsx
{item.status === 'completed' && item.completedProject && (
  <Button asChild variant="outline" size="sm">
    <Link href={`/works/${item.completedProject.slug}`}>
      詳細を見る
    </Link>
  </Button>
)}
```

---

## 7. 画像アップロード機能

### 7.1 複数画像アップロード

**ファイル**: `src/components/admin/ImageUploadMultiple.tsx`

```typescript
interface ImageUploadMultipleProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number  // デフォルト: 10
}
```

#### 機能
- ドラッグ&ドロップ対応
- 複数枚選択可能
- プレビュー表示
- 並び替え（ドラッグ&ドロップ）
- 個別削除ボタン

#### 実装技術
- `react-dropzone` or HTML5 File API
- Supabase Storage へアップロード
- プログレスバー表示

---

## 8. 関連記事取得ロジック

### 8.1 タグベースのレコメンド

**ファイル**: `src/lib/actions/posts.ts`（追加）

```typescript
export async function getRelatedPostsByTags(
  tagIds: string[],
  limit: number = 3
): Promise<PostWithTags[]> {
  const supabase = createServerClient()

  // タグが一致する記事を取得
  const { data: postTagData } = await supabase
    .from('post_tags')
    .select('post_id')
    .in('tag_id', tagIds)

  if (!postTagData || postTagData.length === 0) {
    // タグが一致しない場合は最新記事を返す
    return getPosts({ limit, sort: 'latest' }).then(r => r.posts)
  }

  // 一致数でソート
  const postCounts = postTagData.reduce((acc, pt) => {
    acc[pt.post_id] = (acc[pt.post_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedPostIds = Object.entries(postCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([postId]) => postId)

  // 記事データ取得
  const { data } = await supabase
    .from('posts')
    .select(`*, tags:post_tags(tag:tags(*))`)
    .in('id', sortedPostIds)
    .eq('status', 'published')

  return (data || []).map(post => ({
    ...post,
    tags: post.tags.map((pt: any) => pt.tag).filter(Boolean),
  }))
}
```

---

## 9. 実装順序

### フェーズ1: データ準備（1日）
1. ✅ マイグレーションファイル作成
2. ✅ TypeScript型定義更新
3. ✅ シードデータ更新（追加フィールドに対応）

### フェーズ2: Server Actions（1日）
1. ✅ `createProject()` 実装
2. ✅ `updateProject()` 実装
3. ✅ `deleteProject()` 実装
4. ✅ `getRelatedPostsByTags()` 実装

### フェーズ3: 詳細ページ実装（2日）
1. ✅ `ProjectGallery` コンポーネント
2. ✅ `TechStackChart` コンポーネント（Recharts統合）
3. ✅ `ProjectContent` コンポーネント
4. ✅ `RelatedPosts` コンポーネント
5. ✅ `/works/[slug]/page.tsx` 実装

### フェーズ4: 管理画面実装（2日）
1. ✅ `ImageUploadMultiple` コンポーネント
2. ✅ `TechStackInput` コンポーネント
3. ✅ プロジェクト一覧ページ
4. ✅ プロジェクト作成ページ
5. ✅ プロジェクト編集ページ

### フェーズ5: リンク・ナビゲーション（0.5日）
1. ✅ プロジェクト一覧カードにリンク追加
2. ✅ 進行中のこと → プロジェクト詳細リンク追加

### フェーズ6: テスト・最適化（0.5日）
1. ✅ レスポンシブ確認
2. ✅ Lightbox動作確認
3. ✅ チャート表示確認
4. ✅ 関連記事表示確認

**合計工数**: 約7日

---

## 10. 必要なパッケージ

```bash
# Rechartsインストール
npm install recharts

# 画像アップロード（既存のSupabaseクライアント使用）
# 追加パッケージ不要

# 画像最適化（オプション）
npm install browser-image-compression
```

---

## 11. 注意点・制約事項

### データ整合性
- `tech_stack` の合計値が100%を超えないようバリデーション
- `used_ai` は配列形式で統一（例: `["Claude Sonnet 4.5", "GitHub Copilot"]`）
- `gallery_images` は最大10枚まで

### パフォーマンス
- ギャラリー画像は遅延読み込み（Lazy Loading）
- Next.js Image コンポーネント使用（最適化）
- 円グラフはSSRで事前レンダリング

### セキュリティ
- 画像アップロードはファイルサイズ制限（最大5MB/枚）
- 許可された画像形式のみ（jpg, png, webp）
- URLバリデーション（demo_url, github_url）

---

## 12. 実装後の設計書更新

### 更新対象ドキュメント

1. **`docs/specs/data-schema.md`**
   - `projects` テーブル定義に新規カラム追加
   - `Project` 型定義更新

2. **`docs/specs/api-spec.md`**
   - `createProject()`, `updateProject()`, `deleteProject()` 追加
   - `getRelatedPostsByTags()` 追加

3. **`docs/specs/component-spec.md`**
   - `ProjectGallery`, `TechStackChart`, `ProjectContent`, `RelatedPosts` 追加

4. **`docs/implementation/_archive/pages-implementation.md`**
   - `/works/[slug]` ページ追加
   - `/admin/projects/*` ページ更新

5. **`docs/implementation/_archive/implementation-status.md`**
   - プロジェクト管理機能の実装状況更新

---

## 13. 質問事項

実装前に以下の点を確認させてください。

### [WORK-001] 円グラフライブラリの選定
Rechartsを推奨していますが、他の選択肢も検討しますか？
- **A. Recharts**（推奨 - Reactフレンドリー、型安全）
- B. Chart.js + react-chartjs-2（軽量、柔軟）
- C. SVG手動実装（依存なし、カスタマイズ自由）

### [WORK-002] ギャラリーのLightbox実装
画像拡大表示の実装方法を選択してください。
- **A. shadcn/ui Dialog**（推奨 - 既存コンポーネント活用）
- B. yet-another-react-lightbox（専用ライブラリ、高機能）
- C. カスタム実装（シンプル、軽量）

### [WORK-003] 技術スタック入力UI
管理画面での技術スタック入力方法を選択してください。
- **A. 動的フォーム**（行追加・削除、自由入力）
- B. プリセット選択 + 手動入力（言語リストから選択）
- C. JSON直接入力（開発者向け、シンプル）

### [WORK-004] 画像アップロード上限
ギャラリー画像の上限枚数を設定してください。
- A. 5枚（推奨 - パフォーマンス重視）
- **B. 10枚**（バランス）
- C. 無制限（柔軟性重視）

### [WORK-005] 関連記事の表示ロジック
関連記事が見つからない場合の表示方法を選択してください。
- **A. 最新記事を表示**（推奨 - 常に3件表示）
- B. 「関連記事なし」メッセージ表示
- C. ランダムに3件表示

---

**以上が実装プランです。ご承認いただけましたら、実装を開始します。**

**変更・追加要望があればお知らせください。**
