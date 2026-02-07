"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, ExternalLink, Github } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

// Mock data
const projects = [
  {
    id: "1",
    title: "UniVerse Canvas",
    slug: "universe-canvas",
    description: "個人用ポートフォリオ＆ブログシステム",
    tags: ["Next.js", "Supabase", "Tiptap"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/universe-canvas",
    status: "completed",
    startDate: "2024-01",
    endDate: null,
  },
  {
    id: "2",
    title: "Task Manager Pro",
    slug: "task-manager-pro",
    description: "チーム向けのタスク管理アプリケーション",
    tags: ["React", "Firebase", "Redux"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/example/task-manager",
    status: "completed",
    startDate: "2023-08",
    endDate: "2023-12",
  },
  {
    id: "3",
    title: "CLI Toolkit",
    slug: "cli-toolkit",
    description: "開発効率化のためのCLIツールキット",
    tags: ["Node.js", "TypeScript"],
    demoUrl: null,
    githubUrl: "https://github.com/example/cli-toolkit",
    status: "archived",
    startDate: "2023-05",
    endDate: "2023-07",
  },
]

const availableTags = [
  "Next.js", "React", "Vue.js", "TypeScript", "Node.js",
  "Supabase", "Firebase", "PostgreSQL", "Tailwind CSS", "Tiptap",
]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">プロジェクト管理</h1>
          <p className="text-muted-foreground">作ったものの管理</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規追加
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>プロジェクトを追加</DialogTitle>
              <DialogDescription>
                新しいプロジェクトの情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">プロジェクト名 *</label>
                <Input placeholder="プロジェクト名を入力" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">説明 *</label>
                <Textarea placeholder="プロジェクトの説明を入力" className="mt-1" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">デモURL</label>
                  <Input placeholder="https://..." className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">GitHub URL</label>
                  <Input placeholder="https://github.com/..." className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">タグ</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">開始日</label>
                  <Input type="month" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">完了日</label>
                  <Input type="month" className="mt-1" />
                </div>
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

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="プロジェクトを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            {/* Cover Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg" />

            <CardHeader className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {project.startDate} - {project.endDate || "進行中"}
                  </CardDescription>
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
                    {project.demoUrl && (
                      <DropdownMenuItem asChild>
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          デモを見る
                        </a>
                      </DropdownMenuItem>
                    )}
                    {project.githubUrl && (
                      <DropdownMenuItem asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
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
              <p className="text-sm text-muted-foreground mt-2">
                {project.description}
              </p>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
