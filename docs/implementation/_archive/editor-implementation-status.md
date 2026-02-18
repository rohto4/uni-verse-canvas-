# 記事編集機能 実装状況 (Claude Reference)

## 実装完了日
2026-02-07

## 実装フェーズ
IMP-B: 記事作成画面（重要ページから順次実装）

---

## 1. Tiptapエディタ コア機能 ✅

### 1.1 基本エディタ
**ファイル**: `src/components/editor/TiptapEditor.tsx`

**実装機能**:
- ✅ SSR対応 (`immediatelyRender: false`)
- ✅ リサイズ可能なエディタ高さ（マウスドラッグ）
- ✅ フルスクリーンモード切替
- ✅ 文字数・単語数カウント表示
- ✅ プレースホルダー表示
- ✅ 編集可/不可モード切替

**拡張機能**:
- StarterKit（基本機能パック）
- Placeholder（空欄時のヒント）
- CharacterCount（文字カウント）
- Link（リンク挿入）
- Underline（下線）
- TextAlign（左・中央・右・両端揃え）
- Highlight（ハイライト・マルチカラー対応）
- TaskList / TaskItem（チェックリスト）
- Subscript / Superscript（下付き・上付き文字）
- TextStyle / Color（文字色）
- Dropcursor / Gapcursor（カーソル表示）

---

## 2. リッチツールバー ✅

### 2.1 テキスト装飾
**ファイル**: `src/components/editor/EditorToolbar.tsx`

**実装機能**:
- ✅ 太字 (Ctrl+B)
- ✅ 斜体 (Ctrl+I)
- ✅ 下線 (Ctrl+U)
- ✅ 打ち消し線 (Ctrl+Shift+X)
- ✅ インラインコード (Ctrl+E)
- ✅ 見出し1～4 (Ctrl+Alt+1～4)

### 2.2 リスト・引用
- ✅ 箇条書きリスト
- ✅ 番号付きリスト
- ✅ チェックリスト（タスクリスト）
- ✅ 引用ブロック
- ✅ 水平線

### 2.3 リンク・メディア
- ✅ リンク挿入・編集・削除ダイアログ
- ✅ 画像挿入（リサイズ可能）
- ✅ YouTube動画埋め込み
- ✅ 画像コピー＆ペースト対応
- ✅ 画像ドラッグ＆ドロップ対応

### 2.4 テーブル
- ✅ テーブル挿入（行・列数指定ダイアログ）
- ✅ テーブル削除（ツールバーボタン）
- ✅ 列リサイズ（ドラッグ）
- ✅ キーボードショートカット削除（Ctrl+Shift+Delete / Backspace）

### 2.5 整列・装飾
- ✅ テキスト整列（左・中央・右・両端）
- ✅ ハイライト（複数色対応）
- ✅ テキスト色変更（カラーピッカー）
- ✅ 書式クリア

### 2.6 その他
- ✅ 元に戻す / やり直し (Ctrl+Z / Ctrl+Y)
- ✅ 下付き文字 / 上付き文字
- ✅ ツールチップ（ショートカットキー表示）

---

## 3. カスタム拡張機能 ✅

### 3.1 リサイズ可能画像
**ファイル**: `src/components/editor/extensions/ResizableImage.tsx`

**実装機能**:
- ✅ ドラッグハンドルによる幅調整
- ✅ アスペクト比固定
- ✅ 最小100px / 最大1600px制限
- ✅ 二段組内ではデフォルト600px
- ✅ コピー＆ペースト対応
- ✅ 画像挿入後に自動改行

### 3.2 二段組レイアウト（2パターン）
**ファイル**: `src/components/editor/extensions/ColumnLayout.tsx`

**実装機能**:
- ✅ **背景色なし**: シンプルな2カラムレイアウト
- ✅ **薄い水色の背景**: `oklch(0.92 0.02 220)` の背景色付き
- ✅ 横並び / 縦積み表示切替（エディタ内）
- ✅ 削除ボタン
- ✅ レスポンシブ対応（モバイルは縦積み）

**CSS**: `src/styles/globals-pattern1-sky-coral.css`
- エディタ内: 点線枠付きで編集しやすく
- プレビュー/公開: 枠線なし、背景色のみ

### 3.3 削除可能テーブル
**ファイル**: `src/components/editor/extensions/TableWithDelete.tsx`

**実装機能**:
- ✅ ProseMirror Plugin経由のキーボード削除
- ✅ Ctrl+Shift+Delete でテーブル全削除
- ✅ Backspaceでテーブル後ろから削除
- ✅ ツールバーボタンでも削除可能

### 3.4 シンタックスハイライト
**ファイル**: Tiptap CodeBlockLowlight拡張

**実装機能**:
- ✅ コードブロック（lowlight使用）
- ✅ 黒背景 + 白文字スタイル（`oklch(0.15 0.02 230)`）
- ✅ エディタとプレビューで統一デザイン

---

## 4. 記事作成画面レイアウト ✅

### 4.1 ページ構成
**ファイル**: `src/app/(admin)/admin/posts/new/page.tsx`

**実装機能**:
- ✅ タイトル入力欄
- ✅ 抜粋（excerpt）入力欄
- ✅ タグ入力（カンマ区切り）
- ✅ カテゴリ選択
- ✅ 公開状態選択（下書き/公開/限定公開）
- ✅ Tiptapエディタ（最大幅1600px）
- ✅ プレビューボタン（別タブで開く）
- ✅ 下書き保存/公開ボタン

### 4.2 メタデータエリア
- ✅ 3カラムグリッドレイアウト（ページ下部）
- ✅ カテゴリ・タグ・公開状態を横並び配置

---

## 5. プレビュー機能 ✅

### 5.1 プレビュー画面
**ファイル**: `src/app/(admin)/admin/posts/preview/page.tsx`

**実装機能**:
- ✅ 公開側の記事レイアウトを使用
- ✅ Header表示（サイトヘッダー統合）
- ✅ デバイス切替（Desktop / Tablet / Mobile）
- ✅ 背景デザイン統合（bg-universe / cloud-section）
- ✅ 目次サイドバー表示
- ✅ タグ・日付・閲覧数表示
- ✅ 抜粋の強調表示
- ✅ localStorage経由でデータ受け渡し

### 5.2 プレビューコントロールバー
- ✅ ヘッダー直下にsticky配置
- ✅ デバイス幅切替ボタン
- ✅ 閉じるボタン
- ✅ プレビューモード表示

---

## 6. 記事表示ページ ✅

### 6.1 公開記事ページ
**ファイル**: `src/app/(public)/posts/[slug]/page.tsx`

**実装機能**:
- ✅ ヘッダーと同じ横幅（containerクラス）
- ✅ レスポンシブ余白（px-6 / md:px-12 / lg:px-16）
- ✅ 記事本文エリア最大化（flex-1）
- ✅ 目次サイドバー（右端配置、lg:w-64）
- ✅ タグ・日付・閲覧数・読了時間表示
- ✅ カバー画像エリア
- ✅ シェアボタン（Twitter / Facebook / Link）
- ✅ 関連記事表示

### 6.2 スタイリング
- ✅ Tiptap proseスタイル適用
- ✅ 二段組レイアウト対応（背景色条件分岐）
- ✅ コードブロック統一デザイン
- ✅ 行間調整（line-height: 1.6）
- ✅ 段落間余白調整（margin: 0.25rem）

---

## 7. 管理画面共通 ✅

### 7.1 AdminLayout
**ファイル**: `src/app/(admin)/layout.tsx`

**実装機能**:
- ✅ AdminSidebar統合
- ✅ サイドバー開閉トグル
- ✅ フルスクリーン対応（h-screen / overflow-hidden）

### 7.2 AdminSidebar
**ファイル**: `src/components/layout/AdminSidebar.tsx`

**実装機能**:
- ✅ Blue Archive風グラデーション（右端ライン）
- ✅ ナビゲーションメニュー
- ✅ 「サイトを表示」ボタン（下部固定）
- ✅ 開閉アニメーション

---

## 8. CSS・デザインシステム ✅

### 8.1 グローバルスタイル
**ファイル**: `src/styles/globals-pattern1-sky-coral.css`

**実装内容**:
- ✅ Blue Archive風カラースキーム（oklch）
- ✅ 空 → 宇宙 → 雲の背景グラデーション
- ✅ Tiptap proseスタイルカスタマイズ
- ✅ 二段組レイアウトCSS
- ✅ リサイズ可能画像CSS
- ✅ テーブルスタイル
- ✅ コードブロックスタイル（黒背景）
- ✅ ツールチップkbdスタイル（ダーク背景）
- ✅ レスポンシブ対応

---

## 9. 未実装機能（次フェーズ）

### 9.1 データ連携
- ⏳ Supabase統合
- ⏳ 記事データの登録・更新・削除
- ⏳ 画像アップロード（ストレージ連携）
- ⏳ タグ・カテゴリマスタ管理

### 9.2 記事投稿フロー
- ⏳ バリデーション
- ⏳ エラーハンドリング
- ⏳ 下書き保存
- ⏳ 公開処理
- ⏳ 更新処理

### 9.3 記事一覧
- ⏳ 「読み物」ページ（公開側）
- ⏳ 管理画面の記事一覧
- ⏳ 検索・フィルタリング
- ⏳ ページネーション

### 9.4 その他
- ⏳ 画像最適化
- ⏳ SEOメタタグ
- ⏳ OGP設定
- ⏳ 目次自動生成（h2/h3から）
- ⏳ 読了時間自動計算

---

## 10. 技術メモ

### 10.1 重要な実装パターン
```typescript
// SSR対応（必須）
const editor = useEditor({
  immediatelyRender: false,
  // ...
})

// Tiptap拡張のnamed import（必須）
import { Table } from "@tiptap/extension-table"

// 二段組挿入
editor.chain().focus().insertContent({
  type: "columnLayout",
  attrs: { bgColor: "blue" }, // "none" | "blue"
  content: [
    { type: "columnItem", content: [...] },
    { type: "columnItem", content: [...] },
  ],
}).run()
```

### 10.2 トラブルシューティング
- **React is not defined**: useEffectなど直接import必要
- **flushSync error**: 画像幅検出は`img.onload`イベント使用
- **二段組が表示されない**: CSS selector に`div[data-node-view-content-react]`必要
- **コードブロック背景色**: HTMLAttributes の`bg-muted`を削除し、CSS で`!important`指定

---

## 11. パフォーマンス・最適化

### 11.1 実装済み
- ✅ useCallback でイベントハンドラメモ化
- ✅ Tiptap の immediatelyRender: false でSSR高速化
- ✅ CSS で transition 最小限に

### 11.2 今後の改善候補
- ⏳ 画像の遅延読み込み（Lazy Loading）
- ⏳ エディタコンテンツのデバウンス保存
- ⏳ 大量の拡張機能の遅延ロード

---

## 12. テスト状況

### 12.1 手動テスト完了項目
- ✅ エディタの基本操作
- ✅ 画像リサイズ
- ✅ 二段組挿入・削除
- ✅ テーブル挿入・削除
- ✅ プレビュー表示
- ✅ レスポンシブデザイン

### 12.2 自動テスト（未実装）
- ⏳ コンポーネント単体テスト
- ⏳ E2Eテスト（記事投稿フロー）
- ⏳ ビジュアルリグレッションテスト

---

## 13. ドキュメント更新状況

### 13.1 更新済み
- ✅ MEMORY.md（開発メモ）
- ✅ このファイル（editor-implementation-status.md）

### 13.2 更新予定（IMP-D）
- ⏳ docs/specs/component-spec.md（コンポーネント仕様）
- ⏳ docs/specs/data-schema.md（データスキーマ）
- ⏳ docs/specs/api-spec.md（API仕様）

---

## 付録: 主要ファイル一覧

### コンポーネント
- `src/components/editor/TiptapEditor.tsx`
- `src/components/editor/EditorToolbar.tsx`
- `src/components/editor/extensions/ColumnLayout.tsx`
- `src/components/editor/extensions/ResizableImage.tsx`
- `src/components/editor/extensions/TableWithDelete.tsx`

### ページ
- `src/app/(admin)/admin/posts/new/page.tsx`
- `src/app/(admin)/admin/posts/preview/page.tsx`
- `src/app/(public)/posts/[slug]/page.tsx`

### レイアウト
- `src/app/(admin)/layout.tsx`
- `src/components/layout/AdminSidebar.tsx`

### スタイル
- `src/styles/globals-pattern1-sky-coral.css`

---

**最終更新**: 2026-02-07
**次回タスク**: 記事データ登録機能・Supabase連携
