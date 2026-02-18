# UniVerse Canvas プロジェクト設定

最終更新: 2026-02-18

---

## 📌 プロジェクト基本情報

### プロジェクト名
```
UniVerse Canvas
```

### プロジェクト概要
```
多機能ポートフォリオ重視型の個人HP兼ブログ。
管理者（単一アカウント）による高度なコンテンツ管理と、一般ユーザー向けの快適な閲覧体験を両立する。
```

### 開発期間
```
2026-02-01 〜 未定
```

### 想定コード行数
```
20,000行程度（現状: 約19,000行）
```

---

## 🎯 DDD適用判断

### 判定結果
`はい`

### 理由
```
- 開発期間が長期
- コード行数が 500 行を大きく超過
- 複数人/複数エージェントでの開発
- 長期運用・保守を前提
- API/DB 連携あり
```

---

## 🛠️ 技術スタック

### フレームワーク
```
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5.x (strict)
```

### CSS / UI
```
- Tailwind CSS v4
- shadcn/ui
- Lucide Icons
```

### バックエンド / データベース
```
- Supabase
  - Auth (Google OAuth)
  - Database (PostgreSQL 15+)
  - Storage (WebP)
```

### その他のライブラリ
```
- Tiptap 3.x (リッチテキストエディタ)
- Zod (バリデーション)
- React Hook Form (フォーム管理)
- Chart.js + react-chartjs-2 (技術スタック可視化)
- Vitest + Testing Library (テスト)
```

### デプロイ先
```
- Vercel (本番)
```

---

## 📁 プロジェクト構成

### ディレクトリ構造
```
uni-verse-canvas/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React コンポーネント
│   ├── lib/              # Server Actions / Utils
│   ├── types/            # TypeScript 型定義
│   └── styles/           # グローバル CSS
├── docs/                 # ドキュメント（SSOT）
│   ├── architecture/
│   ├── config/
│   ├── guides/
│   ├── implementation/
│   ├── specs/
│   └── testing/
├── supabase/             # migrations/ seed.sql
└── public/               # 静的ファイル
```

---

## 🎨 デザインテーマ

### カラーテーマ
```
- ライトモードのみ（現状）
- Blue Archive風: スカイブルー〜コーラル系のグラデーション
- 管理画面: スカイブルー + ピンクを基調に、よりエネルギッシュで軽快な印象（ライトモード強調）
```

### フォント
```
- 本文: Quicksand + Noto Sans JP
- コード: Geist Mono
```

---

## 🔐 認証・権限

### 認証方式
```
- Supabase Auth
- Google OAuth
```

### 権限レベル
```
- 一般ユーザー: 閲覧のみ
- 管理者: 記事/プロジェクト/進行中/固定ページの CRUD
```

---

## 📊 データベーススキーマ（概要）

### 主要テーブル
```
- posts, projects, in_progress, tags
- post_tags, project_tags, post_links, post_project_links
- pages, admins, qiita_cache
```

詳細: `docs/specs/data-schema.md`

---

## 🚀 主要機能

### 機能一覧
```
1. 記事管理（公開/管理）
   - 一覧、詳細、タグフィルタ、検索、OGP、シェア
   - 管理画面での作成/編集/削除

2. プロジェクト管理（公開/管理）
   - 一覧、詳細、ギャラリー、技術スタック
   - 管理画面での作成/編集/削除

3. 進行中管理
   - ステータス管理、進捗表示

4. 固定ページ
   - Home / About / Links を DB 連携
   - 管理画面から編集（プロフィール画像・リンク画像対応）

5. 管理画面
   - ダッシュボード、バックアップ（エクスポート/インポート）
   - 固定ページ編集（自己紹介/リンク）

6. 認証
   - Google OAuth + RLS
```

---

## 🔧 開発環境

### 必須ツール
```
- Node.js 20.x
- npm 10.x
- Git
- VSCode（推奨）
```

### 環境変数
```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

---

## 📝 コーディング規約（プロジェクト固有）

### ファイル命名規則
```
- コンポーネント: PascalCase（例: PostCard.tsx）
- ユーティリティ: camelCase（例: formatDate.ts）
- 定数: UPPER_SNAKE_CASE
```

### 禁止事項
```
- any 型の使用
- コメントの過剰な記載（CODE-001 参照）
- インラインスタイル（Tailwind 使用）
```

---

## 🚨 特記事項

### プロジェクト固有の注意点
```
- Tiptap は SSR 対応のため immediatelyRender: false を必ず設定
- 画像は next/image を使用
- Server Actions には 'use server' を付与
- 外部画像ドメインは next.config.ts の remotePatterns に登録
```

---

**最終更新**: 2026-02-18
