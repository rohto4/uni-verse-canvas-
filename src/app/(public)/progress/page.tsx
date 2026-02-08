import Link from "next/link"
import { Clock, CheckCircle2, PauseCircle, PlayCircle, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInProgressItems } from "@/lib/actions/in-progress"
import type { InProgressWithProject } from "@/types/database"

const statusConfig = { not_started: { label: "未着手", icon: Circle, className: "bg-muted text-muted-foreground" }, paused: { label: "中断中", icon: PauseCircle, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }, in_progress: { label: "進行中", icon: PlayCircle, className: "bg-primary/20 text-primary" }, completed: { label: "完了", icon: CheckCircle2, className: "bg-accent text-accent-foreground" } }

export const metadata = {
  title: "進行中のこと",
  description: "現在取り組んでいるプロジェクトや学習の進捗状況です。",
}

export default async function ProgressPage() {
  const allItems = await getInProgressItems()

  const activeItems = allItems.filter((item) => item.status === "in_progress")
  const pausedItems = allItems.filter((item) => item.status === "paused")
  const notStartedItems = allItems.filter((item) => item.status === "not_started")
  const completedItems = allItems.filter((item) => item.status === "completed")

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

        <TabsContent value="active" className="space-y-4">
          {activeItems.map((item) => (
            <ProgressCard key={item.id} item={item} />
          ))}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {pausedItems.length > 0 ? (
            pausedItems.map((item) => (
              <ProgressCard key={item.id} item={item} />
            ))
          ) : (
            <EmptyState message="中断中のプロジェクトはありません" />
          )}
        </TabsContent>

        <TabsContent value="planned" className="space-y-4">
          {notStartedItems.length > 0 ? (
            notStartedItems.map((item) => (
              <ProgressCard key={item.id} item={item} />
            ))
          ) : (
            <EmptyState message="予定のプロジェクトはありません" />
          )}
        </TabsContent>

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
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  完了日: {item.completed_at}
                </p>
                {item.completedProject && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/works/${item.completedProject.slug}`}>
                      詳細を見る
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

function ProgressCard({ item }: { item: InProgressWithProject }) {
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
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">進捗</span>
            <span className="font-medium">{item.progress_rate}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${item.progress_rate}%`,
                background: "var(--card-accent-gradient)",
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {item.started_at && (
            <span>開始: {item.started_at}</span>
          )}
        </div>

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
