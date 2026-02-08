# Lock ディレクトリ

このディレクトリは、複数のAIエージェントが並列で作業する際の**編集競合を防ぐ**ために使用します。

---

## 📁 ディレクトリ構造

```
.locks/
├── features/              # 機能単位のロック
│   ├── posts.lock         # 読み物機能
│   ├── projects.lock      # 作ったもの機能
│   ├── auth.lock          # 認証機能
│   └── ...
├── files/                 # ファイル単位のロック
│   ├── migration.lock     # データベースマイグレーション中
│   └── package.lock       # package.json編集中
└── tasks/                 # タスク管理
    └── active-tasks.json  # 全タスクの状態管理
```

---

## 🔒 Lock の取得・解放

### Lock取得
```bash
# 機能ロックを作成
cat > .locks/features/posts.lock <<EOF
{
  "feature": "posts",
  "agent": "agent-1",
  "task": "記事詳細ページ実装",
  "lockedAt": "$(date -Iseconds)",
  "estimatedDuration": "2h",
  "lockedFiles": [
    "src/app/(public)/posts/[slug]/page.tsx",
    "docs/lv4/01-posts-feature.md"
  ]
}
EOF

git add .locks/
git commit -m "lock: posts feature locked by agent-1"
git push
```

### Lock解放
```bash
# ロックファイルを削除
rm .locks/features/posts.lock

git add .locks/
git commit -m "unlock: posts feature completed by agent-1"
git push
```

---

## 📋 タスク管理

### active-tasks.json

全タスクの状態を管理するファイルです。

#### タスクの状態
- `pending`: 未着手（誰でも着手可能）
- `in_progress`: 作業中（assignedToに担当者名）
- `completed`: 完了
- `blocked`: ブロック中（依存タスクが未完了）

#### タスク選択のルール
1. `status` が `pending` のタスクを探す
2. `dependencies` が空、または全て完了しているタスクを選ぶ
3. `assignedTo` を自分のエージェントIDに設定
4. `status` を `in_progress` に変更
5. `startedAt` に現在時刻を設定

---

## ⚠️ 注意事項

### Lock のタイムアウト
- **4時間以上前のロック**は強制解除可能
- タイムアウト確認スクリプト（例）:
```bash
if [ $(date -d "$(cat .locks/features/posts.lock | jq -r .lockedAt)" +%s) -lt $(date -d "4 hours ago" +%s) ]; then
  echo "Lock has timed out. Force unlocking..."
  rm .locks/features/posts.lock
fi
```

### Git Pull 必須
- Lock取得前に必ず `git pull` を実行
- 他のエージェントのLockを確認

### コミット順序
1. Lock取得 → コミット → プッシュ
2. 作業実施
3. Lock解放 → コミット → プッシュ

---

## 🔗 関連ドキュメント

- **[AGENT_GUIDE.md](../docs/AGENT_GUIDE.md)** - エージェント向け実装ガイド

---

**最終更新**: 2026-02-09
