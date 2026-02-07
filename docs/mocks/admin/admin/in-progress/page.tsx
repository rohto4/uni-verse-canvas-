"use client"

import { useState } from "react"
import { Plus, MoreHorizontal, Edit, Trash2, CheckCircle2, PauseCircle, PlayCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const inProgressItems = [
  {
    id: "1",
    title: "AI チャットボット開発",
    description: "OpenAI APIを活用したカスタムチャットボット",
    status: "in_progress",
    progressRate: 65,
    startedAt: "2024-01-10",
    notes: "ベクトルデータベースの選定中",
  },
  {
    id: "2",
    title: "モバイルアプリ（Flutter）",
    description: "クロスプラットフォームのモバイルアプリ開発",
    status: "paused",
    progressRate: 30,
    startedAt: "2023-12-01",
    notes: "他のプロジェクトを優先中",
  },
  {
    id: "3",
    title: "Rust入門",
    description: "システムプログラミング言語Rustの学習",
    status: "in_progress",
    progressRate: 40,
    startedAt: "2024-01-05",
    notes: null,
  },
  {
    id: "4",
    title: "技術書執筆",
    description: "Next.js + Supabaseの技術書",
    status: "not_started",
    progressRate: 0,
    startedAt: null,
    notes: "アウトライン作成中",
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

export default function InProgressPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const activeCount = inProgressItems.filter((i) => i.status === "in_progress").length
  const pausedCount = inProgressItems.filter((i) => i.status === "paused").length
  const notStartedCount = inProgressItems.filter((i) => i.status === "not_started").length

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">進行中のこと</h1>
          <p className="text-muted-foreground">プロジェクトや学習の進捗管理</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しい項目を追加</DialogTitle>
              <DialogDescription>
                進行中のプロジェクトや学習を追加します
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">タイトル *</label>
                <Input placeholder="タイトルを入力" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">説明</label>
                <Textarea placeholder="説明を入力" className="mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">ステータス</label>
                  <Select defaultValue="not_started">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">未着手</SelectItem>
                      <SelectItem value="in_progress">進行中</SelectItem>
                      <SelectItem value="paused">中断中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">進捗率</label>
                  <Input type="number" min="0" max="100" placeholder="0" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">開始日</label>
                <Input type="date" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">メモ</label>
                <Textarea placeholder="メモを入力..." className="mt-1" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                キャンセル
              </Button>
              <Button>追加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            すべて
            <Badge variant="secondary" className="ml-2">
              {inProgressItems.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            進行中
            <Badge variant="secondary" className="ml-2">
              {activeCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paused">
            中断中
            <Badge variant="secondary" className="ml-2">
              {pausedCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="not_started">
            未着手
            <Badge variant="secondary" className="ml-2">
              {notStartedCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {inProgressItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </TabsContent>
        <TabsContent value="in_progress" className="space-y-4">
          {inProgressItems.filter((i) => i.status === "in_progress").map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </TabsContent>
        <TabsContent value="paused" className="space-y-4">
          {inProgressItems.filter((i) => i.status === "paused").map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </TabsContent>
        <TabsContent value="not_started" className="space-y-4">
          {inProgressItems.filter((i) => i.status === "not_started").map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ItemCard({ item }: { item: typeof inProgressItems[0] }) {
  const config = statusConfig[item.status as keyof typeof statusConfig]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <Badge className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <CardDescription>{item.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </DropdownMenuItem>
              {item.status === "in_progress" && (
                <DropdownMenuItem>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  中断にする
                </DropdownMenuItem>
              )}
              {item.status === "paused" && (
                <DropdownMenuItem>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  再開する
                </DropdownMenuItem>
              )}
              {item.status !== "not_started" && (
                <DropdownMenuItem>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  完了にする
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${item.progressRate}%` }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {item.startedAt && <span>開始: {item.startedAt}</span>}
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
