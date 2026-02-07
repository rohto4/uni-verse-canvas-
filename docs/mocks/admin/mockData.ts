export type ChangeType = "increase" | "decrease" | "neutral"
export type PostStatus = "draft" | "scheduled" | "published"
export type ProjectStatus = "completed" | "archived"
export type InProgressStatus = "not_started" | "paused" | "in_progress" | "completed"

export const statusConfig = {
  draft: { label: "下書き", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "予約", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  published: { label: "公開", className: "bg-accent text-accent-foreground" },
}

export const inProgressStatusConfig = {
  not_started: { label: "未着手", className: "bg-muted text-muted-foreground" },
  paused: { label: "中断中", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  in_progress: { label: "進行中", className: "bg-primary/20 text-primary" },
  completed: { label: "完了", className: "bg-accent text-accent-foreground" },
}

export const availableTags = [
  { id: "1", name: "Next.js", slug: "nextjs" },
  { id: "2", name: "React", slug: "react" },
  { id: "3", name: "TypeScript", slug: "typescript" },
  { id: "4", name: "Supabase", slug: "supabase" },
  { id: "5", name: "Tailwind CSS", slug: "tailwindcss" },
  { id: "6", name: "Tiptap", slug: "tiptap" },
]

export const mockPosts = [
  { id: "1", title: "Next.js 15の新機能を試してみた", slug: "nextjs-15-features", status: "published" as PostStatus, tags: ["Next.js", "React"], publishedAt: "2024-01-15", viewCount: 1234, updatedAt: "2024-01-16" },
  { id: "2", title: "TypeScriptの型パズルを解いてみる", slug: "typescript-type-puzzle", status: "published" as PostStatus, tags: ["TypeScript"], publishedAt: "2024-01-12", viewCount: 856, updatedAt: "2024-01-12" },
  { id: "3", title: "Supabaseで認証機能を実装する", slug: "supabase-auth-guide", status: "draft" as PostStatus, tags: ["Supabase", "認証"], publishedAt: null, viewCount: 0, updatedAt: "2024-01-18" },
  { id: "4", title: "来週公開予定の記事", slug: "scheduled-post", status: "scheduled" as PostStatus, tags: ["Next.js"], publishedAt: "2024-01-22", viewCount: 0, updatedAt: "2024-01-17" },
  { id: "5", title: "Tiptapでリッチテキストエディタを作る", slug: "tiptap-rich-editor", status: "draft" as PostStatus, tags: ["Tiptap", "React"], publishedAt: null, viewCount: 0, updatedAt: "2024-01-15" },
]

export const mockProjects = [
  { id: "1", title: "UniVerse Canvas", slug: "universe-canvas", description: "個人用ポートフォリオ＆ブログシステム", tags: ["Next.js", "Supabase", "Tiptap"], demoUrl: "https://example.com", githubUrl: "https://github.com/example/universe-canvas", status: "completed" as ProjectStatus, startDate: "2024-01", endDate: null },
  { id: "2", title: "Task Manager Pro", slug: "task-manager-pro", description: "チーム向けのタスク管理アプリケーション", tags: ["React", "Firebase", "Redux"], demoUrl: "https://example.com", githubUrl: "https://github.com/example/task-manager", status: "completed" as ProjectStatus, startDate: "2023-08", endDate: "2023-12" },
  { id: "3", title: "CLI Toolkit", slug: "cli-toolkit", description: "開発効率化のためのCLIツールキット", tags: ["Node.js", "TypeScript"], demoUrl: null, githubUrl: "https://github.com/example/cli-toolkit", status: "archived" as ProjectStatus, startDate: "2023-05", endDate: "2023-07" },
]

export const mockInProgress = [
  { id: "1", title: "AI チャットボット開発", description: "OpenAI APIを活用したカスタムチャットボット", status: "in_progress" as InProgressStatus, progressRate: 65, startedAt: "2024-01-10", notes: "ベクトルデータベースの選定中" },
  { id: "2", title: "モバイルアプリ（Flutter）", description: "クロスプラットフォームのモバイルアプリ開発", status: "paused" as InProgressStatus, progressRate: 30, startedAt: "2023-12-01", notes: "他のプロジェクトを優先中" },
  { id: "3", title: "Rust入門", description: "システムプログラミング言語Rustの学習", status: "in_progress" as InProgressStatus, progressRate: 40, startedAt: "2024-01-05", notes: null },
  { id: "4", title: "技術書執筆", description: "Next.js + Supabaseの技術書", status: "not_started" as InProgressStatus, progressRate: 0, startedAt: null, notes: "アウトライン作成中" },
]
