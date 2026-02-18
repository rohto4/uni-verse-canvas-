# OhMyOpenCode 設定サマリー

最終更新: 2026-02-15

---

## 📋 プロジェクト基本情報

```yaml
projectName: [uni-verse-canvas]
description: [多機能ポートフォリオ重視型個人HP]
version: 3.0.0
```

---

## 🤖 モデル設定

| Model ID | Provider | Display Name | Description | Max Tokens | Temperature |
|----------|----------|--------------|-------------|------------|-------------|
| `claude-sonnet-4-5-20250929` | anthropic | Claude Sonnet 4.5 | 高品質な設計・レビュー・ドキュメント生成に最適 | 8192 | 0.7 |
| `gpt-5.2` | openai | GPT 5.2 (OAuth) | 高度な推論・複雑なロジック実装に最適 | 4096 | 0.7 |
| `gpt-5.2-codex` | openai | GPT 5.2 Codex (OAuth) | コード生成特化モデル（実装・リファクタリング） | 4096 | 0.5 |
| `gpt-5.1-codex-mini` | openai | GPT 5.1 Codex Mini (OAuth) | 高速・軽量なコード生成（テスト・検索） | 2048 | 0.5 |
| `gemini-3-pro-preview` | google | Gemini 3 Pro | 視覚的UI/UX生成に最適（マルチモーダル対応）今は使わない | 4096 | 0.7 |

---

## 🎯 エージェント設定 & フォールバックマトリクス

### メインエージェント

| Agent ID | Role | Model | Fallback | Priority | Built-in |
|----------|------|-------|----------|----------|----------|
| `prometheus-planner` | プランナー（計画のみ、コード書かない） | `claude-sonnet-4.5` | `gpt-5.2` | critical | prometheus |
| `atlas-orchestrator` | オーケストレーター（実行管理、/start-work必須） | `gpt-5.2` | `claude-sonnet-4.5` | critical | atlas |

### サブエージェント（ビルトイン）

| Agent ID | Role | Model | Fallback | Priority | Built-in |
|----------|------|-------|----------|----------|----------|
| `sisyphus-implementer` | 汎用実装（タスク完遂型） | `gpt-5.2-codex` | `gpt-5.1-codex-mini` | high | sisyphus |
| `oracle-architect` | アーキテクチャ・デバッグ | `claude-sonnet-4.5` | `gpt-5.2` | high | oracle |
| `librarian-researcher` | ドキュメント・コード検索 | `gpt-5.2` | `gpt-5.1-codex-mini` | medium | librarian |
| `explore-searcher` | 高速grep検索 | `gpt-5.1-codex-mini` | `NONE` | low | explore |

### サブエージェント（カスタム）

| Agent ID | Role | Model | Fallback | Priority | Type |
|----------|------|-------|----------|----------|------|
| `frontend-ui-ux-engineer` | フロントエンドUI/UX | `gpt-5.2-codex` | `claude-sonnet-4.5` | medium | built-in |
| `refactoring-specialist` | リファクタリング | `gpt-5.2-codex` | `gpt-5.1-codex-mini` | medium | custom |
| `e2e-tester` | E2Eテスト（ウェブ） | `gpt-5.1-codex-mini` | `gpt-5.2-codex` | high | custom |
| `logic-tester` | ロジックテスト（ユニット・統合） | `gpt-5.1-codex-mini` | `gpt-5.2-codex` | high | custom |
| `security-auditor` | セキュリティ監査 | `claude-sonnet-4.5` | `gpt-5.2` | medium | custom |
| `performance-optimizer` | パフォーマンス最適化 | `gpt-5.2-codex` | `NONE` | low | custom |

---

## 💰 トークン節約戦略

```yaml
fallbackStrategy: |
  重要度に応じてフォールバックを設定。
  優先度が低いエージェント（explore, performance-optimizer）はフォールバックなしでコスト重視。

monthlyLimit: |
  OAuthモデルは月額範囲内。
  通常は問題ないが、Miniモデルが頻繁に失敗する場合は注意。

monitoring: |
  月額使用量を定期的に確認し、フォールバック頻度が高い場合はモデルを調整。
```

---

## 🔗 参考リンク

- [Oh My OpenCode 公式サイト](https://ohmyopencode.com/)
- [Configuration Guide](https://ohmyopencode.com/configuration/)
- [Hooks Documentation](https://ohmyopencode.com/hooks/)
- [Agents Documentation](https://ohmyopencode.com/agents/)
- [GitHub Repository](https://github.com/code-yeongyu/oh-my-opencode)

---

## 📋 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-02-15 | 初版作成。11エージェント、フォールバックマトリクス設定 | Claude Sonnet 4.5 |

---

**最終更新**: 2026-02-15
