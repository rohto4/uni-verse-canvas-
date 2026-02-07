"use client"
import { useState } from "react"
import Link from "next/link"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Post = { id: string; title: string; slug: string; status: "draft" | "scheduled" | "published"; tags: string[]; publishedAt: string | null; viewCount: number; updatedAt: string }

const posts: Post[] = [
  {
    id: "1",
    title: "Next.js 15の新機能を試してみた",
    slug: "nextjs-15-features",
    status: "published",
    tags: ["Next.js", "React"],
    publishedAt: "2024-01-15",
    viewCount: 1234,
    updatedAt: "2024-01-16",
  },
  {
    id: "2",
    title: "TypeScriptの型パズルを解いてみる",
    slug: "typescript-type-puzzle",
    status: "published",
    tags: ["TypeScript"],
    publishedAt: "2024-01-12",
    viewCount: 856,
    updatedAt: "2024-01-12",
  },
  {
    id: "3",
    title: "Supabaseで認証機能を実装する",
    slug: "supabase-auth-guide",
    status: "draft",
    tags: ["Supabase", "認証"],
    publishedAt: null,
    viewCount: 0,
    updatedAt: "2024-01-18",
  },
  {
    id: "4",
    title: "来週公開予定の記事",
    slug: "scheduled-post",
    status: "scheduled",
    tags: ["Next.js"],
    publishedAt: "2024-01-22",
    viewCount: 0,
    updatedAt: "2024-01-17",
  },
  {
    id: "5",
    title: "Tiptapでリッチテキストエディタを作る",
    slug: "tiptap-rich-editor",
    status: "draft",
    tags: ["Tiptap", "React"],
    publishedAt: null,
    viewCount: 0,
    updatedAt: "2024-01-15",
  },
]

const statusConfig = { draft: { label: "下書き", className: "bg-muted text-muted-foreground" }, scheduled: { label: "予約", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }, published: { label: "公開", className: "bg-accent text-accent-foreground" } }

export default function PostsListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

      <Tabs defaultValue="all" className="space-y-4">
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

        <TabsContent value="all" className="space-y-0">
          <PostList posts={filteredPosts} />
        </TabsContent>
        <TabsContent value="draft">
          <PostList posts={filteredPosts.filter((p) => p.status === "draft")} />
        </TabsContent>
        <TabsContent value="scheduled">
          <PostList posts={filteredPosts.filter((p) => p.status === "scheduled")} />
        </TabsContent>
        <TabsContent value="published">
          <PostList posts={filteredPosts.filter((p) => p.status === "published")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PostList({ posts }: { posts: Post[] }) {
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
                  <Badge className={statusConfig[post.status as keyof typeof statusConfig].className}>
                    {statusConfig[post.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>/{post.slug}</span>
                  {post.status === "published" && (
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.viewCount}
                    </span>
                  )}
                  <span>更新: {post.updatedAt}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
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
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    複製
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
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
