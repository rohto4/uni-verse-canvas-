# 進行中（Progress）機能 実装状況

進行中アイテムの一覧・作成・編集機能の実装状況です。

**最終更新**: 2026-02-09
**進捗率**: 60%

---

## 📊 実装状況サマリー

| 機能 | 状況 | ファイル |
|------|------|---------|
| 進行中一覧ページ | ✅ 完了 | `src/app/(public)/progress/page.tsx` |
| 進行中作成画面 | ⏳ 未実装 | `src/app/(admin)/admin/in-progress/new/page.tsx` |
| 進行中編集画面 | ⏳ 未実装 | `src/app/(admin)/admin/in-progress/[id]/page.tsx` |
| Server Actions Read | ✅ 完了 | `src/lib/actions/in-progress.ts` |
| Server Actions CUD | ⏳ 未実装 | - |

---

## ✅ 実装完了機能

### 進行中一覧ページ（公開側）

**ファイル**: `src/app/(public)/progress/page.tsx`

#### 実装機能
- ✅ ステータス別タブ表示（未着手/中断中/進行中/完了）
- ✅ 進行中アイテム一覧表示
- ✅ プログレスバー表示（0-100%）
- ✅ ステータスバッジ
- ✅ 完了後のプロジェクトリンク（→ `/works/[slug]`）
- ✅ DB連携済み

#### 使用Server Actions
```typescript
// ステータス別取得
const items = await getInProgressItems(status)
```

---

## ⏳ 未実装機能

### 1. 進行中作成画面

**ファイル**: `src/app/(admin)/admin/in-progress/new/page.tsx`（未作成）

#### 実装予定機能
- ⏳ 基本情報入力（タイトル・説明）
- ⏳ ステータス選択
- ⏳ 進捗率入力（スライダー）
- ⏳ 開始日・完了日入力
- ⏳ メモ入力
- ⏳ 完了時のプロジェクトリンク選択

### 2. 進行中編集画面

**ファイル**: `src/app/(admin)/admin/in-progress/[id]/page.tsx`（未作成）

#### 実装予定機能
- ⏳ データ取得・表示
- ⏳ 更新処理
- ⏳ 削除処理

### 3. Server Actions CUD

**ファイル**: `src/lib/actions/in-progress.ts`（追加予定）

```typescript
// 作成
export async function createInProgress(input: CreateInProgressInput): Promise<InProgressWithProject | null>

// 更新
export async function updateInProgress(id: string, input: Partial<CreateInProgressInput>): Promise<InProgressWithProject | null>

// 削除
export async function deleteInProgress(id: string): Promise<{ success: boolean; error?: string }>
```

---

## 🎯 次のステップ

### 優先度: 低 ⏸️

#### 1. 進行中アイテムCRUD実装（2-3日）

**実装内容**:
1. Server Actions CUD実装
2. 作成画面実装
3. 編集画面実装
4. 管理画面一覧ページ実装

**備考**:
- 優先度は低いため、他の機能実装後に着手

---

## 🔗 関連ドキュメント

- [データスキーマ](../lv2/data-schema.md) - InProgressテーブル定義
- [Server Actions仕様](../lv2/api-spec.md) - getInProgressItems(), getInProgressById()
- [全体概要](./00-overview.md)

---

**最終更新**: 2026-02-09
