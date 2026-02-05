# docs/tech-stack.md

## 1. 技術選定の基本方針

- **Claude生成品質**: AIによるコード生成時のバグ発生率を最小化
- **多機能性**: 記事作成機能の高度化を優先（大規模PJ許容）
- **パフォーマンス**: エンドユーザーの閲覧体験を損なわない
- **保守性**: ドキュメント駆動開発に適した型安全性・可読性
- **想定コード行数**: 100,000 ~ 300,000 行

---

## 2. コア技術スタック

### 2.1 フロントエンド

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript (strict mode) | 5.x |
| UI | React | 19.x |
| Styling | Tailwind CSS | 3.x |
| Components | shadcn/ui (Radix UI) | Latest |
| Icons | Lucide React | Latest |

### 2.2 バックエンド / インフラ

| Category | Technology |
|----------|-----------|
| BaaS | Supabase |
| Database | PostgreSQL 15+ |
| Auth | Supabase Auth (Google OAuth) |
| Storage | Supabase Storage |
| Hosting | Vercel |
| Environment | dev / prod 2インスタンス |

### 2.3 リッチテキストエディタ

| Category | Technology |
|----------|-----------|
| Editor | Tiptap 2.x |
| Syntax | Shiki |
| Math | KaTeX |

**Tiptap 拡張機能**
| Extension | Purpose |
|-----------|---------|
| Starterkit | 基本機能 |
| CodeBlockLowlight | コード + Shiki |
| Table | テーブル |
| Image | 画像 + WebP変換 |
| Link | リンク |
| Youtube | YouTube埋め込み |
| Mathematics | KaTeX数式 |
| TaskList | チェックリスト |
| Placeholder | 入力ヒント |
| CharacterCount | 文字数 |
| HorizontalRule | 区切り線 |
| Highlight | 蛍光ペン |
| TextAlign | テキスト配置 |
| Underline | 下線 |
| Subscript/Superscript | 上付き/下付き |
| Color/TextStyle | 文字色・背景色 |
| HorizontalImageLayout | カスタム: 横並び画像 |
| SectionDivider | カスタム: セクション区切り |

---

## 3. 開発ツール / ライブラリ

### 3.1 画像処理
- **browser-image-compression**: クライアントWebP変換（1920px、80%）
- **Next.js Image**: 自動最適化
- **Sharp**: サーバー側処理（必要時）

### 3.2 バリデーション
- **Zod**: TypeScript-first スキーマバリデーション

### 3.3 日時処理
- **date-fns**: 軽量日時操作

### 3.4 状態管理
- React標準（useState, useContext, useReducer）
- Zustand: 必要時に追加

### 3.5 ユーティリティ
| Tool | Purpose |
|------|---------|
| clsx | 条件付きクラス名 |
| tailwind-merge | Tailwindクラス衝突解決 |
| nanoid | 短縮UUID生成 |
| DOMPurify | XSS対策 |

---

## 4. テスト / 品質管理

### 4.1 テストフレームワーク
- Jest + React Testing Library
- カバレッジ目標: 70%以上（重要ロジック100%）

### 4.2 Linter / Formatter
| Tool | Config |
|------|--------|
| ESLint | eslint-config-next |
| Prettier | Tailwind plugin統合 |
| eslint-plugin-tailwindcss | クラス順序統一 |

### 4.3 TypeScript設定
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

---

## 5. 外部サービス連携

| Service | Purpose |
|---------|---------|
| Qiita API v2 | 外部記事取得 |
| Google Analytics 4 | アクセス解析 |
| Vercel Analytics | パフォーマンス計測 |
| reCAPTCHA v3 | BOT対策（将来） |
| Vercel OG | 動的OGP画像生成 |

---

## 6. データベース拡張機能

| Feature | Purpose |
|---------|---------|
| Full-Text Search | 記事検索（pg_trgm + to_tsvector） |
| Row Level Security | アクセス制御 |
| Triggers | 自動タイムスタンプ更新 |
| Functions | 関連記事自動推薦 |

---

## 7. 開発環境構成

### 7.1 Supabaseインスタンス
| Environment | Purpose |
|-------------|---------|
| dev | ローカル開発・テスト |
| prod | 本番運用 |

### 7.2 Vercel環境
| Environment | Branch | Supabase |
|-------------|--------|----------|
| Development | feature/* | dev_db |
| Production | main | prod_db |

### 7.3 必須環境変数
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

# Qiita
QIITA_ACCESS_TOKEN=
```

---

## 8. パフォーマンス最適化

### 8.1 Next.js設定
- images: WebP、deviceSizes対応
- compress: true
- swcMinify: true
- reactStrictMode: true

### 8.2 ISR設定
| Page | Revalidate |
|------|------------|
| トップ/記事一覧 | 3600s |
| 固定ページ | 86400s |

---

## 9. CI/CD

```
feature/* → PR → CI (Lint, Test, Build) → Preview Deploy → Review → Merge → Production Deploy
```

---

## 10. セキュリティ対策

| Layer | Implementation |
|-------|----------------|
| 認証 | Supabase Auth Middleware |
| RLS | PostgreSQL Row Level Security |
| CSRF | Next.js標準 |
| XSS | DOMPurify + Tiptap |

**Rate Limiting**
- API: 100 req/min
- 画像: 10 files/min
- コメント: 5 req/min
