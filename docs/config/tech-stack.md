# 技術スタック リファレンス

UniVerse Canvasで使用している技術スタックの完全リファレンスです。

---

## 📚 クイックリンク

### コア技術
- [Next.js 15 ドキュメント](https://nextjs.org/docs)
- [React 19 ドキュメント](https://react.dev)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Supabase ドキュメント](https://supabase.com/docs)

### UI / エディタ
- [shadcn/ui](https://ui.shadcn.com/)
- [Tiptap 2.x](https://tiptap.dev/docs)
- [Lucide Icons](https://lucide.dev/)

---

## 1. フロントエンド

### 1.1 Next.js 15 (App Router)

**バージョン**: `16.1.6` (Next.js 16系)
**ドキュメント**: https://nextjs.org/docs

#### 使用機能
- App Router（`app/` ディレクトリ）
- Server Actions（`'use server'`）
- Server Components（デフォルト）
- Client Components（`'use client'`）
- Route Groups（`(public)`, `(admin)`）
- Dynamic Routes（`[slug]`, `[id]`）
- Metadata API（SEO最適化）
- Suspense & Loading UI
- Middleware（認証保護）

#### プロジェクト構成
```
src/app/
├── (public)/          # 公開ページ
│   ├── page.tsx       # ホーム
│   ├── posts/         # 読み物
│   ├── works/         # 作ったもの
│   ├── progress/      # 進行中のこと
│   ├── about/         # 自己紹介
│   └── links/         # 関連リンク
└── (admin)/           # 管理画面（将来実装）
    └── admin/
```

#### next.config.ts 設定

**ファイル**: `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',  // 開発・テスト用プレースホルダー
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',  // Supabase Storage（本番用）
      },
    ],
  },
}
```

**外部画像ドメイン許可設定**:
- Next.js の `next/image` コンポーネントで外部画像を読み込むには `remotePatterns` 設定が必須
- `placehold.co`: 開発・テスト時のプレースホルダー画像
- `*.supabase.co`: Supabase Storage にアップロードされた画像（本番運用時）

#### 参考記事
- [App Router Migration](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

### 1.2 React 19

**バージョン**: `19.2.3`
**ドキュメント**: https://react.dev

#### 使用機能
- React Server Components
- `useTransition` - 非同期UI更新
- `useCallback` - メモ化コールバック
- `useState` - 状態管理
- `useEffect` - 副作用処理
- `Suspense` - 非同期レンダリング

#### プロジェクトでの使用例
- `src/components/posts/PostsFilter.tsx` - useTransition
- `src/components/posts/Pagination.tsx` - useTransition
- `src/app/(public)/posts/page.tsx` - Suspense

---

### 1.3 TypeScript 5

**バージョン**: `^5`
**ドキュメント**: https://www.typescriptlang.org/docs/

#### 設定
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### 型定義
- `src/types/database.ts` - Supabase型定義
- インターフェース: Post, Project, InProgress, Tag, Page

---

### 1.4 Tailwind CSS v4

**バージョン**: `^4`
**ドキュメント**: https://tailwindcss.com/docs

#### CSS Variables設定
`src/styles/globals-pattern1-sky-coral.css`
- Blue Archive風カラースキーム
- スカイブルー → ソフトピンクのグラデーション
- カスタムクラス: `bg-universe`, `cloud-section`

#### ユーティリティ
- **tailwind-merge**: クラス衝突解決
- **clsx**: 条件付きクラス名

#### 使用例
```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", condition && "conditional-class")} />
```

---

### 1.5 shadcn/ui (Radix UI)

**ドキュメント**: https://ui.shadcn.com/

#### インストール済みコンポーネント
- `Badge` - タグ表示
- `Button` - ボタン
- `Card` - カードUI
- `Input` - 入力フィールド
- `Tabs` - タブUI
- `Separator` - 区切り線
- `Dialog` - モーダル（将来使用予定）

#### コンポーネント配置
`src/components/ui/`

#### カスタマイズ
`src/lib/utils.ts` - cn() ヘルパー関数

---

### 1.6 Lucide React

**バージョン**: `^0.563.0`
**ドキュメント**: https://lucide.dev/

#### よく使うアイコン
- `Search` - 検索
- `Github` - GitHub
- `ExternalLink` - 外部リンク
- `Calendar` - 日付
- `Clock` - 時間
- `PlayCircle` - 進行中
- `CheckCircle2` - 完了

#### 使用例
```tsx
import { Search } from "lucide-react"

<Search className="h-4 w-4" />
```

---

## 2. バックエンド

### 2.1 Supabase

**ドキュメント**: https://supabase.com/docs

#### 使用機能
- **Database**: PostgreSQL 15+
- **Auth**: 認証（Google OAuth 連携）
- **Storage**: ファイルストレージ
- **Row Level Security**: アクセス制御

#### クライアント設定
```typescript
// src/lib/supabase/client.ts (Browser Client)
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient<Database>(url, anonKey)

// src/lib/supabase/server.ts (Server Client)
import { createServerClient } from '@supabase/ssr'
export async function createSupabaseServerClient() { ... }
```

#### パッケージ
- `@supabase/supabase-js`: コアSDK
- `@supabase/ssr`: Next.js App Router 統合（クッキーベース認証）

#### Server Actions
- `src/lib/actions/posts.ts` - 記事操作
- `src/lib/actions/projects.ts` - プロジェクト操作
- `src/lib/actions/in-progress.ts` - 進行中操作
- `src/lib/actions/tags.ts` - タグ操作
- `src/lib/actions/pages.ts` - 固定ページ操作

#### 環境変数
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

---

### 2.2 PostgreSQL

**バージョン**: 15+

#### テーブル構成
- `posts` - 記事
- `projects` - プロジェクト
- `in_progress` - 進行中のこと
- `tags` - タグ
- `pages` - 固定ページ
- `post_tags` - 記事とタグの中間テーブル
- `project_tags` - プロジェクトとタグの中間テーブル

#### マイグレーション
`supabase/migrations/20260208000000_initial_schema.sql`

#### シードデータ
`supabase/seed.sql`

---

## 3. リッチテキストエディタ

### 3.1 Tiptap 2.x

**バージョン**: `^3.19.0`
**ドキュメント**: https://tiptap.dev/docs

#### 使用拡張機能

##### コア
- `@tiptap/react` - React統合
- `@tiptap/starter-kit` - 基本機能セット

##### テキスト装飾
- `@tiptap/extension-text-style` - テキストスタイル
- `@tiptap/extension-color` - 文字色
- `@tiptap/extension-highlight` - 蛍光ペン
- `@tiptap/extension-underline` - 下線
- `@tiptap/extension-subscript` - 下付き文字
- `@tiptap/extension-superscript` - 上付き文字

##### コンテンツ
- `@tiptap/extension-image` - 画像挿入
- `@tiptap/extension-link` - リンク
- `@tiptap/extension-table` - テーブル
- `@tiptap/extension-youtube` - YouTube埋め込み
- `@tiptap/extension-code-block-lowlight` - コードブロック

##### UI
- `@tiptap/extension-placeholder` - プレースホルダー
- `@tiptap/extension-character-count` - 文字数カウント
- `@tiptap/extension-horizontal-rule` - 区切り線
- `@tiptap/extension-text-align` - テキスト整列
- `@tiptap/extension-task-list` - タスクリスト

#### エディタコンポーネント
- `src/components/editor/TiptapEditor.tsx` - メインエディタ
- `src/components/editor/Toolbar.tsx` - ツールバー
- `src/components/editor/extensions/` - カスタム拡張

#### SSR対応
```tsx
import { useEditor } from '@tiptap/react'

const editor = useEditor({
  immediatelyRender: false, // SSR対応に必須
  extensions: [...]
})
```

---

### 3.2 Lowlight (Shiki)

**バージョン**: `^3.3.0`

#### コードハイライト
- シンタックスハイライト対応
- 多言語サポート

---

## 4. ユーティリティライブラリ

### 4.1 next-themes

**バージョン**: `^0.4.6`
**ドキュメント**: https://github.com/pacocoursey/next-themes

#### ダークモード切り替え
```tsx
import { ThemeProvider } from 'next-themes'

<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

---

### 4.2 class-variance-authority

**バージョン**: `^0.7.1`

#### バリアント管理
```tsx
import { cva } from "class-variance-authority"

const buttonVariants = cva("base", {
  variants: {
    variant: {
      default: "bg-primary",
      outline: "border"
    }
  }
})
```

---

### 4.3 sonner

**バージョン**: `^2.0.7`

#### トースト通知
```tsx
import { toast } from "sonner"

toast.success("Success!")
```

---

## 5. 開発ツール

### 5.1 ESLint

**バージョン**: `^9`
**設定**: `eslint-config-next`

#### 実行
```bash
npm run lint
```

---

### 5.2 TypeScript

#### 型チェック
```bash
npx tsc --noEmit
```

---

## 6. デプロイ・ホスティング

### 6.1 Vercel

**ドキュメント**: https://vercel.com/docs

#### デプロイ
- main ブランチ → 自動デプロイ（本番）
- その他ブランチ → プレビューデプロイ

---

## 7. データベース設計

### 7.1 主要テーブル

#### posts（記事）
```sql
- id: UUID
- title: VARCHAR(200)
- slug: VARCHAR(200) UNIQUE
- content: JSONB (Tiptap JSON)
- excerpt: TEXT
- status: VARCHAR(20) (draft/scheduled/published)
- published_at: TIMESTAMPTZ
```

#### projects（プロジェクト）
```sql
- id: UUID
- title: VARCHAR(200)
- slug: VARCHAR(200) UNIQUE
- description: TEXT
- demo_url: TEXT
- github_url: TEXT
```

#### in_progress（進行中のこと）
```sql
- id: UUID
- title: VARCHAR(200)
- status: VARCHAR(20) (not_started/paused/in_progress/completed)
- progress_rate: INTEGER (0-100)
```

---

## 8. プロジェクト構造

```
uni-verse-canvas/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reactコンポーネント
│   │   ├── ui/          # shadcn/ui
│   │   ├── editor/      # Tiptapエディタ
│   │   ├── posts/       # 記事関連
│   │   └── projects/    # プロジェクト関連
│   ├── lib/             # ユーティリティ
│   │   ├── actions/     # Server Actions
│   │   ├── supabase/    # Supabaseクライアント
│   │   └── utils.ts     # ヘルパー関数
│   ├── types/           # TypeScript型定義
│   └── styles/          # グローバルCSS
├── supabase/
│   ├── migrations/      # DBマイグレーション
│   └── seed.sql         # シードデータ
├── docs/                # ドキュメント
│   ├── lv1/            # 要件・設計
│   ├── lv2/            # データ・API
│   └── lv3/            # 実装詳細
└── public/              # 静的ファイル
```

---

## 9. 参考ドキュメント

### プロジェクト内
- [要件定義](./requirements.md)
- [アーキテクチャ](./architecture_v2.md)
- [データスキーマ](../lv2/data-schema.md)
- [API仕様](../lv2/api-spec.md)
- [コンポーネント仕様](../lv3/component-spec.md)

### 実装ガイド
- [データベースセットアップ](../DATABASE_SETUP.md)
- [読み物機能実装](../POSTS_IMPLEMENTATION.md)
- [クイックスタート](../../QUICKSTART.md)

---

## 10. バージョン履歴

| 日付 | 更新内容 |
|------|---------|
| 2026-02-08 | 初版作成、実装済み機能を反映 |
| 2026-02-08 | Tailwind CSS v4対応、Tiptap詳細追加 |
| 2026-02-08 | Server Actions追加、リファレンス形式に変更 |

---

## 11. クイックコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lint
npm run lint

# 型チェック
npx tsc --noEmit

# パッケージ追加
npm install [package-name]
```

---

**最終更新**: 2026-02-08
**メンテナ**: Claude Sonnet 4.5
