'use client'

import { useState } from 'react'
import { exportData, importData } from '@/lib/actions/backup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Upload, FileJson, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const data = await exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `universe-canvas-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('バックアップをエクスポートしました')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!confirm('データをインポートしますか？既存のデータが上書きされる可能性があります。')) {
      e.target.value = ''
      return
    }

    try {
      setIsImporting(true)
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string)
          const result = await importData(json)
          if (result.success) {
            toast.success('データをインポートしました')
          } else {
            toast.error('インポートに失敗しました: ' + result.error)
          }
        } catch {
          toast.error('ファイルの形式が正しくありません')
        } finally {
          setIsImporting(false)
          e.target.value = ''
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('Import error:', error)
      toast.error('インポート中にエラーが発生しました')
      setIsImporting(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">バックアップと復元</h1>
        <p className="text-muted-foreground">
          サイトの全データをJSON形式でエクスポートまたはインポートします。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              エクスポート
            </CardTitle>
            <CardDescription>
              現在の全データをJSONファイルとしてダウンロードします。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full gap-2"
            >
              {isExporting ? '準備中...' : (
                <>
                  <FileJson className="h-4 w-4" />
                  JSONをエクスポート
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-yellow-500" />
              インポート
            </CardTitle>
            <CardDescription>
              以前エクスポートしたJSONファイルからデータを復元します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button 
                variant="outline" 
                disabled={isImporting}
                className="w-full gap-2"
              >
                {isImporting ? 'インポート中...' : (
                  <>
                    <Upload className="h-4 w-4" />
                    JSONを選択してインポート
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            注意
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
          <p>
            インポートを行うと、同じIDを持つ既存のデータは上書きされます。
            安全のため、インポート前に現在のデータをエクスポートしておくことをお勧めします。
          </p>
          <p>
            現在、画像ファイル自体はバックアップに含まれません（DB内のURL参照のみが保存されます）。
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">バックアップ対象</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> 記事 (Posts)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> プロジェクト (Projects)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> 進行中アイテム (In Progress)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> タグ (Tags)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> 固定ページ (Pages)</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> 各種紐付けデータ</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
