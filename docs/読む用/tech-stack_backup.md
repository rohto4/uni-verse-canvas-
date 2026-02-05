# docs/tech-stack.md

## Document Metadata
- **Version**: 1.0.0
- **Last Updated**: 2026-02-04
- **Status**: Confirmed (確定版)
- **Owner**: Senior Fullstack Engineer (DDD Specialist)

---

## 1. 技術選定の基本方針

### 1.1 選定基準
1. **Claude生成品質**: AIによるコード生成時のバグ発生率を最小化
2. **多機能性**: 記事作成機能の高度化を優先（大規模PJ許容）
3. **パフォーマンス**: エンドユーザーの閲覧体験を損なわない
4. **保守性**: ドキュメント駆動開発に適した型安全性・可読性

### 1.2 プロジェクト規模
- **想定コード行数**: 100,000 ~ 300,000 行
- **開発期間**: 長期（段階的実装）
- **バグ対策**: ユニットテスト必須、型安全性重視

---

## 2. コア技術スタック

### 2.1 フロントエンド

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Framework** | Next.js | 15.x (最新安定版) | App Router、SSG/ISR対応、最新機能利用 |
| **Language** | TypeScript | 5.x | strict mode有効、型安全性最大化 |
| **UI Framework** | React | 19.x (Next.js同梱) | 標準的なコンポーネントベース開発 |
| **Styling** | Tailwind CSS | 3.x | Utility-first、ダークモード標準対応 |
| **Component Library** | shadcn/ui | Latest | Radix UI + Tailwind、カスタマイズ性高 |
| **Icons** | Lucide React | Latest | 軽量、Tailwindとの親和性高 |

### 2.2 バックエンド / インフラ

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **BaaS Platform** | Supabase | Latest | Postgres + Auth + Storage統合 |
| **Database** | PostgreSQL | 15+ | Full-Text Search対応、RLS機能 |
| **Authentication** | Supabase Auth | - | Google OAuth、管理者専用認証 |
| **Storage** | Supabase Storage | - | WebP画像最適化、CDN統合 |
| **Hosting** | Vercel | - | Next.js最適化、Edge Functions対応 |
| **Environment** | 2インスタンス構成 | - | 開発用 / 本番用 Supabase分離 |

### 2.3 リッチテキストエディタ

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Core Editor** | Tiptap | 2.x | Headless、拡張性最高 |
| **Syntax Highlight** | Shiki | Latest | CodeBlockLowlight連携 |
| **Math Rendering** | KaTeX | Latest | Mathematics拡張 |

#### Tiptap 拡張機能一覧（全導入）

| Extension | Purpose | Priority |
|-----------|---------|----------|
| **Starterkit** | 基本機能（Bold, Italic, Heading等） | 必須 |
| **CodeBlockLowlight** | コードブロック + Shikiハイライト | 必須 |
| **Table** | テーブル挿入・編集 | 高 |
| **Image** | 画像挿入 + カスタムWebP変換 | 必須 |
| **Link** | リンク挿入 + プレビュー | 必須 |
| **Youtube** | YouTube埋め込み | 高 |
| **Mathematics** | KaTeX数式表示 | 高 |
| **TaskList** | チェックリスト | 中 |
| **Mention** | メンション機能（将来の拡張用） | 低 |
| **Placeholder** | 入力ヒント表示 | 中 |
| **CharacterCount** | 文字数カウント | 中 |
| **HorizontalRule** | 区切り線 | 中 |
| **Highlight** | 蛍光ペンマーカー | 高 |
| **TextAlign** | テキスト配置（左/中央/右） | 高 |
| **Underline** | 下線 | 中 |
| **Subscript** | 下付き文字 | 低 |
| **Superscript** | 上付き文字 | 低 |
| **Color** | 文字色 | 高 |
| **TextStyle** | 背景色・装飾 | 高 |
| **HorizontalImageLayout** | カスタム: 横並び画像（PC/スマホ対応） | 必須 |
| **SectionDivider** | カスタム: セクション区切り | 中 |

---

## 3. 開発ツール / ライブラリ

### 3.1 画像処理

| Tool | Purpose | Version |
|------|---------|---------|
| **browser-image-compression** | クライアント側WebP変換 | Latest |
| **Next.js Image** | 画像最適化（自動WebP、Lazy Loading） | Next.js同梱 |
| **Sharp** | サーバー側画像処理（必要時） | Latest |

**設定値**:
- 最大幅: 1920px
- 品質: 80%
- フォーマット: WebP

### 3.2 バリデーション / スキーマ

| Tool | Purpose | Version |
|------|---------|---------|
| **Zod** | TypeScript-first スキーマバリデーション | Latest |
| **@conform-to/zod** | フォームバリデーション統合（オプション） | Latest |

### 3.3 日時処理

| Tool | Purpose | Version |
|------|---------|---------|
| **date-fns** | 軽量な日時操作ライブラリ | Latest |

### 3.4 状態管理

| Tool | Purpose | Version |
|------|---------|---------|
| **React標準** | useState, useContext, useReducer | React同梱 |
| **Zustand** | 必要時に追加（グローバル状態管理） | Latest (後日検討) |

**方針**: 
- 初期実装はReact標準で進める
- 複雑な状態管理が必要になった時点でZustand導入を検討

### 3.5 ユーティリティ

| Tool | Purpose | Version |
|------|---------|---------|
| **clsx** | 条件付きクラス名結合 | Latest |
| **tailwind-merge** | Tailwindクラスの衝突解決 | Latest |
| **nanoid** | 短縮UUID生成（スラッグ用） | Latest |
| **DOMPurify** | XSS対策（HTMLサニタイズ） | Latest |

---

## 4. テスト / 品質管理

### 4.1 テストフレームワーク

| Tool | Purpose | Version |
|------|---------|---------|
| **Jest** | ユニットテストランナー | Latest |
| **React Testing Library** | Reactコンポーネントテスト | Latest |
| **@testing-library/jest-dom** | DOM assertion拡張 | Latest |
| **@testing-library/user-event** | ユーザーインタラクションテスト | Latest |

**テスト戦略**:
- カバレッジ目標: 70%以上（重要ロジックは100%）
- テスト対象:
  - ユーティリティ関数（slug生成、日時判定等）
  - Reactコンポーネント（UI表示、イベントハンドリング）
  - APIルート（エラーハンドリング）

### 4.2 Linter / Formatter

| Tool | Purpose | Version | Config |
|------|---------|---------|--------|
| **ESLint** | コード品質チェック | Latest | `eslint-config-next` |
| **Prettier** | コードフォーマット | Latest | Tailwind plugin統合 |
| **eslint-config-next** | Next.js推奨設定 | Next.js同梱 | - |
| **eslint-plugin-tailwindcss** | Tailwindクラス順序統一 | Latest | - |

**設定方針**:
- Claude生成品質を損なわない範囲で厳格化
- `no-unused-vars`, `no-console` (warn)
- Prettier: セミコロンあり、シングルクォート、120文字改行

### 4.3 型チェック

**tsconfig.json 設定**:
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 5. 外部サービス連携

### 5.1 API統合

| Service | Purpose | Version |
|---------|---------|---------|
| **Qiita API v2** | 外部記事取得（キャッシュ） | v2 |
| **Google Analytics 4** | アクセス解析（控えめ配置） | GA4 |
| **Vercel Analytics** | パフォーマンス計測 | Vercel標準 |
| **reCAPTCHA v3** | BOT対策（将来のコメント機能用） | v3 |

### 5.2 OGP画像生成

| Tool | Purpose | Version |
|------|---------|---------|
| **Vercel OG** | 動的OGP画像生成（デフォルト） | Vercel標準 |
| **Supabase Storage** | 手動アップロードOGP画像 | - |

**方針**:
- デフォルト: Vercel OGで動的生成（タイトル + テーマカラー）
- カスタム: 管理画面から手動アップロード可能

---

## 6. データベース拡張機能

### 6.1 PostgreSQL機能

| Feature | Purpose | Implementation |
|---------|---------|----------------|
| **Full-Text Search** | 記事内検索（日本語対応） | `pg_trgm` + `to_tsvector` |
| **Row Level Security** | テーブルアクセス制御 | RLSポリシー設定 |
| **Triggers** | 自動スラッグ生成、タイムスタンプ更新 | SQL Trigger |
| **Functions** | 関連記事自動推薦 | PL/pgSQL Function |

### 6.2 Supabase機能

| Feature | Purpose | Implementation |
|---------|---------|----------------|
| **Realtime** | リアルタイム更新（将来検討） | Supabase Realtime |
| **Edge Functions** | サーバーレス処理（必要時） | Deno Runtime |
| **Storage Policies** | 画像アクセス制御 | RLS Policy |

---

## 7. 開発環境構成

### 7.1 Supabaseインスタンス

| Environment | Instance | Database | Purpose |
|-------------|----------|----------|---------|
| **Development** | dev.supabase.co | dev_db | ローカル開発・テスト |
| **Production** | prod.supabase.co | prod_db | 本番運用 |

**データ管理**:
- 本番→開発: 定期的なエクスポート/インポート
- 開発環境: データ複製・テスト用記事生成

### 7.2 Vercel環境

| Environment | Branch | Supabase | URL |
|-------------|--------|----------|-----|
| **Development** | feature/* | dev_db | preview-*.vercel.app |
| **Production** | main | prod_db | yourdomain.com |

### 7.3 環境変数管理

**必須環境変数**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Qiita API
QIITA_ACCESS_TOKEN=

# reCAPTCHA (将来)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

---

## 8. パッケージマネージャ

| Tool | Version | Rationale |
|------|---------|-----------|
| **npm** | 10.x | 主流、安定性重視、バグ報告多数 |

**代替案**: pnpm（高速だがエコシステムの成熟度でnpmに劣る）

---

## 9. CI/CD パイプライン

### 9.1 GitHub Actions（推奨）

**ワークフロー**:
1. Lint & Format チェック
2. TypeScript型チェック
3. ユニットテスト実行
4. ビルド確認
5. Vercel自動デプロイ

### 9.2 デプロイフロー

```
開発ブランチ (feature/*)
  ↓ Pull Request
  ↓ CI/CD (Lint, Test, Build)
  ↓ Preview Deploy (Vercel)
  ↓ レビュー・承認
  ↓ Merge to main
  ↓ 本番デプロイ (Vercel Production)
```

---

## 10. セキュリティ対策

### 10.1 認証・認可

| Layer | Implementation |
|-------|----------------|
| **管理画面認証** | Supabase Auth Middleware（Google OAuth） |
| **RLS** | PostgreSQL Row Level Security |
| **CSRF** | Next.js標準保護 |
| **XSS** | DOMPurify + Tiptapサニタイズ |

### 10.2 Rate Limiting

| Target | Limit | Implementation |
|--------|-------|----------------|
| **API Routes** | 100 req/min | Vercel Edge Config |
| **画像アップロード** | 10 files/min | カスタムミドルウェア |
| **コメント投稿（将来）** | 5 req/min | reCAPTCHA v3 + Rate Limiter |

---

## 11. パフォーマンス最適化

### 11.1 Next.js設定

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  compress: true,
  swcMinify: true,
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
}
```

### 11.2 ISR設定

| Page Type | Revalidate |
|-----------|------------|
| トップページ | 3600s (1時間) |
| 記事一覧 | 3600s |
| 記事詳細 | 3600s |
| 固定ページ | 86400s (24時間) |
| プロジェクト一覧 | 3600s |

---

## 12. 今後の技術検討事項

### 12.1 優先度: 中
- **MDX**: Markdown拡張（React Component埋め込み）
- **Algolia**: 高度な検索機能（有料）
- **Sentry**: エラートラッキング
- **Storybook**: コンポーネントカタログ

### 12.2 優先度: 低
- **GraphQL**: Supabase PostgREST代替
- **Turborepo**: モノレポ最適化（現状不要）
- **Docker**: ローカル環境統一（Supabase CLI使用時）

---

## 13. バージョン管理ルール

### 13.1 技術スタック更新方針
- **メジャーバージョンアップ**: 慎重に検討（破壊的変更確認）
- **マイナーバージョンアップ**: 四半期ごとに検討
- **パッチバージョンアップ**: 月次で適用

### 13.2 依存関係管理
```bash
# 定期的な脆弱性チェック
npm audit

# 依存関係更新（慎重に）
npm outdated
npm update
```

---

## 14. ドキュメント更新履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-04 | 初版作成（技術スタック確定版） |

---

## 承認状態

✅ **確定済み** - 本ドキュメントの技術スタックで開発を進めます。

次のステップ: `docs/architecture.md` v2.0 更新 → `docs/data-schema.md` 作成
