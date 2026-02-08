import { getPosts } from '@/lib/actions/posts'
import { getTagsWithCount } from '@/lib/actions/tags'
import { PostsList } from '@/components/posts/PostsList'
import { PostsFilter } from '@/components/posts/PostsFilter'
import { Pagination } from '@/components/posts/Pagination'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: '読み物',
  description: '技術記事や日々の学びを記録しています。',
}

interface PostsPageProps {
  searchParams: Promise<{
    page?: string
    tags?: string
    search?: string
    sort?: 'latest' | 'oldest' | 'popular'
  }>
}

function PostsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function PostsContent({
  searchParams,
}: {
  searchParams: {
    page?: string
    tags?: string
    search?: string
    sort?: 'latest' | 'oldest' | 'popular'
  }
}) {
  const page = Number(searchParams.page) || 1
  const tags = searchParams.tags?.split(',').filter(Boolean) || []
  const search = searchParams.search || ''
  const sort = searchParams.sort || 'latest'

  // Fetch posts and tags in parallel
  const [postsData, allTags] = await Promise.all([
    getPosts({
      page,
      limit: 10,
      tags,
      search,
      sort,
      status: 'published',
    }),
    getTagsWithCount(),
  ])

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <PostsList posts={postsData.posts} />

        <Pagination
          currentPage={postsData.pagination.currentPage}
          totalPages={postsData.pagination.totalPages}
          hasNext={postsData.pagination.hasNext}
          hasPrev={postsData.pagination.hasPrev}
        />

        {/* Results summary */}
        {postsData.posts.length > 0 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {postsData.pagination.totalCount} 件中{' '}
            {(postsData.pagination.currentPage - 1) * 10 + 1} -{' '}
            {Math.min(
              postsData.pagination.currentPage * 10,
              postsData.pagination.totalCount
            )}{' '}
            件を表示
          </div>
        )}
      </div>

      <PostsFilter tags={allTags} />
    </div>
  )
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">読み物</h1>
          <p className="text-muted-foreground">
            技術記事や日々の学びを記録しています。
          </p>
        </div>

        <Suspense fallback={<PostsListSkeleton />}>
          <PostsContent searchParams={params} />
        </Suspense>
      </div>
    </div>
  )
}
