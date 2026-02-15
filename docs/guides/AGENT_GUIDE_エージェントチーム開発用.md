# AI エージェント向け実装ガイド

**対象**: OhMyOpenCode 自律型エージェント及びサブエージェント
**最終更新**: 2026-02-09

---

## 🎯 このドキュメントの目的

複数のAIエージェントが**並列で安全に開発**できるようにするためのガイドラインです。

---

## 📚 最初に読むべきファイル（必読）

### 1. プロジェクト概要
- **`docs/lv4/00-overview.md`** - 全体進捗・機能別実装状況
- **`docs/claude.md`** - コード生成ルール
- **`docs/default/DDD.md`** - ドキュメント駆動開発方針

### 2. 技術仕様
- **`docs/lv1/tech-stack.md`** - 技術スタック詳細
- **`docs/lv2/data-schema.md`** - データベーススキーマ
- **`docs/lv2/api-spec.md`** - Server Actions仕様
- **`docs/lv3/component-spec.md`** - コンポーネント仕様

### 3. 担当機能のドキュメント
- **`docs/lv4/01-posts-feature.md`** - 読み物機能
- **`docs/lv4/02-projects-feature.md`** - 作ったもの機能
- **`docs/lv4/06-auth-feature.md`** - 認証機能
- その他 `docs/lv4/` 配下の各機能ドキュメント

---

## 🔒 編集ルール・Lock機構（重要）

複数のエージェントが同時に作業するため、**編集競合を防ぐルール**を厳守してください。

### Lock ファイルシステム

#### ディレクトリ構造
```
.locks/
├── features/              # 機能単位のロック
│   ├── posts.lock
│   ├── projects.lock
│   ├── auth.lock
│   └── editor.lock
├── files/                 # ファイル単位のロック
│   ├── migration.lock
│   └── package.lock
└── tasks/                 # タスク管理
    └── active-tasks.json
```

#### Lock ファイル形式

**機能ロック**: `.locks/features/{feature-name}.lock`
```json
{
  "feature": "posts",
  "agent": "agent-1",
  "task": "記事詳細ページ実装",
  "lockedAt": "2026-02-09T10:00:00Z",
  "estimatedDuration": "2h",
  "lockedFiles": [
    "src/app/(public)/posts/[slug]/page.tsx",
    "src/components/posts/PostContent.tsx",
    "docs/lv4/01-posts-feature.md"
  ]
}
```

**タスク管理**: `.locks/tasks/active-tasks.json`
```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "記事詳細ページ実装",
      "feature": "posts",
      "status": "in_progress",
      "assignedTo": "agent-1",
      "startedAt": "2026-02-09T10:00:00Z",
      "files": ["src/app/(public)/posts/[slug]/page.tsx"]
    },
    {
      "id": "task-002",
      "title": "認証機能実装",
      "feature": "auth",
      "status": "pending",
      "assignedTo": null,
      "startedAt": null,
      "files": []
    }
  ]
}
```

---

### 🚦 作業開始前のルール

#### 1. タスク選択
```bash
# 1. active-tasks.json を読む
# 2. status が "pending" かつ assignedTo が null のタスクを探す
# 3. 自分のエージェントIDを assignedTo に設定
# 4. status を "in_progress" に変更
```

#### 2. Lock取得手順
```bash
# STEP 1: 機能ロックを確認
if [ -f .locks/features/{feature-name}.lock ]; then
  echo "Feature is locked by another agent. Waiting or selecting another task."
  exit 1
fi

# STEP 2: ロックファイルを作成
cat > .locks/features/{feature-name}.lock <<EOF
{
  "feature": "{feature-name}",
  "agent": "{your-agent-id}",
  "task": "{task-title}",
  "lockedAt": "$(date -Iseconds)",
  "estimatedDuration": "2h",
  "lockedFiles": [
    "src/app/...",
    "docs/lv4/..."
  ]
}
EOF

# STEP 3: Git add & commit
git add .locks/features/{feature-name}.lock
git commit -m "lock: {feature-name} feature locked by {agent-id}"
git push
```

#### 3. Lock取得失敗時の対応
- **他のタスクを選択**: pending状態のタスクから選ぶ
- **待機**: 10分後に再試行
- **タイムアウトチェック**: 4時間以上経過しているロックは強制解除可能

---

### 🔓 作業完了後のルール

#### 1. Lock解放手順
```bash
# STEP 1: ロックファイルを削除
rm .locks/features/{feature-name}.lock

# STEP 2: タスクを完了に更新
# active-tasks.json の該当タスクを "status": "completed" に変更

# STEP 3: Git commit
git add .locks/
git commit -m "unlock: {feature-name} feature completed by {agent-id}"
git push
```

#### 2. 実装状況ドキュメントの更新
```markdown
# docs/lv4/{feature-name}-feature.md を更新

## ✅ 実装完了機能
### X. {実装した機能名}
- ✅ 機能A実装完了
- ✅ 機能B実装完了

## 📝 実装メモ
- 実装日: 2026-02-09
- 担当エージェント: agent-1
- 所要時間: 2時間
- 参考にした実装: ...
```

---

## 📋 タスクの進め方

### 1. タスク選択のガイドライン

#### 優先順位（高 → 低）
1. **優先度: 高 🔥** - 重要機能（記事詳細ページ、認証など）
2. **優先度: 中 🟡** - 中程度（プロジェクト作成フォームなど）
3. **優先度: 低 ⏸️** - 後回し（ダッシュボード統計など）

#### 独立性の確認
- **依存関係なし**: すぐに着手可能
- **依存関係あり**: 前提タスクが完了してから着手

#### タスク例（並列実行可能）
```
✅ 並列実行OK:
├─ 記事詳細ページ実装（posts機能）
├─ 認証機能実装（auth機能）
└─ プロジェクト作成フォーム実装（projects機能）

❌ 並列実行NG:
├─ 記事作成Server Actions実装
└─ 記事作成画面の保存処理統合  ← 上記に依存
```

---

### 2. 実装手順

#### STEP 1: ドキュメント確認
```bash
# 担当機能のドキュメントを読む
cat docs/lv4/{feature-name}-feature.md

# 次のステップを確認
# → "🎯 次のステップ" セクションを参照
```

#### STEP 2: Lock取得
```bash
# 機能ロックを取得（前述の手順）
# .locks/features/{feature-name}.lock を作成
```

#### STEP 3: 実装
```bash
# 実装例を参考にコード生成
# 例: docs/lv4/01-posts-feature.md の "💡 実装のヒント" セクション

# 必要なファイル:
# - src/app/(public)/posts/[slug]/page.tsx
# - src/components/posts/PostContent.tsx
# - src/components/posts/TableOfContents.tsx
```

#### STEP 4: テスト
```bash
# 開発サーバー起動
npm run dev

# 型チェック
npx tsc --noEmit

# Lint
npm run lint

# 動作確認
# → ブラウザで該当ページを開いて確認
```

#### STEP 5: コミット
```bash
# コミットメッセージ規約に従う（後述）
git add .
git commit -m "feat: 記事詳細ページ実装完了

- PostContent コンポーネント作成（Tiptap JSON レンダリング）
- TableOfContents コンポーネント作成（h2/h3 から自動生成）
- 関連記事表示統合
- シェアボタン実装
- OGP 設定追加

Refs: docs/lv4/01-posts-feature.md

Co-Authored-By: Agent-1 <agent-1@ohmyopencode.ai>"
```

#### STEP 6: ドキュメント更新
```bash
# 実装状況ドキュメントを更新
# docs/lv4/{feature-name}-feature.md の「実装状況サマリー」を更新

git add docs/lv4/
git commit -m "docs: 記事詳細ページ実装状況を更新"
```

#### STEP 7: Lock解放
```bash
# ロックファイルを削除
rm .locks/features/{feature-name}.lock

git add .locks/
git commit -m "unlock: posts feature completed by agent-1"
git push
```

---

## 🔀 Git コミットメッセージ規約

### 基本フォーマット
```
<type>: <subject>

<body>

<footer>
```

### Type（必須）
- **feat**: 新機能追加
- **fix**: バグ修正
- **docs**: ドキュメント更新
- **style**: コードフォーマット（機能変更なし）
- **refactor**: リファクタリング
- **test**: テスト追加・修正
- **chore**: ビルド・補助ツール変更
- **lock**: Lock取得
- **unlock**: Lock解放

### 例
```bash
# 機能追加
git commit -m "feat: 記事詳細ページ実装完了

- PostContent コンポーネント作成
- 目次自動生成機能
- 関連記事表示

Refs: docs/lv4/01-posts-feature.md

Co-Authored-By: Agent-1 <agent-1@ohmyopencode.ai>"

# Lock取得
git commit -m "lock: posts feature locked by agent-1"

# Lock解放
git commit -m "unlock: posts feature completed by agent-1"

# ドキュメント更新
git commit -m "docs: 記事詳細ページ実装状況を更新"
```

---

## 🚨 競合発生時の対処

### ファイル編集の競合
```bash
# 1. Pull して競合を確認
git pull

# 2. 競合箇所を確認
git status

# 3. マージツールで解決
# または手動で編集

# 4. 解決後にコミット
git add .
git commit -m "fix: merge conflict resolved"
```

### Lock の強制解除（タイムアウト）
```bash
# ロックが4時間以上前の場合のみ解除可能
if [ $(date -d "$(cat .locks/features/{feature}.lock | jq -r .lockedAt)" +%s) -lt $(date -d "4 hours ago" +%s) ]; then
  rm .locks/features/{feature}.lock
  git add .locks/
  git commit -m "unlock: force unlock {feature} due to timeout"
  git push
fi
```

---

## 📊 作業状況の確認

### 現在の Lock 状況
```bash
# 全てのロックを確認
ls -la .locks/features/

# タスク一覧を確認
cat .locks/tasks/active-tasks.json
```

### 実装済み機能の確認
```bash
# 全体進捗を確認
cat docs/lv4/00-overview.md

# 各機能の進捗を確認
cat docs/lv4/01-posts-feature.md
cat docs/lv4/02-projects-feature.md
# ...
```

---

## 🎯 推奨タスク（並列実行可能）

### タスク1: 記事詳細ページ実装（優先度: 高）
- **ドキュメント**: `docs/lv4/01-posts-feature.md`
- **Lock**: `posts`
- **所要時間**: 1-2日
- **依存関係**: なし
- **実装ファイル**:
  - `src/app/(public)/posts/[slug]/page.tsx`
  - `src/components/posts/PostContent.tsx`
  - `src/components/posts/TableOfContents.tsx`

### タスク2: 認証機能実装（優先度: 高）
- **ドキュメント**: `docs/lv4/06-auth-feature.md`
- **Lock**: `auth`
- **所要時間**: 2-3日
- **依存関係**: なし
- **実装ファイル**:
  - `src/lib/supabase/auth.ts`
  - `src/app/(admin)/login/page.tsx`
  - `src/lib/supabase/middleware.ts`

### タスク3: プロジェクト作成フォーム実装（優先度: 中）
- **ドキュメント**: `docs/lv4/02-projects-feature.md`
- **Lock**: `projects`
- **所要時間**: 2-3日
- **依存関係**: なし
- **実装ファイル**:
  - `src/app/(admin)/admin/projects/new/page.tsx`

---

## ⚙️ コード生成ルール（重要）

### 1. 設計書ベースの開発
- **必ず設計書を読んでから実装する**
- 場当たり的なコード生成は禁止
- 実装前に該当する設計書（docs/lv2, lv3）を確認

### 2. コメントの最小化
```typescript
// ❌ 冗長なコメント（不要）
// この関数は記事を取得します
export async function getPostBySlug(slug: string) { ... }

// ✅ 必要最小限（処理が複雑な場合のみ）
export async function getPostBySlug(slug: string) {
  // 閲覧数を自動インクリメント（バックグラウンド処理）
  incrementViewCount(slug)
  ...
}
```

### 3. 型安全性
```typescript
// ✅ 厳密な型定義
import type { PostWithTags } from '@/types/database'

export async function getPostBySlug(slug: string): Promise<PostWithTags | null> {
  // ...
}
```

### 4. SSR対応（Tiptap）
```typescript
// ✅ 必須設定
const editor = useEditor({
  immediatelyRender: false,  // SSR対応に必須
  extensions: [...]
})
```

### 5. セキュリティ
- SQLインジェクション対策: Supabase SDKのパラメータ化クエリ使用
- XSS対策: DOMPurify + Tiptapサニタイズ
- 認証: Supabase Auth + RLS

---

## 🛠️ よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lint
npm run lint

# 型チェック
npx tsc --noEmit

# パッケージ追加（Lock取得後のみ）
npm install [package-name]

# データベースマイグレーション（Lock取得後のみ）
supabase migration new [name]
supabase db push
```

---

## 📞 サポート・質問

### エラー発生時
1. **コンソールログを確認**: エラーメッセージを読む
2. **設計書を再確認**: docs/lv2, lv3 を読む
3. **実装例を参照**: 既存の実装パターンを確認
4. **メモを残す**: 解決方法を docs/lv4/ に記録

### 不明点がある場合
- **MEMORY.md** に注意点が記載されている可能性あり
- **docs/lv3/component-spec.md** にコンポーネント仕様
- **docs/lv2/api-spec.md** に Server Actions仕様

---

## ✅ 作業前チェックリスト

- [ ] `docs/lv4/00-overview.md` を読んだ
- [ ] `docs/claude.md` と `docs/default/DDD.md` を読んだ
- [ ] 担当機能のドキュメント（`docs/lv4/XX-feature.md`）を読んだ
- [ ] Lock を取得した（`.locks/features/{feature}.lock` を作成）
- [ ] `active-tasks.json` に自分のタスクを記録した

## ✅ 作業完了後チェックリスト

- [ ] コードが正常に動作することを確認した
- [ ] 型チェック（`npx tsc --noEmit`）を実行した
- [ ] Lint（`npm run lint`）を実行した
- [ ] コミットメッセージ規約に従ってコミットした
- [ ] 実装状況ドキュメント（`docs/lv4/XX-feature.md`）を更新した
- [ ] Lock を解放した（`.locks/features/{feature}.lock` を削除）
- [ ] `active-tasks.json` のステータスを "completed" に更新した

---

## 🎉 おわりに

このガイドに従うことで、**複数のエージェントが安全かつ効率的に並列開発**できます。

不明点があれば、このドキュメントを更新して知見を共有してください 🤝

---

**最終更新**: 2026-02-09
**メンテナ**: Claude Sonnet 4.5
