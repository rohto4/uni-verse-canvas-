"use client"

import { useState } from "react"
import { Download, Upload, Database, FileJson, FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

// Mock data
const backupHistory = [
  {
    id: "1",
    type: "full",
    format: "json",
    size: "2.4 MB",
    createdAt: "2024-01-18 10:30",
    status: "success",
  },
  {
    id: "2",
    type: "posts",
    format: "markdown",
    size: "1.2 MB",
    createdAt: "2024-01-15 14:20",
    status: "success",
  },
  {
    id: "3",
    type: "full",
    format: "json",
    size: "2.3 MB",
    createdAt: "2024-01-10 09:00",
    status: "success",
  },
]

const stats = {
  posts: 42,
  projects: 12,
  inProgress: 4,
  tags: 15,
  totalSize: "5.8 MB",
  lastBackup: "2024-01-18 10:30",
}

export default function BackupPage() {
  const [exportType, setExportType] = useState("full")
  const [exportFormat, setExportFormat] = useState("json")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">バックアップ</h1>
        <p className="text-muted-foreground">データのエクスポートとインポート</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.posts}</div>
            <p className="text-xs text-muted-foreground">記事</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground">プロジェクト</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">進行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.tags}</div>
            <p className="text-xs text-muted-foreground">タグ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalSize}</div>
            <p className="text-xs text-muted-foreground">総データ量</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium">{stats.lastBackup}</div>
            <p className="text-xs text-muted-foreground">最終バックアップ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              エクスポート
            </CardTitle>
            <CardDescription>
              データをファイルにエクスポートします
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">対象データ</label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">全データ</SelectItem>
                  <SelectItem value="posts">記事のみ</SelectItem>
                  <SelectItem value="projects">プロジェクトのみ</SelectItem>
                  <SelectItem value="in_progress">進行中のみ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">フォーマット</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON
                    </div>
                  </SelectItem>
                  <SelectItem value="markdown">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Markdown
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-secondary/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">エクスポート内容</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {exportType === "full" && (
                  <>
                    <li>• 全記事 ({stats.posts}件)</li>
                    <li>• 全プロジェクト ({stats.projects}件)</li>
                    <li>• 全進行中 ({stats.inProgress}件)</li>
                    <li>• 全タグ ({stats.tags}件)</li>
                  </>
                )}
                {exportType === "posts" && <li>• 記事 ({stats.posts}件)</li>}
                {exportType === "projects" && <li>• プロジェクト ({stats.projects}件)</li>}
                {exportType === "in_progress" && <li>• 進行中 ({stats.inProgress}件)</li>}
              </ul>
            </div>

            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              エクスポート
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              インポート
            </CardTitle>
            <CardDescription>
              バックアップファイルからデータを復元します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-secondary/30 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                クリックしてファイルを選択
              </p>
              <p className="text-xs text-muted-foreground">
                または、ここにファイルをドロップ
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                JSON形式 (最大10MB)
              </p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                    注意事項
                  </h4>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                    <li>• 重複するデータはスキップされます</li>
                    <li>• インポート前にバックアップを取ることを推奨します</li>
                    <li>• 画像データは含まれません</li>
                  </ul>
                </div>
              </div>
            </div>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  インポート
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>インポートを確認</DialogTitle>
                  <DialogDescription>
                    選択したファイルの内容をインポートします
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    ファイルが選択されていません
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button disabled>インポート実行</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            バックアップ履歴
          </CardTitle>
          <CardDescription>
            過去のエクスポート履歴
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {backupHistory.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  {backup.format === "json" ? (
                    <FileJson className="h-8 w-8 text-primary" />
                  ) : (
                    <FileText className="h-8 w-8 text-primary" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {backup.type === "full" ? "全データ" : backup.type}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {backup.format.toUpperCase()}
                      </Badge>
                      {backup.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {backup.createdAt}
                      </span>
                      <span>{backup.size}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  再ダウンロード
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
