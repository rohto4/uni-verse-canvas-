import { FileText, Folder, Clock, Eye, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getProjects } from '@/lib/actions/projects'
import { getInProgressItems } from '@/lib/actions/in-progress'
import { getDashboardStats } from "@/lib/actions/system"
import type { Post } from '@/types/database'

type ChangeType = "increase" | "decrease" | "neutral"
type RecentPost = Pick<Post, 'id' | 'title' | 'slug' | 'status' | 'published_at' | 'view_count'>

const statusConfig = { draft: { label: "下書き", className: "bg-muted text-muted-foreground" }, scheduled: { label: "予約", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }, published: { label: "公開", className: "bg-accent text-accent-foreground" } }

export default async function DashboardPage() {
  const dashboardStats = await getDashboardStats()
  const inProgressItems = await getInProgressItems()

  const stats = [
    { title: '総記事数', value: dashboardStats.counts.posts, change: '+0', changeType: 'neutral' as ChangeType, icon: FileText },
    { title: '総プロジェクト数', value: dashboardStats.counts.projects, change: '+0', changeType: 'neutral' as ChangeType, icon: Folder },
    { title: '進行中', value: dashboardStats.counts.inProgress, change: '0', changeType: 'neutral' as ChangeType, icon: Clock },
    { title: '累計閲覧数', value: dashboardStats.totalViews.toLocaleString(), change: '+0%', changeType: 'neutral' as ChangeType, icon: Eye },
  ]

  // We still fetch latest posts for the detailed list
  const [{ posts: recentPosts }] = await Promise.all([
    import('@/lib/actions/posts').then(mod => mod.getPosts({ limit: 5, status: 'published' }))
  ])

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
              {recentPosts.map((post: RecentPost) => (
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
            <CardDescription>最新の更新履歴</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats.recentActivities.length > 0 ? (
                dashboardStats.recentActivities.map((activity) => (
                  <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 text-sm">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === 'post' ? "bg-primary" : "bg-accent"
                    )} />
                    <div className="flex-1 min-w-0">
                      <span className="text-muted-foreground truncate block">
                        {activity.type === 'post' ? '記事' : 'プロジェクト'}: {activity.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4 text-sm">アクティビティはありません</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
