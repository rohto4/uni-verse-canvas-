import { FileText, Folder, Clock, Eye, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createServerClient } from '@/lib/supabase/server'
import { getProjects } from '@/lib/actions/projects'
import { getInProgressItems } from '@/lib/actions/in-progress'

type ChangeType = "increase" | "decrease" | "neutral"

const statusConfig = { draft: { label: "下書き", className: "bg-muted text-muted-foreground" }, scheduled: { label: "予約", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }, published: { label: "公開", className: "bg-accent text-accent-foreground" } }

export default async function DashboardPage() {
  // Fetch data in parallel
  const [postsResult, projectsResult, inProgressItems] = await Promise.all([
    // get latest 5 posts regardless of status: use direct query for flexibility
    (async () => {
      const supabase = createServerClient()
      const { data } = await supabase
        .from('posts')
        .select('id, title, slug, status, published_at, view_count')
        .order('created_at', { ascending: false })
        .limit(5)
      return (data as any[]) || []
    })(),
    getProjects(10, 1),
    getInProgressItems(),
  ])

  const totalPostsCount = await (async () => {
    const supabase = createServerClient()
    const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true })
    return count || 0
  })()

  const stats = [
    { title: '総記事数', value: totalPostsCount, change: '+0', changeType: 'neutral' as ChangeType, icon: FileText },
    { title: '総プロジェクト数', value: projectsResult.totalCount, change: '+0', changeType: 'neutral' as ChangeType, icon: Folder },
    { title: '進行中', value: inProgressItems.filter(i => i.status === 'in_progress').length, change: '0', changeType: 'neutral' as ChangeType, icon: Clock },
    { title: '今月の閲覧数', value: '—', change: '+0%', changeType: 'neutral' as ChangeType, icon: Eye },
  ]

  const recentPosts = postsResult

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
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.changeType === "increase" && (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  )}
                  {stat.changeType === "decrease" && (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={
                      stat.changeType === "increase"
                        ? "text-green-500"
                        : stat.changeType === "decrease"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }>
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
              <CardDescription>最新の投稿</CardDescription>
            </div>
            <Link
              href="/admin/posts"
              className="text-sm text-primary hover:underline"
            >
              すべて見る
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium hover:text-primary truncate block"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
                      {post.status === "published" && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.view_count}
                        </span>
                      )}
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
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              進行中の項目
            </CardTitle>
            <CardDescription>現在の進捗状況</CardDescription>
          </CardHeader>
          <CardContent>
            {inProgressItems.length > 0 ? (
              <div className="space-y-4">
                {inProgressItems.slice(0,5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg">
                    <div>
                      <Link href={`/admin/in-progress`} className="font-medium hover:text-primary">
                        {item.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">{item.status} · {item.progress_rate}%</p>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">進行中の項目はありません</p>
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
              <Link
                href="/admin/posts/new"
                className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors text-center"
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">新規記事</span>
              </Link>
              <Link
                href="/admin/projects"
                className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors text-center"
              >
                <Folder className="h-6 w-6 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">プロジェクト追加</span>
              </Link>
              <Link
                href="/admin/backup"
                className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors text-center"
              >
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">バックアップ</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="p-4 rounded-lg border hover:bg-secondary/50 transition-colors text-center"
              >
                <Eye className="h-6 w-6 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">サイトを見る</span>
              </Link>
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
                { action: "記事を公開しました", target: "サイト記事", time: "2時間前" },
                { action: "記事を編集しました", target: "記事", time: "5時間前" },
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
