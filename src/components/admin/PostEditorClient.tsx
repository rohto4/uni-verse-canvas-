'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, Settings, Trash2, Loader2, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TiptapEditor } from '@/components/editor'
import { ImageUploadMultiple } from '@/components/admin/ImageUploadMultiple'
import type { Tag, PostWithTags } from '@/types/database'
import { toast } from 'sonner'
import type { JSONContent } from '@tiptap/core'

type PostStatus = 'draft' | 'scheduled' | 'published'

type CreatePostInput = {
  title: string
  slug: string
  excerpt: string | null
  content: JSONContent
  status: PostStatus
  published_at: string | null
  tags: string[]
  cover_image?: string | null
  ogp_image?: string | null
  related_post_ids: string[]
  related_project_ids: string[]
}

type UpdatePostInput = Partial<CreatePostInput>

type ActionResponse<T = void> = {
  success: boolean
  data?: T
  error?: string
}

interface PostEditorClientProps {
  mode: 'create' | 'edit'
  availableTags: Tag[]
  availablePosts: Array<{ id: string; title: string; slug: string; status: PostStatus }>
  availableProjects: Array<{ id: string; title: string; slug: string }>
  initialPost?: PostWithTags
  initialRelatedPostIds?: string[]
  initialRelatedProjectIds?: string[]
  uploadAction: (formData: FormData) => Promise<{ url: string | null; error?: string }>
  createAction?: (input: CreatePostInput) => Promise<ActionResponse<PostWithTags>>
  updateAction?: (id: string, input: UpdatePostInput) => Promise<ActionResponse<PostWithTags>>
  deleteAction?: (id: string) => Promise<ActionResponse<void>>
}

export function PostEditorClient({
  mode,
  availableTags,
  availablePosts,
  availableProjects,
  initialPost,
  initialRelatedPostIds,
  initialRelatedProjectIds,
  uploadAction,
  createAction,
  updateAction,
  deleteAction,
}: PostEditorClientProps) {
  const router = useRouter()

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(initialPost?.updated_at ? new Date(initialPost.updated_at) : null)

  const [title, setTitle] = useState(initialPost?.title || '')
  const [slug, setSlug] = useState(initialPost?.slug || '')
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '')
  const [content, setContent] = useState<JSONContent>(initialPost?.content || {})
  const [status, setStatus] = useState<PostStatus>(initialPost?.status || 'draft')
  const [publishedAt, setPublishedAt] = useState<string>(
    initialPost?.published_at ? new Date(initialPost.published_at).toISOString().slice(0, 16) : ''
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(initialPost?.tags?.map((t) => t.id) || [])
  const [coverImage, setCoverImage] = useState<string | null>(initialPost?.cover_image || null)
  const [ogpImage, setOgpImage] = useState<string | null>(initialPost?.ogp_image || null)
  const [relatedPostIds, setRelatedPostIds] = useState<string[]>(initialRelatedPostIds || [])
  const [relatedProjectIds, setRelatedProjectIds] = useState<string[]>(initialRelatedProjectIds || [])
  const [postSearch, setPostSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')

  const handleChange = useCallback(() => {
    if (mode === 'create') return
    setHasChanges(true)
  }, [mode])

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value)
    if (mode === 'create') {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 200)
      setSlug(generatedSlug)
    } else {
      handleChange()
    }
  }, [mode, handleChange])

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
    if (mode === 'edit') handleChange()
  }, [mode, handleChange])

  const toggleRelatedPost = useCallback((postId: string) => {
    setRelatedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    )
    if (mode === 'edit') handleChange()
  }, [mode, handleChange])

  const toggleRelatedProject = useCallback((projectId: string) => {
    setRelatedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    )
    if (mode === 'edit') handleChange()
  }, [mode, handleChange])

  const handleSave = useCallback(async () => {
    if (!title) {
      toast.error('タイトルを入力してください')
      return
    }
    if (!slug) {
      toast.error('スラッグを入力してください')
      return
    }

    setIsSaving(true)
    try {
      if (mode === 'create') {
        if (!createAction) throw new Error('createAction is not configured')
        const input: CreatePostInput = {
          title,
          slug,
          excerpt: excerpt || null,
          content,
          status,
          published_at: publishedAt || null,
          tags: selectedTags,
          cover_image: coverImage || null,
          ogp_image: ogpImage || null,
          related_post_ids: relatedPostIds,
          related_project_ids: relatedProjectIds,
        }
        const result = await createAction(input)
        if (result.success) {
          toast.success('記事を作成しました')
          router.push('/admin/posts')
          router.refresh()
        } else {
          toast.error(result.error || '記事の作成に失敗しました')
        }
      } else {
        if (!updateAction || !initialPost) throw new Error('updateAction is not configured')
        const input: UpdatePostInput = {
          title,
          slug,
          excerpt: excerpt || null,
          content,
          status,
          published_at: publishedAt || null,
          tags: selectedTags,
          cover_image: coverImage || null,
          ogp_image: ogpImage || null,
          related_post_ids: relatedPostIds,
          related_project_ids: relatedProjectIds,
        }
        const result = await updateAction(initialPost.id, input)
        if (result.success) {
          setLastSaved(new Date())
          setHasChanges(false)
          toast.success('変更を保存しました')
        } else {
          toast.error(result.error || '保存に失敗しました')
        }
      }
    } catch (error) {
      console.error('Failed to save post:', error)
      toast.error('予期せぬエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }, [mode, title, slug, excerpt, content, status, publishedAt, selectedTags, coverImage, ogpImage, relatedPostIds, relatedProjectIds, createAction, updateAction, initialPost, router])

  const handleDelete = useCallback(async () => {
    if (!initialPost || !deleteAction) return
    setIsDeleting(true)
    try {
      const result = await deleteAction(initialPost.id)
      if (result.success) {
        toast.success('記事を削除しました')
        router.push('/admin/posts')
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      toast.error('予期せぬエラーが発生しました')
    } finally {
      setIsDeleting(false)
    }
  }, [initialPost, deleteAction, router])

  const handlePreview = useCallback(() => {
    const previewData = {
      title,
      content,
      excerpt,
      tags: selectedTags.map(
        (id) => availableTags.find((t) => t.id === id)?.name || ''
      ),
    }
    localStorage.setItem('post-preview-data', JSON.stringify(previewData))
    window.open('/admin/posts/preview', '_blank')
  }, [title, content, excerpt, selectedTags, availableTags])

  const handleExport = useCallback(() => {
    const markdown = `# ${title}\n\n${excerpt}\n\n---\n\n${JSON.stringify(content)}`
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug || 'post'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [title, slug, excerpt, content])

  const filteredPosts = availablePosts.filter((post) => {
    if (initialPost?.id && post.id === initialPost.id) return false
    const query = postSearch.trim().toLowerCase()
    if (!query) return true
    return post.title.toLowerCase().includes(query) || post.slug.toLowerCase().includes(query)
  })

  const filteredProjects = availableProjects.filter((project) => {
    const query = projectSearch.trim().toLowerCase()
    if (!query) return true
    return project.title.toLowerCase().includes(query) || project.slug.toLowerCase().includes(query)
  })

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/admin/posts">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">{mode === 'create' ? '新規記事作成' : '記事を編集'}</h1>
              <p className="text-xs text-muted-foreground">
                {mode === 'create'
                  ? status === 'draft' ? '下書き' : status === 'scheduled' ? '予約投稿' : '公開'
                  : hasChanges ? '未保存の変更あり' : '保存済み'}
                {lastSaved && <span className="ml-2">• 最終保存: {lastSaved.toLocaleTimeString('ja-JP')}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'edit' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>記事を削除しますか？</DialogTitle>
                      <DialogDescription>
                        この操作は取り消せません。記事「{title}」を完全に削除します。
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">キャンセル</Button>
                      <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        削除する
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                プレビュー
              </Button>
              {mode === 'create' && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  エクスポート
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={isSaving || (mode === 'edit' && !hasChanges)}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                保存
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <div>
              <Input
                type="text"
                placeholder="タイトルを入力..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/50"
              />
              <p className="text-xs text-muted-foreground mt-1">{title.length}/200文字</p>
            </div>

            <TiptapEditor
              content={content}
              onUpdate={(editor) => {
                setContent(editor.getJSON())
                if (mode === 'edit') handleChange()
              }}
              placeholder="本文を入力してください..."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-8 border-t items-start">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      公開設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">ステータス</label>
                      <Select
                        value={status}
                        onValueChange={(val) => {
                          setStatus(val as PostStatus)
                          if (mode === 'edit') handleChange()
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">下書き</SelectItem>
                          <SelectItem value="scheduled">予約投稿</SelectItem>
                          <SelectItem value="published">公開</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {status === 'scheduled' && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">公開日時</label>
                        <Input
                          type="datetime-local"
                          value={publishedAt}
                          onChange={(e) => {
                            setPublishedAt(e.target.value)
                            if (mode === 'edit') handleChange()
                          }}
                        />
                      </div>
                    )}

                    {mode === 'edit' && status === 'published' && slug && (
                      <div className="p-3 bg-accent/50 rounded-lg text-sm">
                        <p className="font-medium flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          公開中
                        </p>
                        <Link
                          href={`/posts/${slug}`}
                          target="_blank"
                          className="text-primary text-xs hover:underline flex items-center gap-1 mt-2"
                        >
                          公開ページを表示 <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">URL スラッグ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="text"
                      placeholder="url-slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value)
                        if (mode === 'edit') handleChange()
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">/posts/{slug || '...'}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">抜粋</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="記事の概要を入力..."
                      value={excerpt}
                      onChange={(e) => {
                        setExcerpt(e.target.value)
                        if (mode === 'edit') handleChange()
                      }}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-2">{excerpt.length}/300文字（OGP用）</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">タグ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                          className="cursor-pointer transition-colors"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">カバー画像</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageUploadMultiple
                      images={coverImage ? [coverImage] : []}
                      onChange={(images) => {
                        setCoverImage(images[0] || null)
                        if (mode === 'edit') handleChange()
                      }}
                      uploadAction={uploadAction}
                      maxImages={1}
                      label="カバー画像"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">OGP画像</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageUploadMultiple
                      images={ogpImage ? [ogpImage] : []}
                      onChange={(images) => {
                        setOgpImage(images[0] || null)
                        if (mode === 'edit') handleChange()
                      }}
                      uploadAction={uploadAction}
                      maxImages={1}
                      label="OGP画像"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">関連記事</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      type="search"
                      placeholder="記事を検索..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                    />
                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {filteredPosts.length === 0 && (
                        <p className="text-xs text-muted-foreground">該当する記事がありません</p>
                      )}
                      {filteredPosts.map((post) => (
                        <label key={post.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={relatedPostIds.includes(post.id)}
                            onChange={() => toggleRelatedPost(post.id)}
                            className="h-4 w-4"
                          />
                          <span className="flex-1 truncate">{post.title}</span>
                          <Badge variant="outline" className="text-xs">{post.status}</Badge>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">関連プロジェクト</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      type="search"
                      placeholder="プロジェクトを検索..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                    />
                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {filteredProjects.length === 0 && (
                        <p className="text-xs text-muted-foreground">該当するプロジェクトがありません</p>
                      )}
                      {filteredProjects.map((project) => (
                        <label key={project.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={relatedProjectIds.includes(project.id)}
                            onChange={() => toggleRelatedProject(project.id)}
                            className="h-4 w-4"
                          />
                          <span className="flex-1 truncate">{project.title}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
