# 作ったもの（Projects）機能 実装状況

プロジェクトの一覧・詳細・作成・編集機能の実装状況です。

**最終更新**: 2026-02-09
**進捗率**: 90%

---

## 📊 実装状況サマリー

| 機能 | 状況 | ファイル |
|------|------|---------|
| プロジェクト一覧ページ | ✅ 完了 | `src/app/(public)/works/page.tsx` |
| プロジェクト詳細ページ | ✅ 完了 | `src/app/(public)/works/[slug]/page.tsx` |
| プロジェクト管理一覧 | ✅ 完了 | `src/app/(admin)/admin/projects/page.tsx` |
| プロジェクト作成画面 | ⏳ 未実装 | `src/app/(admin)/admin/projects/new/page.tsx` |
| プロジェクト編集画面 | ⏳ 未実装 | `src/app/(admin)/admin/projects/[id]/page.tsx` |
| Server Actions CRUD | ✅ 完了 | `src/lib/actions/projects.ts` |

---

## ✅ 実装完了機能

### 1. プロジェクト一覧ページ（公開側）

**ファイル**: `src/app/(public)/works/page.tsx`

#### 実装機能
- ✅ プロジェクト一覧表示（カードギャラリー）
- ✅ タグフィルタリング（AND検索）
- ✅ ステータスフィルタ（完了済み/アーカイブ）
- ✅ レスポンシブグリッド（sm: 1列、md: 2列、lg: 3列）
- ✅ カードホバーエフェクト
- ✅ デモURL・GitHubリンク表示
- ✅ DB連携済み

#### 使用コンポーネント
- `ProjectsFilter` - タグフィルタ（Client Component）
- `ProjectCard` - プロジェクトカード（Client Component）

#### 使用Server Actions
```typescript
// プロジェクト一覧取得
const projects = await getProjects({
  status: 'completed',
  tags: searchParams.tags?.split(',') || []
})

// タグ一覧取得
const tags = await getTagsWithCount()
```

---

### 2. プロジェクト詳細ページ（公開側）

**ファイル**: `src/app/(public)/works/[slug]/page.tsx`

#### 実装機能（2026-02-08実装完了）
- ✅ プロジェクト基本情報表示（タイトル・説明・期間）
- ✅ 実績の定量化
  - 開発期間（start_date - end_date）
  - 開発規模（steps_count）
  - 使用した生成AI（used_ai）
  - リリースページURL（demo_url）
- ✅ 横スクロールギャラリー（ProjectGallery）
  - 画像クリックで拡大表示（Lightbox）
  - 左右矢印ボタンでスクロール
  - インジケーター表示（スクロール連動）
- ✅ 技術スタック円グラフ（TechStackChart）
  - Chart.js Doughnut Chart使用
  - 各セクションに言語名・パーセンテージ表示
- ✅ 本文コンテンツ（ProjectContent）
  - Tiptap JSONレンダリング
  - Proseスタイル適用
- ✅ 関連記事表示（RelatedPosts）
  - タグ類似度 + ランダマイズで3件表示
  - 「もっと見る」リンク
- ✅ OGP設定（タイトル・説明）
- ✅ カバー画像表示

#### エラー修正完了（2026-02-09）
- ✅ **Hydration Error 修正**
  - 問題: `<Link>` 内に `<a>` タグがネストされていた
  - 解決: ProjectCard を Client Component 化、`useRouter` でプログラマティック遷移
- ✅ **外部画像ドメイン設定**
  - next.config.ts に `remotePatterns` 追加（placehold.co, *.supabase.co）
- ✅ **Dialog アクセシビリティ対応**
  - ProjectGallery に `DialogTitle` + `VisuallyHidden` 追加
- ✅ **ギャラリーインジケーター連動機能**
  - scroll イベント + `getBoundingClientRect()` で位置ベース検出
  - スクロールに連動してインジケーター（点々）が自動更新

#### 使用コンポーネント
- `ProjectGallery` - 横スクロールギャラリー + Lightbox（Client Component）
- `TechStackChart` - Chart.js円グラフ（Client Component）
- `ProjectContent` - Tiptap JSONレンダリング（Client Component）
- `RelatedPosts` - 関連記事表示（Server Component）
- `Card`, `Badge`, `Button`, `Separator` - shadcn/ui

#### 使用Server Actions
```typescript
// プロジェクト取得
const project = await getProjectBySlug(params.slug)

// 関連記事取得（内部処理）
const tagIds = project.tags.map(t => t.id)
const relatedPosts = await getRelatedPostsByTagsWithRandom(tagIds, 3)
```

---

### 3. プロジェクト管理一覧（管理画面）

**ファイル**: `src/app/(admin)/admin/projects/page.tsx`

#### 実装機能（2026-02-08実装完了）
- ✅ プロジェクト一覧表示（カード形式）
- ✅ 新規作成ボタン
- ✅ 編集ボタン（/admin/projects/[id]）
- ✅ 外部リンクボタン（demo_url）
- ✅ タグ表示（最大5件）
- ✅ 開発期間表示

#### 使用Server Actions
```typescript
const projects = await getProjects({ status: 'completed' })
```

---

### 4. Server Actions CRUD

**ファイル**: `src/lib/actions/projects.ts`

#### 実装済み（2026-02-08実装完了）

```typescript
// プロジェクト作成
export async function createProject(input: CreateProjectInput): Promise<ProjectWithTags | null>

// プロジェクト更新
export async function updateProject(id: string, input: Partial<CreateProjectInput>): Promise<ProjectWithTags | null>

// プロジェクト削除
export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }>

// プロジェクト取得
export async function getProjects(params?: GetProjectsParams): Promise<ProjectWithTags[]>
export async function getProjectBySlug(slug: string): Promise<ProjectWithTags | null>
```

#### CreateProjectInput型定義
```typescript
interface CreateProjectInput {
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
  steps_count: number | null              // 開発規模（ステップ数）
  used_ai: string[] | null                // 使用した生成AI
  gallery_images: string[] | null         // ギャラリー画像URL配列
  tech_stack: Record<string, number> | null  // 技術スタック（言語: 使用率%）
  tags: string[]  // Tag IDs
}
```

---

## ⏳ 未実装機能

### 1. プロジェクト作成画面

**ファイル**: `src/app/(admin)/admin/projects/new/page.tsx`（未作成）

#### 実装予定機能
- ⏳ プロジェクト作成フォーム
- ✅ TechStackInput コンポーネント（準備完了）
- ✅ ImageUploadMultiple コンポーネント（準備完了）
- ✅ Tiptapエディタ（記事作成と同じエディタを流用）
- ⏳ 保存処理（createProject() 使用）

#### フォーム構成
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
│  技術スタック（TechStackInput）                  │
│  - 言語・使用率入力                              │
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

#### 使用コンポーネント（準備完了）
- `TechStackInput` - 技術スタック入力（動的フォーム）
- `ImageUploadMultiple` - 複数画像アップロード
- `TiptapEditor` - 本文エディタ（記事作成と同じ）
- `Input`, `Textarea`, `Select`, `MultiSelect` - shadcn/ui

---

### 2. プロジェクト編集画面

**ファイル**: `src/app/(admin)/admin/projects/[id]/page.tsx`（未作成）

#### 実装予定機能
- ⏳ プロジェクトデータ取得・表示
- ⏳ プロジェクト作成画面と同じUI
- ⏳ 更新処理
- ⏳ 削除処理

#### 必要なServer Actions
```typescript
// プロジェクト取得（IDから）
const project = await getProjectById(params.id)

// プロジェクト更新
const updated = await updateProject(params.id, data)

// プロジェクト削除
await deleteProject(params.id)
```

---

## 🎯 次のステップ

### 優先度: 中 🟡

#### 1. プロジェクト作成フォーム実装（2-3日）

**ファイル**:
- `src/app/(admin)/admin/projects/new/page.tsx`

**実装内容**:
1. フォームレイアウト作成
2. TechStackInput統合
3. ImageUploadMultiple統合
4. Tiptapエディタ統合
5. フォーム送信処理
6. Server Actions呼び出し（createProject()）
7. 成功時の処理（リダイレクト、トースト表示）
8. エラー時の処理

**参考**:
- 記事作成画面（`/admin/posts/new`）の実装パターンを流用

---

#### 2. プロジェクト編集フォーム実装（1日）

**ファイル**:
- `src/app/(admin)/admin/projects/[id]/page.tsx`

**実装内容**:
1. プロジェクトデータ取得
2. エディタに初期値設定
3. 更新処理実装
4. 削除処理実装

---

### 優先度: 低 ⏸️

#### 3. 画像アップロード機能実装（1-2日）

**ファイル**:
- `src/lib/actions/images.ts`

**実装内容**:
1. Supabase Storageへのアップロード
2. クライアント側WebP変換（browser-image-compression）
3. 画像リサイズ・最適化
4. プログレス表示

---

## 📚 コンポーネント詳細

### ProjectGallery（実装済み）

**ファイル**: `src/components/projects/ProjectGallery.tsx`

```typescript
interface ProjectGalleryProps {
  images: string[]  // 画像URL配列
  alt: string       // alt属性
}
```

#### 機能
- ✅ 横スクロール可能なギャラリー
- ✅ 画像クリックで拡大表示（Lightboxダイアログ）
- ✅ 左右矢印ボタンでスクロール
- ✅ インジケーター表示（スクロール連動）
- ✅ スムーズスクロール（`scrollBehavior: 'smooth'`）
- ✅ アクセシビリティ対応（DialogTitle + VisuallyHidden）

#### 実装技術
- `useRef` でスクロールコンテナ・各画像要素の参照管理
- `Dialog` + `DialogTitle` + `VisuallyHidden` (shadcn/ui + Radix UI)
- `useState` で現在の画像インデックス管理
- **scroll イベント + 位置ベース検出**でインジケーター自動更新
  - `getBoundingClientRect()` で各画像の実際の位置を取得
  - 画像中央とコンテナ中央の距離を計算
  - 最も近い画像のインデックスを設定
  - 100ms デバウンスで snap スクロール完了を待つ
- `Image` (Next.js) で最適化

---

### TechStackChart（実装済み）

**ファイル**: `src/components/projects/TechStackChart.tsx`

```typescript
interface TechStackChartProps {
  data: Record<string, number>  // 例: {"TypeScript": 45.2, "CSS": 30.1}
}
```

#### 機能
- ✅ 円グラフ（Doughnut Chart）で技術スタックを可視化
- ✅ 各セクションに言語名・パーセンテージ表示
- ✅ レスポンシブサイズ調整
- ✅ ツールチップ表示

#### 実装技術
- **Chart.js** + **react-chartjs-2**
- `Doughnut` コンポーネント
- カラーパレット（8色）自動適用

---

### TechStackInput（準備完了）

**ファイル**: `src/components/admin/TechStackInput.tsx`

```typescript
interface TechStackInputProps {
  value: Record<string, number>
  onChange: (value: Record<string, number>) => void
}
```

#### 機能
- ✅ 言語名と使用率を動的入力
- ✅ 行の追加・削除
- ✅ 合計100%バリデーション
- ✅ リアルタイム更新

#### UI
```
言語名         使用率 (%)        削除
[ TypeScript ] [ 45.2 ]         [×]
[ CSS        ] [ 30.1 ]         [×]
[+ 追加]

合計: 100.0%
```

---

### ImageUploadMultiple（準備完了）

**ファイル**: `src/components/admin/ImageUploadMultiple.tsx`

```typescript
interface ImageUploadMultipleProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number  // デフォルト: 10
}
```

#### 機能
- ✅ ドラッグ&ドロップ対応
- ✅ 複数枚選択可能
- ✅ プレビュー表示
- ✅ 並び替え（ドラッグ&ドロップ）
- ✅ 個別削除ボタン
- ✅ ファイルサイズ制限（最大5MB/枚）
- ✅ 画像形式制限（jpg, png, webp）

---

## 📝 データスキーマ

### Projectsテーブル（拡張済み）

```sql
-- 新規追加フィールド（2026-02-08実装）
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS steps_count INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS used_ai JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT NULL;
```

### TypeScript型定義

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
  used_ai: string[] | null                // 使用した生成AI
  gallery_images: string[] | null         // ギャラリー画像URL配列
  tech_stack: Record<string, number> | null  // 技術スタック（言語: 使用率%）

  created_at: string
  updated_at: string
}
```

---

## 💡 実装のヒント

### プロジェクト作成画面の実装パターン

記事作成画面と同じパターンで実装できます：

```typescript
// src/app/(admin)/admin/projects/new/page.tsx
'use client'

import { useState } from 'react'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { TechStackInput } from '@/components/admin/TechStackInput'
import { ImageUploadMultiple } from '@/components/admin/ImageUploadMultiple'
import { createProject } from '@/lib/actions/projects'
import { toast } from 'sonner'

export default function ProjectNewPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: null,
    demo_url: '',
    github_url: '',
    cover_image: '',
    start_date: '',
    end_date: '',
    status: 'completed',
    steps_count: null,
    used_ai: [],
    gallery_images: [],
    tech_stack: {},
    tags: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await createProject(formData)

    if (result) {
      toast.success('プロジェクトを作成しました')
      router.push('/admin/projects')
    } else {
      toast.error('プロジェクトの作成に失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 基本情報 */}
      <Input
        label="タイトル"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />

      {/* 技術スタック */}
      <TechStackInput
        value={formData.tech_stack}
        onChange={(value) => setFormData({ ...formData, tech_stack: value })}
      />

      {/* ギャラリー画像 */}
      <ImageUploadMultiple
        images={formData.gallery_images}
        onChange={(images) => setFormData({ ...formData, gallery_images: images })}
      />

      {/* エディタ */}
      <TiptapEditor
        content={formData.content}
        onChange={(content) => setFormData({ ...formData, content })}
      />

      <Button type="submit">作成</Button>
    </form>
  )
}
```

---

## 🔗 関連ドキュメント

### 設計書
- [データスキーマ](../lv2/data-schema.md) - Projectsテーブル定義
- [Server Actions仕様](../lv2/api-spec.md) - createProject(), updateProject(), deleteProject()
- [コンポーネント仕様](../lv3/component-spec.md) - ProjectGallery, TechStackChart, etc.

### 実装状況
- [全体概要](./00-overview.md)
- [エディタ機能](./07-editor-feature.md)
- [ページ別実装状況](./pages-implementation.md)

### 参考資料
- [プロジェクト詳細実装プラン](./works-implementation-plan.md)（旧ファイル）

---

**最終更新**: 2026-02-09
**次回更新予定**: プロジェクト作成・編集フォーム実装完了時
