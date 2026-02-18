import { notFound } from 'next/navigation'
import { getPostById, updatePost, deletePost, getPosts, getPostRelations } from '@/lib/actions/posts'
import { getTags } from '@/lib/actions/tags'
import { getProjects } from '@/lib/actions/projects'
import { uploadFile } from '@/lib/actions/storage'
import { PostEditorClient } from '@/components/admin/PostEditorClient'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const resolvedParams = await params
  const post = await getPostById(resolvedParams.id)
  if (!post) {
    notFound()
  }

  const [tags, draftPosts, scheduledPosts, publishedPosts, projects, relations] = await Promise.all([
    getTags(),
    getPosts({ status: 'draft', limit: 200 }),
    getPosts({ status: 'scheduled', limit: 200 }),
    getPosts({ status: 'published', limit: 200 }),
    getProjects({ status: ['completed', 'archived', 'registered'], limit: 200 }),
    getPostRelations(resolvedParams.id),
  ])

  const availablePosts = Array.from(
    new Map([
      ...draftPosts.posts,
      ...scheduledPosts.posts,
      ...publishedPosts.posts,
    ].map((item) => [item.id, item])).values()
  )
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      status: item.status,
    }))

  const availableProjects = projects.projects.map((project: { id: string; title: string; slug: string }) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
  }))

   async function updatePostAction(id: string, input: Parameters<typeof updatePost>[1]) {
     'use server'
     return updatePost(id, input)
   }

  async function deletePostAction(id: string) {
    'use server'
    return deletePost(id)
  }

  async function uploadAction(formData: FormData) {
    'use server'
    return uploadFile(formData)
  }

  return (
    <PostEditorClient
      mode="edit"
      initialPost={post}
      availableTags={tags}
      availablePosts={availablePosts}
      availableProjects={availableProjects}
      initialRelatedPostIds={relations.relatedPostIds}
      initialRelatedProjectIds={relations.relatedProjectIds}
      uploadAction={uploadAction}
      updateAction={updatePostAction}
      deleteAction={deletePostAction}
    />
  )
}
