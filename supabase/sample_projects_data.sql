-- プロジェクト詳細ページ確認用サンプルデータ
-- 既存のプロジェクトデータを更新して、新しいフィールドにデータを追加

-- UniVerse Canvas プロジェクトの更新
UPDATE projects
SET
  steps_count = 100000,
  used_ai = '["Claude Sonnet 4.5", "GitHub Copilot"]'::jsonb,
  gallery_images = ARRAY[
    'https://placehold.co/800x600/0ea5e9/ffffff?text=Home+Page',
    'https://placehold.co/800x600/8b5cf6/ffffff?text=Blog+Posts',
    'https://placehold.co/800x600/ec4899/ffffff?text=Project+Gallery',
    'https://placehold.co/800x600/f97316/ffffff?text=Admin+Dashboard',
    'https://placehold.co/800x600/22c55e/ffffff?text=Editor+View'
  ],
  tech_stack = '{"TypeScript": 45.2, "CSS": 25.3, "JavaScript": 20.1, "HTML": 9.4}'::jsonb,
  content = '{
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "プロジェクト概要"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "UniVerse Canvasは、Next.js 15とSupabaseを使用して構築された、モダンな個人ポートフォリオ＆ブログシステムです。ドキュメント駆動開発（DDD）を採用し、10万行規模の大規模開発を想定して設計されています。"}
        ]
      },
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "主な機能"}]
      },
      {
        "type": "bulletList",
        "content": [
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Tiptap 2.xベースのリッチテキストエディタ"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "画像リサイズ・二段組レイアウト対応"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "タグフィルタ・検索機能"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Server Actionsによる型安全なデータ操作"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Blue Archive風のカラーデザイン"}]}]}
        ]
      },
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "技術的な特徴"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "App Routerを使用した最新のNext.js構成、Server ComponentとClient Componentの適切な分離、Supabase PostgreSQLによる高速なデータベースアクセス、Tailwind CSS v4による洗練されたデザインシステムを実現しています。"}
        ]
      }
    ]
  }'::jsonb
WHERE slug = 'universe-canvas';

-- Task Manager Pro プロジェクトの更新
UPDATE projects
SET
  steps_count = 35000,
  used_ai = '["GitHub Copilot", "ChatGPT"]'::jsonb,
  gallery_images = ARRAY[
    'https://placehold.co/800x600/3b82f6/ffffff?text=Dashboard+View',
    'https://placehold.co/800x600/8b5cf6/ffffff?text=Kanban+Board',
    'https://placehold.co/800x600/ec4899/ffffff?text=Task+Details',
    'https://placehold.co/800x600/f59e0b/ffffff?text=Team+Collaboration'
  ],
  tech_stack = '{"TypeScript": 52.8, "React": 28.5, "CSS": 15.2, "JavaScript": 3.5}'::jsonb,
  content = '{
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "プロジェクト概要"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "チーム向けのタスク管理アプリケーション。React + Firebaseで構築され、リアルタイム同期、カンバンボード、Slack連携機能を備えています。"}
        ]
      },
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "主な機能"}]
      },
      {
        "type": "bulletList",
        "content": [
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "リアルタイムタスク同期"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "ドラッグ&ドロップ対応カンバンボード"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Slack通知連携"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "チームコラボレーション機能"}]}]}
        ]
      }
    ]
  }'::jsonb
WHERE slug = 'task-manager-pro';

-- CLI Toolkit プロジェクトの更新
UPDATE projects
SET
  steps_count = 8000,
  used_ai = NULL,
  gallery_images = ARRAY[
    'https://placehold.co/800x600/1e293b/ffffff?text=CLI+Terminal',
    'https://placehold.co/800x600/334155/ffffff?text=Code+Generation'
  ],
  tech_stack = '{"TypeScript": 85.2, "JavaScript": 10.3, "Shell": 4.5}'::jsonb,
  content = '{
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "プロジェクト概要"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "開発効率化のためのCLIツールキット。プロジェクト生成、コードスニペット管理、デプロイ自動化機能を提供します。"}
        ]
      },
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "コマンド例"}]
      },
      {
        "type": "codeBlock",
        "attrs": {"language": "bash"},
        "content": [{"type": "text", "text": "# プロジェクト作成\\ncli-toolkit create my-app\\n\\n# スニペット管理\\ncli-toolkit snippet add react-component\\n\\n# デプロイ\\ncli-toolkit deploy production"}]
      }
    ]
  }'::jsonb
WHERE slug = 'cli-toolkit';

-- Weather Dashboard プロジェクトの更新
UPDATE projects
SET
  steps_count = 12000,
  used_ai = '["ChatGPT"]'::jsonb,
  gallery_images = ARRAY[
    'https://placehold.co/800x600/0ea5e9/ffffff?text=Weather+Overview',
    'https://placehold.co/800x600/06b6d4/ffffff?text=Forecast+Chart',
    'https://placehold.co/800x600/22d3ee/ffffff?text=City+Search'
  ],
  tech_stack = '{"JavaScript": 48.3, "Vue": 32.1, "CSS": 15.8, "HTML": 3.8}'::jsonb,
  content = '{
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "プロジェクト概要"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "Vue.jsで構築された天気情報ダッシュボード。複数地域の天気予報、グラフ表示、アラート機能を備えています。"}
        ]
      },
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "使用API"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "OpenWeatherMap APIを使用して、リアルタイムの天気情報を取得しています。"}
        ]
      }
    ]
  }'::jsonb
WHERE slug = 'weather-dashboard';

-- Portfolio Template プロジェクトの更新
UPDATE projects
SET
  steps_count = 5000,
  used_ai = NULL,
  gallery_images = ARRAY[
    'https://placehold.co/800x600/8b5cf6/ffffff?text=Hero+Section',
    'https://placehold.co/800x600/a855f7/ffffff?text=Portfolio+Grid',
    'https://placehold.co/800x600/c084fc/ffffff?text=Contact+Form'
  ],
  tech_stack = '{"TypeScript": 40.5, "Astro": 35.2, "CSS": 20.3, "JavaScript": 4.0}'::jsonb,
  content = '{
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "プロジェクト概要"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "Astroで構築された開発者向けポートフォリオテンプレート。カスタマイズ可能なデザイン、ダークモード対応。"}
        ]
      },
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "特徴"}]
      },
      {
        "type": "bulletList",
        "content": [
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "超高速ビルド（Astro Island Architecture）"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "ダークモード対応"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "SEO最適化済み"}]}]}
        ]
      }
    ]
  }'::jsonb
WHERE slug = 'portfolio-template';

-- E-commerce API プロジェクトの更新
UPDATE projects
SET
  steps_count = 25000,
  used_ai = '["GitHub Copilot"]'::jsonb,
  gallery_images = ARRAY[
    'https://placehold.co/800x600/ef4444/ffffff?text=API+Documentation',
    'https://placehold.co/800x600/f87171/ffffff?text=Admin+Panel'
  ],
  tech_stack = '{"TypeScript": 92.4, "JavaScript": 5.1, "Shell": 2.5}'::jsonb,
  content = '{
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "プロジェクト概要"}]
      },
      {
        "type": "paragraph",
        "content": [
          {"type": "text", "text": "NestJSで構築されたEコマースプラットフォーム向けREST API。商品管理、注文処理、決済連携、在庫管理機能を提供します。"}
        ]
      },
      {
        "type": "heading",
        "attrs": {"level": 2},
        "content": [{"type": "text", "text": "主要エンドポイント"}]
      },
      {
        "type": "bulletList",
        "content": [
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "GET /api/products - 商品一覧取得"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "POST /api/orders - 注文作成"}]}]},
          {"type": "listItem", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "PUT /api/inventory - 在庫更新"}]}]}
        ]
      }
    ]
  }'::jsonb
WHERE slug = 'ecommerce-api';

-- 確認用: 更新されたプロジェクトを表示
SELECT
  title,
  slug,
  steps_count,
  used_ai,
  array_length(gallery_images, 1) as image_count,
  tech_stack
FROM projects
ORDER BY created_at DESC;
