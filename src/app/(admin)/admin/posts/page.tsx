import { getPosts, deletePost } from '@/lib/actions/posts'
import { PostsListClient } from '@/components/admin/PostsListClient'

export default function PostsPage() {
  async function fetchPostsAction(params: Parameters<typeof getPosts>[0]) {
    'use server'
    if (!params?.status) {
      const [draft, scheduled, published] = await Promise.all([
        getPosts({ ...params, status: 'draft' }),
        getPosts({ ...params, status: 'scheduled' }),
        getPosts({ ...params, status: 'published' }),
      ])

      const merged = [...draft.posts, ...scheduled.posts, ...published.posts]
      const uniqueById = new Map<string, (typeof merged)[number]>()

      merged.forEach((post) => {
        const existing = uniqueById.get(post.id)
        if (!existing || new Date(post.updated_at).getTime() > new Date(existing.updated_at).getTime()) {
          uniqueById.set(post.id, post)
        }
      })

      const uniquePosts = Array.from(uniqueById.values())
      uniquePosts.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      return { posts: uniquePosts }
    }

    return getPosts(params)
  }

  async function deletePostAction(id: string) {
    'use server'
    return deletePost(id)
  }

  return (
    <PostsListClient
      fetchPostsAction={fetchPostsAction}
      deletePostAction={deletePostAction}
    />
  )
}
