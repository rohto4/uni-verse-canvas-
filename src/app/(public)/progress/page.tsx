import { Clock, CheckCircle2, PauseCircle, PlayCircle, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const inProgressItems = [
  {
    id: "1",
    title: "AI チャットボット開発",
    description: "OpenAI APIを活用したカスタムチャットボットの開発。RAG（Retrieval-Augmented Generation）を実装予定。",
    status: "in_progress" as const,
    progressRate: 65,
    startedAt: "2024-01-10",
    notes: "現在、ベクトルデータベースの選定中。Pinecone vs Weaviate で検討中。",
  },
  {
    id: "2",
    title: "モバイルアプリ（Flutter）",
    description: "クロスプラットフォームのモバイルアプリ開発。iOS/Android両対応のタスク管理アプリ。",
    status: "paused" as const,
    progressRate: 30,
    startedAt: "2023-12-01",
    notes: "他のプロジェクトを優先中。2月に再開予定。",
  },
  {
    id: "3",
    title: "Rust入門",
    description: "システムプログラミング言語Rustの学習。The Rust Programming Language を読み進め中。",
    status: "in_progress" as const,
    progressRate: 40,
    startedAt: "2024-01-05",
    notes: "所有権の概念に苦戦中。CLIツールを作りながら学習予定。",
  },
  {
    id: "4",
    title: "ブログシステム刷新",
    description: "UniVerse Canvasの本格実装。ドキュメント駆動開発で進行中。",
    status: "in_progress" as const,
    progressRate: 25,
    startedAt: "2024-01-15",
    notes: "設計フェーズ完了。実装フェーズに突入。",
  },
  {
    id: "5",
    title: "技術書執筆",
    description: "Next.js + Supabaseで作るフルスタックアプリ開発の技術書執筆プロジェクト。",
    status: "not_started" as const,
    progressRate: 0,
    startedAt: null,
    notes: "アウトライン作成中。3月から本格執筆開始予定。",
  },
  {
    id: "6",
    title: "OSS貢献",
    description: "お気に入りのOSSプロジェクトへのコントリビュート。ドキュメント改善から始める予定。",
    status: "not_started" as const,
    progressRate: 0,
    startedAt: null,
    notes: "対象プロジェクトを選定中。",
  },
]

const completedItems = [
  {
    id: "c1",
    title: "TypeScript 5.x マスター",
    description: "TypeScript 5.xの新機能を完全理解。decorators、satisfies演算子など。",
    status: "completed" as const,
    progressRate: 100,
    completedAt: "2024-01-08",
    completedProjectSlug: null,
  },
  {
    id: "c2",
    title: "AWS認定 SAA取得",
    description: "AWS Solutions Architect Associate認定試験に合格。",
    status: "completed" as const,
    progressRate: 100,
    completedAt: "2023-12-20",
    completedProjectSlug: null,
  },
]

const statusConfig = {
  not_started: {
    label: "未着手",
    icon: Circle,
    className: "bg-muted text-muted-foreground",
  },
  paused: {
    label: "中断中",
    icon: PauseCircle,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  in_progress: {
    label: "進行中",
    icon: PlayCircle,
    className: "bg-primary/20 text-primary",
  },
  completed: {
    label: "完了",
    icon: CheckCircle2,
    className: "bg-accent text-accent-foreground",
  },
}

export const metadata = {
  title: "進行中のこと",
  description: "現在取り組んでいるプロジェクトや学習の進捗状況です。",
}

export default function ProgressPage() {
  const activeItems = inProgressItems.filter((item) => item.status === "in_progress")
  const pausedItems = inProgressItems.filter((item) => item.status === "paused")
  const notStartedItems = inProgressItems.filter((item) => item.status === "not_started")

  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-5xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            進行中のこと
          </h1>
          <p className="text-muted-foreground">
            現在取り組んでいるプロジェクトや学習の進捗状況です。
          </p>
        </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="active" className="gap-1">
            <PlayCircle className="h-4 w-4" />
            進行中
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeItems.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paused" className="gap-1">
            <PauseCircle className="h-4 w-4" />
            中断
          </TabsTrigger>
          <TabsTrigger value="planned" className="gap-1">
            <Circle className="h-4 w-4" />
            予定
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            完了
          </TabsTrigger>
        </TabsList>

        {/* Active */}
        <TabsContent value="active" className="space-y-4">
          {activeItems.map((item) => (
            <ProgressCard key={item.id} item={item} />
          ))}
        </TabsContent>

        {/* Paused */}
        <TabsContent value="paused" className="space-y-4">
          {pausedItems.length > 0 ? (
            pausedItems.map((item) => (
              <ProgressCard key={item.id} item={item} />
            ))
          ) : (
            <EmptyState message="中断中のプロジェクトはありません" />
          )}
        </TabsContent>

        {/* Planned */}
        <TabsContent value="planned" className="space-y-4">
          {notStartedItems.length > 0 ? (
            notStartedItems.map((item) => (
              <ProgressCard key={item.id} item={item} />
            ))
          ) : (
            <EmptyState message="予定のプロジェクトはありません" />
          )}
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="space-y-4">
          {completedItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <Badge className={statusConfig.completed.className}>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    完了
                  </Badge>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  完了日: {item.completedAt}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

function ProgressCard({ item }: { item: typeof inProgressItems[0] }) {
  const config = statusConfig[item.status]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <Badge className={config.className}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">進捗</span>
            <span className="font-medium">{item.progressRate}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${item.progressRate}%`,
                background: "var(--card-accent-gradient)",
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {item.startedAt && (
            <span>開始: {item.startedAt}</span>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm">{item.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>{message}</p>
    </div>
  )
}
