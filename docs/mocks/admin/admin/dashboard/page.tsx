import { FileText, Folder, Clock, Eye, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const stats: { title: string; value: string | number; change: string; changeType: "increase" | "decrease" | "neutral"; icon: LucideIcon }[] = [
  { title: "総記事数", value: 42, change: "+3", changeType: "increase", icon: FileText },
  { title: "総プロジェクト数", value: 12, change: "+1", changeType: "increase", icon: Folder },
  { title: "進行中", value: 4, change: "0", changeType: "neutral", icon: Clock },
  { title: "今月の閲覧数", value: "12,456", change: "+18%", changeType: "increase", icon: Eye },
]

const recentPosts = [
  { id: "1", title: "Next.js 15の新機能を試してみた", status: "published", publishedAt: "2024-01-15", viewCount: 1234 },
  { id: "2", title: "TypeScriptの型パズルを解いてみる", status: "published", publishedAt: "2024-01-12", viewCount: 856 },
  { id: "3", title: "Supabaseで認証機能を実装する（下書き）", status: "draft", publishedAt: null, viewCount: 0 },
  { id: "4", title: "来週公開予定の記事", status: "scheduled", publishedAt: "2024-01-22", viewCount: 0 },
]

const scheduledPosts = [
  { id: "4", title: "来週公開予定の記事", scheduledAt: "2024-01-22 10:00" },
  { id: "5", title: "月末に公開する記事", scheduledAt: "2024-01-31 09:00" },
]

const statusConfig = {
  draft: { label: "下書き", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "予約", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  published: { label: "公開", className: "bg-accent text-accent-foreground" },
}

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">サイトの概要と最近の活動</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.changeType === "increase" && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
                  {stat.changeType === "decrease" && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
                  <span className={stat.changeType === "increase" ? "text-green-500" : stat.changeType === "decrease" ? "text-red-500" : "text-muted-foreground"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">先月比</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>最近の記事</CardTitle>
              <CardDescription>最新の投稿と下書き</CardDescription>
            </div>
            <Link href="/admin/posts" className="text-sm text-primary hover:underline">すべて見る</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/posts/${post.id}`} className="font-medium hover:text-primary truncate block">{post.title}</Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {post.publishedAt && <span>{post.publishedAt}</span>}
                      {post.status === "published" && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.viewCount}</span>}
                    </div>
                  </div>
                  <Badge className={statusConfig[post.status as keyof typeof statusConfig].className}>
                    {statusConfig[post.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />予約投稿</CardTitle>
            <CardDescription>公開予定の記事</CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledPosts.length > 0 ? (
              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div>
                      <Link href={`/admin/posts/${post.id}`} className="font-medium hover:text-primary">{post.title}</Link>
                      <p className="text-xs text-muted-foreground mt-1">{post.scheduledAt}</p>
                    </div>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">予約投稿はありません</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>よく使う機能へのショートカット</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/admin/posts/new", icon: FileText, label: "新規記事" },
                { href: "/admin/projects", icon: Folder, label: "プロジェクト追加" },
                { href: "/admin/backup", icon: TrendingUp, label: "バックアップ" },
                { href: "/", icon: Eye, label: "サイトを見る", target: "_blank" },
              ].map(({ href, icon: Icon, label, target }) => (
                <Link key={href} href={href} target={target} className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors text-center">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>システムログ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "記事を公開しました", target: "Next.js 15の新機能", time: "2時間前" },
                { action: "記事を編集しました", target: "TypeScriptの型パズル", time: "5時間前" },
                { action: "プロジェクトを追加しました", target: "UniVerse Canvas", time: "1日前" },
                { action: "バックアップを作成しました", target: "全データ", time: "2日前" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <span className="text-muted-foreground">{activity.action}</span>
                    <span className="font-medium ml-1">{activity.target}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
