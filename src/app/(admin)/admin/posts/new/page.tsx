import { createPost, getPosts } from '@/lib/actions/posts'
import { getTags } from '@/lib/actions/tags'
import { getProjects } from '@/lib/actions/projects'
import { uploadFile } from '@/lib/actions/storage'
import { PostEditorClient } from '@/components/admin/PostEditorClient'

export default async function NewPostPage() {
  const [tags, draftPosts, scheduledPosts, publishedPosts, projects] = await Promise.all([
    getTags(),
    getPosts({ status: 'draft', limit: 200 }),
    getPosts({ status: 'scheduled', limit: 200 }),
    getPosts({ status: 'published', limit: 200 }),
    getProjects({ status: ['completed', 'archived', 'registered'], limit: 200 }),
  ])

  const availablePosts = Array.from(
    new Map([
      ...draftPosts.posts,
      ...scheduledPosts.posts,
      ...publishedPosts.posts,
    ].map((post) => [post.id, post])).values()
  )
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
    }))

  const availableProjects = projects.projects.map((project: { id: string; title: string; slug: string }) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
  }))

  async function createPostAction(input: Parameters<typeof createPost>[0]) {
    'use server'
    return createPost(input)
  }

  async function uploadAction(formData: FormData) {
    'use server'
    return uploadFile(formData)
  }

  return (
    <PostEditorClient
      mode="create"
      availableTags={tags}
      availablePosts={availablePosts}
      availableProjects={availableProjects}
      uploadAction={uploadAction}
      createAction={createPostAction}
    />
  )
}
