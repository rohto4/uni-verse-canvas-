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
      merged.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      return { posts: merged }
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
