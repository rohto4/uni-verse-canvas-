# Component Specification (Claude Reference)

## 1. 設計方針
- Atomic Design部分採用（ui/feature/page層）
- Props型安全性: TypeScript厳密定義
- shadcn/ui: 基本UIコンポーネント全採用

## 2. ディレクトリ構成
```
components/
├── ui/          # shadcn/ui (Button, Card, Dialog, Input, Select, Tabs, Badge, Toast等)
├── layout/      # Header, Footer, AdminSidebar
├── editor/      # TiptapEditor, EditorToolbar, extensions/
├── posts/       # PostsList, PostsFilter, Pagination, PostContent, TableOfContents, ShareButtons
├── projects/    # ProjectCard, ProjectGallery, ProjectContent, TechStackChart, RelatedPosts
├── admin/       # BackupClient, PostEditorClient, ProjectEditorClient, InProgressList, AboutPageForm, LinksPageForm
└── common/      # AccentCard, GradientAccent
```

## 3. 主要コンポーネントProps

### Layout
```typescript
interface HeaderProps { className?: string }
interface NavigationProps { items?: { label: string; href: string; icon?: ReactNode }[] }
interface SidebarProps { children: ReactNode; className?: string }
```

### Editor
```typescript
interface TiptapEditorProps {
  content?: string | JSONContent
  onChange?: (content: string) => void
  onUpdate?: (editor: Editor) => void
  editable?: boolean
  placeholder?: string
  className?: string
}
interface EditorToolbarProps { editor: Editor }
```

### Posts
```typescript
interface PostsListProps { posts: PostWithTags[] }
interface PostsFilterProps { tags: TagWithCount[] }
interface PaginationProps { currentPage: number; totalPages: number; onPageChange?: (page: number) => void }
interface PostContentProps { content: JSONContent }
interface TableOfContentsProps { content: JSONContent }
interface ShareButtonsProps { url: string; title: string }
```

### Projects
```typescript
interface ProjectCardProps { project: ProjectWithTags }
interface ProjectGalleryProps { images: string[]; alt: string }
interface ProjectContentProps { content: JSONContent }
interface TechStackChartProps { data: Record<string, number> }
interface ProjectFormProps { initialData?: ProjectWithTags; onSubmit: (data: ProjectFormValues) => void }
interface RelatedPostsProps { tags: Tag[]; limit?: number }
interface ProjectsFilterProps { tags: TagWithCount[] }
```

### Layout / Admin
```typescript
interface AdminSidebarProps { collapsed?: boolean; onToggle?: () => void }
interface AdminClientLayoutProps { children: ReactNode }
interface AboutPageFormProps {
  initialName: string
  initialRole: string
  initialLocation: string
  initialEmployment: string
  initialIntro: string
  initialSkills: {
    core: string
    infra: string
    ai: string
    method: string
    workflow: string
  }
  initialTimeline: { year: string; title: string; description: string }[]
  initialAvatarUrl: string
  uploadAction: (formData: FormData) => Promise<{ url: string | null; error?: string }>
}
interface LinksPageFormProps {
  initialContactEmail: string
  initialSocialLinks: { name: string; url: string; description: string; icon: string; iconImageUrl?: string }[]
  initialOtherLinks: { name: string; url: string; description: string; icon: string; iconImageUrl?: string }[]
  uploadAction: (formData: FormData) => Promise<{ url: string | null; error?: string }>
}
```

### Common
```typescript
interface AccentCardProps { title: string; description: string; href?: string }
interface GradientAccentProps { className?: string }
```

## 4. Tiptap エディタ詳細仕様

### 4.1 コアエディタ

**ファイル**: `src/components/editor/TiptapEditor.tsx`

#### Props
```typescript
interface TiptapEditorProps {
  content?: string | JSONContent  // 初期コンテンツ（HTML文字列 or Tiptap JSON）
  onChange?: (content: string) => void  // コンテンツ変更時のコールバック（HTML）
  onUpdate?: (editor: Editor) => void   // エディタ更新時のコールバック
  placeholder?: string              // プレースホルダー
  editable?: boolean                // 編集可/不可（デフォルト: true）
  className?: string                // カスタムクラス
}
```

#### 機能
- ✅ SSR対応（`immediatelyRender: false`）
- ✅ リサイズ可能なエディタ高さ（200px〜1200px、マウスドラッグ）
- ✅ フルスクリーンモード切替
- ✅ 文字数・単語数カウント表示
- ✅ プレースホルダー表示
- ✅ 編集可/不可モード切替

### 4.2 標準拡張機能

| カテゴリ | 拡張 | 説明 |
|---------|------|------|
| **基本** | StarterKit | 基本機能パック（見出し、段落、太字、斜体など） |
| | Placeholder | 空欄時のヒント |
| | CharacterCount | 文字・単語数カウント |
| **テキスト装飾** | Underline | 下線 |
| | Highlight | ハイライト（複数色対応） |
| | TextStyle / Color | 文字色変更 |
| | Subscript / Superscript | 下付き・上付き文字 |
| **整列** | TextAlign | テキスト整列（左・中央・右・両端） |
| **リスト** | TaskList / TaskItem | チェックリスト |
| **リンク・メディア** | Link | リンク挿入・編集・削除 |
| | Youtube | YouTube動画埋め込み |
| **テーブル** | Table, TableRow, TableCell, TableHeader | テーブル挿入 |
| **コード** | CodeBlockLowlight | コードブロック（シンタックスハイライト） |
| **その他** | HorizontalRule | 水平線 |
| | Dropcursor / Gapcursor | カーソル表示 |

### 4.3 カスタム拡張機能

#### ResizableImage
**ファイル**: `src/components/editor/extensions/ResizableImage.tsx`

**機能**:
- ✅ ドラッグハンドルによる幅調整
- ✅ アスペクト比固定
- ✅ 最小100px / 最大1600px制限
- ✅ 二段組内ではデフォルト600px
- ✅ コピー＆ペースト対応
- ✅ ドラッグ＆ドロップ対応
- ✅ 画像挿入後に自動改行

**使用方法**:
```typescript
editor.chain().focus().setImage({ src: imageUrl }).run()
```

#### ColumnLayout
**ファイル**: `src/components/editor/extensions/ColumnLayout.tsx`

**機能**:
- ✅ 2カラムレイアウト（左右50%ずつ）
- ✅ 背景色オプション（なし / 薄い水色）
- ✅ 編集モード: 横並び表示、削除ボタン付き
- ✅ 表示モード: レスポンシブ（モバイルは縦積み）

**使用方法**:
```typescript
// 背景色なし
editor.chain().focus().insertContent({
  type: 'columnLayout',
  attrs: { bgColor: 'none' },
  content: [
    { type: 'columnItem', content: [{ type: 'paragraph' }] },
    { type: 'columnItem', content: [{ type: 'paragraph' }] },
  ],
}).run()

// 水色背景
editor.chain().focus().insertContent({
  type: 'columnLayout',
  attrs: { bgColor: 'blue' },
  content: [
    { type: 'columnItem', content: [{ type: 'paragraph' }] },
    { type: 'columnItem', content: [{ type: 'paragraph' }] },
  ],
}).run()
```

**CSS**: `src/styles/globals-pattern1-sky-coral.css`

#### TableWithDelete
**ファイル**: `src/components/editor/extensions/TableWithDelete.tsx`

**機能**:
- ✅ ProseMirror Plugin経由のキーボード削除
- ✅ Ctrl+Shift+Delete でテーブル全削除
- ✅ Backspaceでテーブル後ろから削除
- ✅ ツールバーボタンでも削除可能

### 4.4 エディタツールバー

**ファイル**: `src/components/editor/EditorToolbar.tsx`

#### テキスト装飾ボタン
- ✅ 太字 (Ctrl+B)
- ✅ 斜体 (Ctrl+I)
- ✅ 下線 (Ctrl+U)
- ✅ 打ち消し線 (Ctrl+Shift+X)
- ✅ インラインコード (Ctrl+E)
- ✅ 見出し1〜4 (Ctrl+Alt+1〜4)

#### リスト・引用ボタン
- ✅ 箇条書きリスト
- ✅ 番号付きリスト
- ✅ チェックリスト
- ✅ 引用ブロック
- ✅ 水平線

#### リンク・メディアボタン
- ✅ リンク挿入・編集・削除ダイアログ
- ✅ 画像挿入（ファイル選択・URL入力）
- ✅ YouTube動画埋め込みダイアログ

#### テーブルボタン
- ✅ テーブル挿入ダイアログ（行・列数指定）
- ✅ テーブル削除ボタン
- ✅ 列リサイズ（ドラッグ）

#### 整列・装飾ボタン
- ✅ テキスト整列（左・中央・右・両端）
- ✅ ハイライトドロップダウン（複数色）
- ✅ テキスト色ドロップダウン（カラーピッカー）
- ✅ 書式クリア

#### 二段組ボタン
- ✅ 二段組挿入ドロップダウン（背景色なし / 水色背景）

#### その他
- ✅ 元に戻す / やり直し (Ctrl+Z / Ctrl+Y)
- ✅ 下付き文字 / 上付き文字
- ✅ ツールチップ（ショートカットキー表示）

### 4.5 プレビューモーダル

**ファイル**: `src/components/editor/PreviewModal.tsx`

**機能**:
- ✅ プレビューボタンクリックで別タブで開く
- ✅ デバイス切替（Desktop/Tablet/Mobile）
- ✅ 公開レイアウトでの確認
- ✅ localStorage経由でデータ受け渡し

### 4.6 スタイリング

**ファイル**: `src/styles/globals-pattern1-sky-coral.css`

#### Tiptap Proseスタイル
- ✅ 見出し（h1〜h4）スタイル
- ✅ 段落・リスト・引用スタイル
- ✅ コードブロックスタイル（黒背景 + 白文字）
- ✅ テーブルスタイル
- ✅ 画像リサイズハンドル
- ✅ 二段組レイアウト（編集モード: 点線枠、表示モード: 枠なし）

#### レスポンシブ対応
- ✅ モバイル: 二段組を縦積みに変更
- ✅ タブレット: 適切な余白調整
- ✅ デスクトップ: 最大幅1600px

### 4.7 技術メモ

#### 重要な実装パターン
```typescript
// SSR対応（必須）
const editor = useEditor({
  immediatelyRender: false,
  extensions: [...]
})

// Tiptap拡張のnamed import（必須）
import { Table } from "@tiptap/extension-table"

// 画像リサイズ時の幅検出
img.onload = () => {
  const naturalWidth = img.naturalWidth
  // ...
}
```

#### トラブルシューティング
- **React is not defined**: useEffectなど直接import必要
- **flushSync error**: 画像幅検出は`img.onload`イベント使用
- **二段組が表示されない**: CSS selector に`div[data-node-view-content-react]`必要
- **コードブロック背景色**: HTMLAttributes の`bg-muted`を削除し、CSS で`!important`指定

#### パフォーマンス最適化
- ✅ useCallback でイベントハンドラメモ化
- ✅ immediatelyRender: false でSSR高速化
- ✅ CSS transition 最小限に

---

## 5. Tiptap拡張一覧（まとめ）

**標準拡張**:
StarterKit, CodeBlockLowlight(Shiki), Table, TableRow, TableCell, TableHeader, Link, Youtube, TaskList, TaskItem, Placeholder, CharacterCount, Highlight, TextAlign, Underline, Subscript, Superscript, Color, TextStyle, HorizontalRule, Dropcursor, Gapcursor

**カスタム拡張**:
ResizableImage（リサイズ可能画像）, ColumnLayout（二段組レイアウト）, TableWithDelete（削除可能テーブル）

## 5. Hooks（計画）
```typescript
function useAuth(): { user: User | null; loading: boolean; isAdmin: boolean; signInWithGoogle; signOut }
function usePosts(options?: { page?; limit?; tags?; search? }): { posts; pagination; loading; error; refetch }
function useTheme(): { theme: 'light' | 'dark'; setTheme; toggleTheme }
```

## 6. プロジェクト詳細コンポーネント（2026-02-08追加）

### 6.1 ProjectGallery

**ファイル**: `src/components/projects/ProjectGallery.tsx`

```typescript
interface ProjectGalleryProps {
  images: string[]
  alt: string
}
```

#### 機能
- ✅ 横スクロール可能なギャラリー
- ✅ 画像クリックで拡大表示（Lightbox）
- ✅ 左右矢印ボタンでスクロール
- ✅ インジケーター表示（現在の画像位置）
- ✅ **インジケーター自動連動**（スクロール位置に応じて自動更新）
- ✅ スムーズスクロール（`scrollBehavior: 'smooth'`）
- ✅ アクセシビリティ対応（DialogTitle + VisuallyHidden）

#### 実装技術
- `useRef` でスクロールコンテナ・各画像要素の参照管理
- `Dialog` + `DialogTitle` + `VisuallyHidden` (shadcn/ui + Radix UI) でアクセシブルなLightbox実装
- `useState` で現在の画像インデックス管理
- **scroll イベント + 位置ベース検出**でインジケーター自動更新
  - `getBoundingClientRect()` で各画像の実際の位置を取得
  - 画像中央とコンテナ中央の距離を計算
  - 最も近い画像のインデックスを設定
  - 100ms デバウンスで snap スクロール完了を待つ
- `Image` (Next.js) で最適化

#### 重要な実装ポイント
- **Hydration Error 対策**: Client Component として実装
- **外部画像対応**: next.config.ts で remotePatterns 設定必須

---

### 6.2 TechStackChart

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

### 6.3 ProjectContent

**ファイル**: `src/components/projects/ProjectContent.tsx`

```typescript
interface ProjectContentProps {
  content: JSONContent
}
```

#### 機能
- ✅ Tiptap JSONをHTMLレンダリング
- ✅ Proseスタイル適用（記事と同じスタイル）
- ✅ 全Tiptap拡張機能対応

#### 実装
- `useEditor` (editable=false)
- `EditorContent` でレンダリング
- Posts の PostContent と同じロジックを流用

---

### 6.4 RelatedPosts

**ファイル**: `src/components/projects/RelatedPosts.tsx`

```typescript
interface RelatedPostsProps {
  tags: Tag[]
  limit?: number
}
```

#### 機能
- ✅ プロジェクトのタグに基づいて関連記事を取得
- ✅ カード形式で3件表示
- ✅ 「もっと見る」リンク（/posts へ遷移）
- ✅ 関連性評価 + ランダマイズ

#### データ取得
```typescript
const tagIds = tags.map(t => t.id)
const relatedPosts = await getRelatedPostsByTagsWithRandom(tagIds, 3)
```

---

### 6.5 ProjectCard

**ファイル**: `src/components/projects/ProjectCard.tsx`

```typescript
interface ProjectCardProps {
  project: ProjectWithTags
}
```

#### 機能
- ✅ プロジェクト情報をカード形式で表示
- ✅ カードクリックで詳細ページへ遷移
- ✅ Demo/Code ボタンで外部リンクを別タブで開く
- ✅ タグ表示（最大4件 + 残数表示）
- ✅ 開始・終了日表示

#### 実装技術（重要）
- **Client Component** (`'use client'`)
- **useRouter** (next/navigation) でプログラマティック遷移
- **div + onClick** でカード全体をクリッカブルに
  - `<Link>` のネストを避けるため（Hydration Error 対策）
- **Button onClick + window.open()** で外部リンクを開く
  - `asChild + <a>` を使わない（`<a>` ネスト回避）
  - `e.stopPropagation()` でカードクリックとの競合を防止

#### Hydration Error 対策の経緯
- **問題**: `<Link>` でカード全体をラップ → 内部の Demo/Code ボタン（`<a>`）がネスト → Hydration Error
- **解決**: カード全体を `<div onClick={handleCardClick}>` に変更し、useRouter で遷移
- **ボタン**: `<Button asChild><a>` → `<Button onClick={window.open}>` に変更

---

### 6.6 管理画面コンポーネント

#### TechStackInput

**ファイル**: `src/components/admin/TechStackInput.tsx`

```typescript
interface TechStackInputProps {
  value: Record<string, number>
  onChange: (value: Record<string, number>) => void
}
```

**機能**:
- ✅ 言語名と使用率を動的入力
- ✅ 行の追加・削除
- ✅ 合計100%バリデーション
- ✅ リアルタイム更新

**UI**:
```
言語名         使用率 (%)        削除
[ TypeScript ] [ 45.2 ]         [×]
[ CSS        ] [ 30.1 ]         [×]
[+ 追加]

合計: 100.0%
```

---

#### ImageUploadMultiple

**ファイル**: `src/components/admin/ImageUploadMultiple.tsx`

```typescript
interface ImageUploadMultipleProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number  // デフォルト: 10
}
```

**機能**:
- ✅ ドラッグ&ドロップ対応
- ✅ 複数枚選択可能
- ✅ プレビュー表示
- ✅ 並び替え（ドラッグ&ドロップ）
- ✅ 個別削除ボタン
- ✅ ファイルサイズ制限（最大5MB/枚）
- ✅ 画像形式制限（jpg, png, webp）

---

## 7. 命名規則
- ファイル: PascalCase (`PostCard.tsx`)
- コンポーネント: PascalCase (`export function PostCard()`)
- Props型: `{ComponentName}Props`
- Hooks: camelCase + use接頭辞 (`usePosts`)

---

**最終更新**: 2026-02-18
**追加内容**: 固定ページ編集フォーム、リンクアイコン画像アップロード対応

※ 本仕様は実装状況を反映して更新しました。コンポーネントの実装状況は `docs/implementation/00-overview.md` を参照してください。
