'use client'

import { useState, Dispatch, SetStateAction } from "react"
import { Plus, MoreHorizontal, Edit, Trash2, CheckCircle2, PauseCircle, PlayCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InProgressWithProject } from "@/types/database"
import { createInProgress, updateInProgress, deleteInProgress, CreateInProgressInput } from "@/lib/actions/in-progress"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const statusConfig = {
  not_started: { label: "未着手", icon: Circle, className: "bg-muted text-muted-foreground" },
  paused: { label: "中断中", icon: PauseCircle, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  in_progress: { label: "進行中", icon: PlayCircle, className: "bg-primary/20 text-primary" },
  completed: { label: "完了", icon: CheckCircle2, className: "bg-accent text-accent-foreground" }
}

interface InProgressListProps {
  items: InProgressWithProject[]
}

export default function InProgressList({ items }: InProgressListProps) {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InProgressWithProject | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState<CreateInProgressInput>({
    title: "",
    description: "",
    status: "not_started",
    progress_rate: 0,
    started_at: null,
    completed_at: null,
    completed_project_id: null,
    notes: ""
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "not_started",
      progress_rate: 0,
      started_at: null,
      completed_at: null,
      completed_project_id: null,
      notes: ""
    })
  }

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error("タイトルは必須です")
      return
    }

    setIsLoading(true)
    try {
      const res = await createInProgress(formData)
      if (!res) {
        toast.error("作成に失敗しました")
        return
      }
      toast.success("作成しました")
      setIsCreateDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("作成に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (item: InProgressWithProject) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      status: item.status,
      progress_rate: item.progress_rate,
      started_at: item.started_at,
      completed_at: item.completed_at,
      completed_project_id: item.completed_project_id,
      notes: item.notes || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingItem || !formData.title) return

    setIsLoading(true)
    try {
      const res = await updateInProgress(editingItem.id, formData)
      if (!res) {
        toast.error("更新に失敗しました")
        return
      }
      toast.success("更新しました")
      setIsEditDialogOpen(false)
      setEditingItem(null)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return

    try {
      await deleteInProgress(id)
      toast.success("削除しました")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("削除に失敗しました")
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: CreateInProgressInput['status']) => {
    try {
      await updateInProgress(id, { status: newStatus })
      toast.success("ステータスを更新しました")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("ステータス更新に失敗しました")
    }
  }

  const activeCount = items.filter((i) => i.status === "in_progress").length
  const pausedCount = items.filter((i) => i.status === "paused").length
  const notStartedCount = items.filter((i) => i.status === "not_started").length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">進行中のこと</h1>
          <p className="text-muted-foreground">プロジェクトや学習の進捗管理</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true) }}>
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
              <ItemForm formData={formData} setFormData={setFormData} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
                キャンセル
              </Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                {isLoading ? "追加中..." : "追加"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>項目を編集</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <ItemForm formData={formData} setFormData={setFormData} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                キャンセル
              </Button>
              <Button onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? "更新中..." : "更新"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            すべて
            <Badge variant="secondary" className="ml-2">
              {items.length}
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
          {items.map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onEdit={() => handleEditClick(item)} 
              onDelete={() => handleDelete(item.id)}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </TabsContent>
        <TabsContent value="in_progress" className="space-y-4">
          {items.filter((i) => i.status === "in_progress").map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onEdit={() => handleEditClick(item)} 
              onDelete={() => handleDelete(item.id)}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </TabsContent>
        <TabsContent value="paused" className="space-y-4">
          {items.filter((i) => i.status === "paused").map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onEdit={() => handleEditClick(item)} 
              onDelete={() => handleDelete(item.id)}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </TabsContent>
        <TabsContent value="not_started" className="space-y-4">
          {items.filter((i) => i.status === "not_started").map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onEdit={() => handleEditClick(item)} 
              onDelete={() => handleDelete(item.id)}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ItemForm({ formData, setFormData }: { 
  formData: CreateInProgressInput, 
  setFormData: Dispatch<SetStateAction<CreateInProgressInput>> 
}) {
  return (
    <>
      <div>
        <label className="text-sm font-medium">タイトル *</label>
        <Input 
          placeholder="タイトルを入力" 
          className="mt-1" 
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>
      <div>
        <label className="text-sm font-medium">説明</label>
        <Textarea 
          placeholder="説明を入力" 
          className="mt-1" 
          rows={3} 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">ステータス</label>
          <Select 
            value={formData.status} 
            onValueChange={(val: CreateInProgressInput['status']) => setFormData({...formData, status: val})}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">未着手</SelectItem>
              <SelectItem value="in_progress">進行中</SelectItem>
              <SelectItem value="paused">中断中</SelectItem>
              <SelectItem value="completed">完了</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">進捗率 (%)</label>
          <Input 
            type="number" 
            min="0" 
            max="100" 
            placeholder="0" 
            className="mt-1" 
            value={formData.progress_rate}
            onChange={(e) => setFormData({...formData, progress_rate: parseInt(e.target.value) || 0})}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">開始日</label>
        <Input 
          type="date" 
          className="mt-1" 
          value={formData.started_at ? new Date(formData.started_at).toISOString().split('T')[0] : ''}
          onChange={(e) => setFormData({...formData, started_at: e.target.value ? new Date(e.target.value).toISOString() : null})}
        />
      </div>
      <div>
        <label className="text-sm font-medium">メモ</label>
        <Textarea 
          placeholder="メモを入力..." 
          className="mt-1" 
          rows={2} 
          value={formData.notes || ""}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>
    </>
  )
}

function ItemCard({ item, onEdit, onDelete, onStatusUpdate }: { 
  item: InProgressWithProject,
  onEdit: () => void,
  onDelete: () => void,
  onStatusUpdate: (id: string, status: CreateInProgressInput['status']) => void
}) {
  const config = statusConfig[item.status]
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
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                編集
              </DropdownMenuItem>
              {item.status === "in_progress" && (
                <DropdownMenuItem onClick={() => onStatusUpdate(item.id, 'paused')}>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  中断にする
                </DropdownMenuItem>
              )}
              {item.status === "paused" && (
                <DropdownMenuItem onClick={() => onStatusUpdate(item.id, 'in_progress')}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  再開する
                </DropdownMenuItem>
              )}
              {item.status !== "not_started" && item.status !== "completed" && (
                <DropdownMenuItem onClick={() => onStatusUpdate(item.id, 'completed')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  完了にする
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
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
            <span className="font-medium">{item.progress_rate}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${item.progress_rate}%` }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {item.started_at && <span>開始: {new Date(item.started_at).toLocaleDateString()}</span>}
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
