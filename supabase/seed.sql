-- Clear existing data (for development only)
TRUNCATE TABLE post_project_links, post_links, project_tags, post_tags, in_progress, projects, posts, tags, pages CASCADE;

-- Insert Tags
INSERT INTO tags (id, name, slug, description, color) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Next.js', 'nextjs', 'The React Framework for Production', '#000000'),
  ('22222222-2222-2222-2222-222222222222', 'React', 'react', 'A JavaScript library for building user interfaces', '#61DAFB'),
  ('33333333-3333-3333-3333-333333333333', 'TypeScript', 'typescript', 'TypeScript is JavaScript with syntax for types', '#3178C6'),
  ('44444444-4444-4444-4444-444444444444', 'Supabase', 'supabase', 'The Open Source Firebase Alternative', '#3ECF8E'),
  ('55555555-5555-5555-5555-555555555555', 'Tailwind CSS', 'tailwindcss', 'A utility-first CSS framework', '#06B6D4'),
  ('66666666-6666-6666-6666-666666666666', 'Tiptap', 'tiptap', 'The headless editor framework for web artisans', '#000000'),
  ('77777777-7777-7777-7777-777777777777', 'Firebase', 'firebase', 'Google Firebase Platform', '#FFCA28'),
  ('88888888-8888-8888-8888-888888888888', 'Redux', 'redux', 'A Predictable State Container for JS Apps', '#764ABC'),
  ('99999999-9999-9999-9999-999999999999', 'Node.js', 'nodejs', 'Node.js JavaScript runtime', '#339933'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Vue.js', 'vuejs', 'The Progressive JavaScript Framework', '#4FC08D'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PostgreSQL', 'postgresql', 'The World''s Most Advanced Open Source Relational Database', '#4169E1'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Docker', 'docker', 'Containerization Platform', '#2496ED'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Astro', 'astro', 'The web framework for content-driven websites', '#FF5D01'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'NestJS', 'nestjs', 'A progressive Node.js framework', '#E0234E');

-- Insert Projects
INSERT INTO projects (id, title, slug, description, content, demo_url, github_url, cover_image, start_date, end_date, status, steps_count, used_ai, gallery_images, tech_stack) VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'UniVerse Canvas',
    'universe-canvas',
    '個人用ポートフォリオ＆ブログシステム。Next.js 15、Supabase、Tiptapを使用した高機能CMS。',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"ドキュメント駆動開発で構築された、モダンなポートフォリオ＆ブログシステムです。"}]}]}'::jsonb,
    'https://example.com',
    'https://github.com/example/universe-canvas',
    null,
    '2024-01-01',
    null,
    'completed',
    100000,
    '["Claude Sonnet 4.5", "GitHub Copilot"]'::jsonb,
    ARRAY['https://placehold.co/800x600?text=Screenshot+1', 'https://placehold.co/800x600?text=Screenshot+2', 'https://placehold.co/800x600?text=Screenshot+3'],
    '{"TypeScript": 45.2, "CSS": 25.3, "JavaScript": 20.1, "HTML": 9.4}'::jsonb
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Task Manager Pro',
    'task-manager-pro',
    'チーム向けのタスク管理アプリケーション。リアルタイム同期、カンバンボード、Slack連携機能付き。',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"React + Firebaseで構築されたタスク管理アプリケーションです。"}]}]}'::jsonb,
    'https://example.com',
    'https://github.com/example/task-manager',
    null,
    '2023-08-01',
    '2023-12-31',
    'completed',
    35000,
    '["GitHub Copilot"]'::jsonb,
    ARRAY['https://placehold.co/800x600?text=Dashboard', 'https://placehold.co/800x600?text=Kanban'],
    '{"TypeScript": 52.8, "CSS": 28.5, "JavaScript": 18.7}'::jsonb
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'CLI Toolkit',
    'cli-toolkit',
    '開発効率化のためのCLIツールキット。プロジェクト生成、コードスニペット管理、デプロイ自動化機能。',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Node.jsベースのCLIツールキットです。"}]}]}'::jsonb,
    null,
    'https://github.com/example/cli-toolkit',
    null,
    '2023-05-01',
    '2023-07-31',
    'archived',
    8000,
    null,
    ARRAY[]::text[],
    '{"TypeScript": 85.2, "JavaScript": 14.8}'::jsonb
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Weather Dashboard',
    'weather-dashboard',
    '天気情報を可視化するダッシュボード。複数地域の天気予報、グラフ表示、アラート機能。',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Vue.jsで構築された天気ダッシュボードです。"}]}]}'::jsonb,
    'https://example.com',
    null,
    null,
    '2023-02-01',
    '2023-04-30',
    'completed',
    12000,
    '["ChatGPT"]'::jsonb,
    ARRAY['https://placehold.co/800x600?text=Weather+View'],
    '{"JavaScript": 48.3, "Vue": 32.1, "CSS": 19.6}'::jsonb
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Portfolio Template',
    'portfolio-template',
    '開発者向けのポートフォリオテンプレート。カスタマイズ可能なデザイン、ダークモード対応。',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Astroで構築されたポートフォリオテンプレートです。"}]}]}'::jsonb,
    'https://example.com',
    'https://github.com/example/portfolio-template',
    null,
    '2022-11-01',
    '2023-01-31',
    'completed',
    5000,
    null,
    ARRAY['https://placehold.co/800x600?text=Template+1', 'https://placehold.co/800x600?text=Template+2'],
    '{"TypeScript": 40.5, "Astro": 35.2, "CSS": 24.3}'::jsonb
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'E-commerce API',
    'ecommerce-api',
    'REST API for e-commerce platform. 商品管理、注文処理、決済連携、在庫管理機能。',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"NestJSで構築されたEコマースAPIです。"}]}]}'::jsonb,
    null,
    'https://github.com/example/ecommerce-api',
    null,
    '2022-06-01',
    '2022-10-31',
    'completed',
    25000,
    '["GitHub Copilot"]'::jsonb,
    ARRAY[]::text[],
    '{"TypeScript": 92.4, "JavaScript": 7.6}'::jsonb
  );

-- Insert Project Tags
INSERT INTO project_tags (project_id, tag_id) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'), -- UniVerse Canvas - Next.js
  ('a1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444'), -- UniVerse Canvas - Supabase
  ('a1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666'), -- UniVerse Canvas - Tiptap
  ('a1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'), -- UniVerse Canvas - TypeScript
  ('a1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555'), -- UniVerse Canvas - Tailwind CSS
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222'), -- Task Manager - React
  ('a2222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777'), -- Task Manager - Firebase
  ('a2222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888'), -- Task Manager - Redux
  ('a3333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999'), -- CLI Toolkit - Node.js
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'), -- CLI Toolkit - TypeScript
  ('a4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- Weather - Vue.js
  ('a5555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd'), -- Portfolio - Astro
  ('a5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555'), -- Portfolio - Tailwind CSS
  ('a6666666-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'), -- E-commerce - NestJS
  ('a6666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), -- E-commerce - PostgreSQL
  ('a6666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc'); -- E-commerce - Docker

-- Insert In Progress items
INSERT INTO in_progress (id, title, description, status, progress_rate, started_at, completed_at, notes) VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'AI チャットボット開発',
    'OpenAI APIを活用したカスタムチャットボットの開発。RAG（Retrieval-Augmented Generation）を実装予定。',
    'in_progress',
    65,
    '2024-01-10',
    null,
    '現在、ベクトルデータベースの選定中。Pinecone vs Weaviate で検討中。'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'モバイルアプリ（Flutter）',
    'クロスプラットフォームのモバイルアプリ開発。iOS/Android両対応のタスク管理アプリ。',
    'paused',
    30,
    '2023-12-01',
    null,
    '他のプロジェクトを優先中。2月に再開予定。'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Rust入門',
    'システムプログラミング言語Rustの学習。The Rust Programming Language を読み進め中。',
    'in_progress',
    40,
    '2024-01-05',
    null,
    '所有権の概念に苦戦中。CLIツールを作りながら学習予定。'
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'ブログシステム刷新',
    'UniVerse Canvasの本格実装。ドキュメント駆動開発で進行中。',
    'in_progress',
    25,
    '2024-01-15',
    null,
    '設計フェーズ完了。実装フェーズに突入。'
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    '技術書執筆',
    'Next.js + Supabaseで作るフルスタックアプリ開発の技術書執筆プロジェクト。',
    'not_started',
    0,
    null,
    null,
    'アウトライン作成中。3月から本格執筆開始予定。'
  ),
  (
    'c6666666-6666-6666-6666-666666666666',
    'OSS貢献',
    'お気に入りのOSSプロジェクトへのコントリビュート。ドキュメント改善から始める予定。',
    'not_started',
    0,
    null,
    null,
    '対象プロジェクトを選定中。'
  );

-- Insert Posts
INSERT INTO posts (id, title, slug, content, excerpt, status, published_at, cover_image, view_count) VALUES
  (
    'b0011111-1111-1111-1111-111111111111',
    'Next.js 15の新機能を試してみた',
    'nextjs-15-features',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"はじめに"}]},{"type":"paragraph","content":[{"type":"text","text":"Next.js 15がリリースされたので、主要な新機能を実際に試してみました。"}]}]}'::jsonb,
    'Next.js 15がリリースされたので、主要な新機能を実際に試してみました。App RouterやServer Actionsの改善点など、実践的な内容をまとめています。',
    'published',
    '2024-01-15 10:00:00+00',
    null,
    1234
  ),
  (
    'b0022222-2222-2222-2222-222222222222',
    'TypeScriptの型パズルを解いてみる',
    'typescript-type-puzzle',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"型パズルとは"}]},{"type":"paragraph","content":[{"type":"text","text":"TypeScriptの高度な型機能を使った型パズルに挑戦してみました。"}]}]}'::jsonb,
    'TypeScriptの高度な型機能を使った型パズルに挑戦してみました。Conditional Types、Template Literal Types、Mapped Typesを駆使しています。',
    'published',
    '2024-01-12 09:00:00+00',
    null,
    856
  ),
  (
    'b0033333-3333-3333-3333-333333333333',
    'Supabaseで認証機能を実装する',
    'supabase-auth-guide',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Supabase Authとは"}]},{"type":"paragraph","content":[{"type":"text","text":"Supabase Authを使った認証機能の実装方法を解説します。"}]}]}'::jsonb,
    'Supabase Authを使った認証機能の実装方法を解説します。Google OAuth、メール認証、Row Level Securityの設定まで網羅しています。',
    'published',
    '2024-01-10 14:00:00+00',
    null,
    2341
  ),
  (
    'b0044444-4444-4444-4444-444444444444',
    'Tiptapでリッチテキストエディタを作る',
    'tiptap-rich-editor',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Tiptapの基本"}]},{"type":"paragraph","content":[{"type":"text","text":"Tiptapを使ってカスタマイズ可能なリッチテキストエディタを作成する方法を紹介します。"}]}]}'::jsonb,
    'Tiptapを使ってカスタマイズ可能なリッチテキストエディタを作成する方法を紹介します。拡張機能の作り方も解説しています。',
    'published',
    '2024-01-08 11:00:00+00',
    null,
    1567
  ),
  (
    'b0055555-5555-5555-5555-555555555555',
    'Tailwind CSSのベストプラクティス',
    'tailwind-best-practices',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"効率的なスタイリング"}]},{"type":"paragraph","content":[{"type":"text","text":"Tailwind CSSを使った効率的なスタイリング方法とベストプラクティスをまとめました。"}]}]}'::jsonb,
    'Tailwind CSSを使った効率的なスタイリング方法とベストプラクティスをまとめました。コンポーネント設計からパフォーマンス最適化まで。',
    'published',
    '2024-01-05 13:00:00+00',
    null,
    3456
  ),
  (
    'b0066666-6666-6666-6666-666666666666',
    'GraphQL vs REST API の選び方',
    'graphql-vs-rest',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"APIの選択基準"}]},{"type":"paragraph","content":[{"type":"text","text":"GraphQLとREST APIの違いと、プロジェクトに応じた選び方を解説します。"}]}]}'::jsonb,
    'GraphQLとREST APIの違いと、プロジェクトに応じた選び方を解説します。それぞれのメリット・デメリットを実例を交えて紹介。',
    'published',
    '2024-01-03 15:00:00+00',
    null,
    1890
  ),
  (
    'b0077777-7777-7777-7777-777777777777',
    'Docker ComposeでローカルDB環境構築',
    'docker-compose-database',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Docker Composeとは"}]},{"type":"paragraph","content":[{"type":"text","text":"Docker Composeを使ってローカル開発環境にデータベースを構築する方法を紹介します。"}]}]}'::jsonb,
    'Docker Composeを使ってローカル開発環境にデータベースを構築する方法を紹介します。PostgreSQL、MySQL、Redisの設定例付き。',
    'published',
    '2024-01-01 10:00:00+00',
    null,
    2123
  ),
  (
    'b0088888-8888-8888-8888-888888888888',
    'React Hooksの使い方完全ガイド',
    'react-hooks-guide',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Hooksの基本"}]},{"type":"paragraph","content":[{"type":"text","text":"React Hooksの基本から応用まで、実践的な使い方を解説します。"}]}]}'::jsonb,
    'React Hooksの基本から応用まで、実践的な使い方を解説します。useState、useEffect、useContextなど全てのHooksを網羅。',
    'published',
    '2023-12-28 12:00:00+00',
    null,
    4567
  ),
  (
    'b0099999-9999-9999-9999-999999999999',
    'Webアクセシビリティのチェックリスト',
    'web-accessibility-checklist',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"アクセシビリティの重要性"}]},{"type":"paragraph","content":[{"type":"text","text":"Webサイトのアクセシビリティを向上させるためのチェックリストをまとめました。"}]}]}'::jsonb,
    'Webサイトのアクセシビリティを向上させるためのチェックリストをまとめました。WCAG 2.1準拠のための具体的な実装方法。',
    'published',
    '2023-12-25 09:00:00+00',
    null,
    1678
  ),
  (
    'b00a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a0a',
    'GitHubActionsでCI/CDパイプライン構築',
    'github-actions-cicd',
    '{"type":"doc","content":[{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"CI/CDとは"}]},{"type":"paragraph","content":[{"type":"text","text":"GitHub Actionsを使ったCI/CDパイプラインの構築方法を解説します。"}]}]}'::jsonb,
    'GitHub Actionsを使ったCI/CDパイプラインの構築方法を解説します。自動テスト、ビルド、デプロイまでの完全自動化。',
    'published',
    '2023-12-20 14:00:00+00',
    null,
    2890
  );

-- Insert Post Tags
INSERT INTO post_tags (post_id, tag_id) VALUES
  -- Next.js 15の新機能
  ('b0011111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'), -- Next.js
  ('b0011111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'), -- React
  -- TypeScriptの型パズル
  ('b0022222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'), -- TypeScript
  -- Supabase認証
  ('b0033333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444'), -- Supabase
  -- Tiptapエディタ
  ('b0044444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666'), -- Tiptap
  ('b0044444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222'), -- React
  -- Tailwind CSS
  ('b0055555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555'), -- Tailwind CSS
  -- GraphQL vs REST
  ('b0066666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999'), -- Node.js
  -- Docker Compose
  ('b0077777-7777-7777-7777-777777777777', 'cccccccc-cccc-cccc-cccc-cccccccccccc'), -- Docker
  ('b0077777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), -- PostgreSQL
  -- React Hooks
  ('b0088888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222'), -- React
  -- Webアクセシビリティ
  ('b0099999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111'), -- Next.js
  -- GitHub Actions
  ('b00a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a0a', 'cccccccc-cccc-cccc-cccc-cccccccccccc'); -- Docker

-- Insert Pages
INSERT INTO pages (page_type, title, content, metadata) VALUES
  (
    'about',
    '自己紹介',
    '{
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "はじめまして。Webアプリケーション開発を専門とするエンジニアです。"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "フロントエンドからバックエンドまで幅広く対応できるフルスタックエンジニアとして、使いやすく美しいプロダクトを作ることを目指しています。"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "特に Next.js と Supabase を使ったモダンなWebアプリケーション開発が得意です。新しい技術を学ぶことが好きで、常にスキルアップを心がけています。"
            }
          ]
        }
      ]
    }'::jsonb,
    '{
      "name": "Your Name",
      "role": "Web Developer",
      "location": "Tokyo, Japan",
      "employment": "Freelance",
      "skills": {
        "frontend": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js"],
        "backend": ["Node.js", "NestJS", "Python", "Go"],
        "database": ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
        "devops": ["Docker", "AWS", "Vercel", "GitHub Actions"],
        "other": ["Git", "Figma", "Notion", "Tiptap"]
      },
      "timeline": [
        {
          "year": "2024",
          "title": "フリーランスエンジニア",
          "description": "Webアプリケーション開発を中心に活動中。",
          "type": "work"
        },
        {
          "year": "2022",
          "title": "スタートアップ入社",
          "description": "フルスタックエンジニアとしてプロダクト開発に従事。",
          "type": "work"
        },
        {
          "year": "2020",
          "title": "Web開発を始める",
          "description": "独学でプログラミングを学習開始。",
          "type": "education"
        },
        {
          "year": "2018",
          "title": "大学卒業",
          "description": "情報工学を専攻。",
          "type": "education"
        }
      ]
    }'::jsonb
  ),
  (
    'links',
    '関連リンク',
    '{
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "各種SNSや外部サービスへのリンクです"
            }
          ]
        }
      ]
    }'::jsonb,
    '{
      "socialLinks": [
        {
          "name": "GitHub",
          "description": "ソースコードやOSS活動",
          "url": "https://github.com/username",
          "icon": "Github"
        },
        {
          "name": "Twitter / X",
          "description": "日々のつぶやきや技術情報",
          "url": "https://twitter.com/username",
          "icon": "Twitter"
        },
        {
          "name": "LinkedIn",
          "description": "ビジネス関連のつながり",
          "url": "https://linkedin.com/in/username",
          "icon": "Linkedin"
        },
        {
          "name": "メール",
          "description": "お問い合わせ・仕事のご相談",
          "url": "mailto:example@example.com",
          "icon": "Mail"
        }
      ],
      "otherLinks": [
        {
          "name": "Qiita",
          "description": "技術記事を投稿しています",
          "url": "https://qiita.com/username",
          "icon": "BookOpen"
        },
        {
          "name": "Zenn",
          "description": "技術記事・本を書いています",
          "url": "https://zenn.dev/username",
          "icon": "BookOpen"
        },
        {
          "name": "個人ブログ",
          "description": "このサイトです",
          "url": "/",
          "icon": "Globe"
        },
        {
          "name": "Discord",
          "description": "技術コミュニティ参加中",
          "url": "https://discord.com",
          "icon": "MessageCircle"
        }
      ]
    }'::jsonb
  );
