"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Copy, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPosts, deletePost } from "@/lib/actions/posts"
import type { PostWithTags } from "@/types/database"
import { toast } from "sonner"

const statusConfig = { 
  draft: { label: "下書き", className: "bg-muted text-muted-foreground" }, 
  scheduled: { label: "予約", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }, 
  published: { label: "公開", className: "bg-accent text-accent-foreground" } 
}

export default function PostsListPage() {
  const [posts, setPosts] = useState<PostWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      // Fetch all posts for admin (pagination can be added later)
      const { posts } = await getPosts({ 
        limit: 100, 
        status: statusFilter === 'all' ? undefined : statusFilter as any,
        search: searchQuery
      })
      setPosts(posts)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast.error("記事の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [searchQuery, statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("本当にこの記事を削除しますか？")) return

    setIsDeleting(id)
    try {
      const result = await deletePost(id)
      if (result.success) {
        toast.success("記事を削除しました")
        fetchPosts() // Refresh list
      } else {
        toast.error(result.error || "削除に失敗しました")
      }
    } catch (error) {
      toast.error("予期せぬエラーが発生しました")
    } finally {
      setIsDeleting(null)
    }
  }

  const draftCount = posts.filter((p) => p.status === "draft").length
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length
  const publishedCount = posts.filter((p) => p.status === "published").length

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">記事管理</h1>
          <p className="text-muted-foreground">記事の作成・編集・管理</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="記事を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="draft">下書き</SelectItem>
                <SelectItem value="scheduled">予約</SelectItem>
                <SelectItem value="published">公開</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={(val) => setStatusFilter(val)}>
        <TabsList>
          <TabsTrigger value="all">
            すべて
            <Badge variant="secondary" className="ml-2">
              {posts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="draft">
            下書き
            <Badge variant="secondary" className="ml-2">
              {draftCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            予約
            <Badge variant="secondary" className="ml-2">
              {scheduledCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="published">
            公開
            <Badge variant="secondary" className="ml-2">
              {publishedCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div className="space-y-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PostList posts={posts} onDelete={handleDelete} isDeleting={isDeleting} />
          )}
        </div>
      </Tabs>
    </div>
  )
}

function PostList({ posts, onDelete, isDeleting }: { posts: PostWithTags[], onDelete: (id: string) => void, isDeleting: string | null }) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          該当する記事がありません
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="font-medium hover:text-primary truncate"
                  >
                    {post.title}
                  </Link>
                  <Badge className={statusConfig[post.status as keyof typeof statusConfig]?.className}>
                    {statusConfig[post.status as keyof typeof statusConfig]?.label || post.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>/{post.slug}</span>
                  {post.status === "published" && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.view_count}
                    </span>
                  )}
                  <span>更新: {new Date(post.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {post.tags?.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isDeleting === post.id}>
                    {isDeleting === post.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/posts/${post.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      編集
                    </Link>
                  </DropdownMenuItem>
                  {post.status === "published" && (
                    <DropdownMenuItem asChild>
                      <Link href={`/posts/${post.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        記事を見る
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive" 
                    onClick={() => onDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
