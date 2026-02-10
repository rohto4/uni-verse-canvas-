'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, X, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { TechStackInput } from '@/components/admin/TechStackInput'
import { ImageUploadMultiple } from '@/components/admin/ImageUploadMultiple'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { getTags } from '@/lib/actions/tags'
import type { Project, Tag } from '@/types/database'

const projectSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  slug: z.string().min(1, 'スラッグは必須です').regex(/^[a-z0-9-]+$/, '半角英数字とハイフンのみ使用可能です'),
  description: z.string().min(1, '説明は必須です'),
  content: z.any().optional(), // Tiptap content (HTML string or JSON)
  status: z.enum(['completed', 'archived']),
  demo_url: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  github_url: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  cover_image: z.string().nullable().optional(),
  gallery_images: z.array(z.string()),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  steps_count: z.coerce.number().min(0).optional().nullable(),
  tech_stack: z.record(z.string(), z.number()),
  tags: z.array(z.string()), // Tag IDs
  used_ai: z.array(z.string()),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  initialData?: Partial<Project> & { tags?: Tag[] }
  onSubmit: (data: ProjectFormValues) => Promise<void>
}

export function ProjectForm({ initialData, onSubmit }: ProjectFormProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiInput, setAiInput] = useState('')

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      status: initialData?.status || 'completed',
      demo_url: initialData?.demo_url || '',
      github_url: initialData?.github_url || '',
      cover_image: initialData?.cover_image || null,
      gallery_images: initialData?.gallery_images || [],
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      steps_count: initialData?.steps_count || 0,
      tech_stack: initialData?.tech_stack || {},
      tags: initialData?.tags?.map((t) => t.id) || [],
      used_ai: initialData?.used_ai || [],
    },
  })

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getTags()
        setAvailableTags(tags)
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }
    fetchTags()
  }, [])

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAiInputKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    field: { value: string[]; onChange: (val: string[]) => void }
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = aiInput.trim()
      if (val && !field.value.includes(val)) {
        field.onChange([...field.value, val])
        setAiInput('')
      }
    }
  }

  const removeAiTag = (
    tagToRemove: string,
    field: { value: string[]; onChange: (val: string[]) => void }
  ) => {
    field.onChange(field.value.filter((tag) => tag !== tagToRemove))
  }

  const toggleTag = (
    tagId: string,
    field: { value: string[]; onChange: (val: string[]) => void }
  ) => {
    const currentTags = field.value
    if (currentTags.includes(tagId)) {
      field.onChange(currentTags.filter((id) => id !== tagId))
    } else {
      field.onChange([...currentTags, tagId])
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content (Left: 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>プロジェクトの基本情報を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="プロジェクト名" {...form.register('title')} />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">スラッグ <span className="text-red-500">*</span></Label>
                <Input id="slug" placeholder="project-slug" {...form.register('slug')} />
                <p className="text-xs text-muted-foreground">URLの一部として使用されます (例: /projects/project-slug)</p>
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">概要 <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="プロジェクトの短い説明"
                  className="min-h-[100px]"
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>詳細コンテンツ</Label>
                <Controller
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <TiptapEditor
                      content={field.value as any}
                      onChange={field.onChange}
                      placeholder="プロジェクトの詳細内容..."
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ギャラリー & 技術スタック</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>ギャラリー画像</Label>
                <Controller
                  control={form.control}
                  name="gallery_images"
                  render={({ field }) => (
                    <ImageUploadMultiple
                      images={field.value}
                      onChange={field.onChange}
                      maxImages={10}
                    />
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="tech_stack"
                  render={({ field }) => (
                    <TechStackInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Right: 1 col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>公開設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">ステータス <span className="text-red-500">*</span></Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="ステータスを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed (完了)</SelectItem>
                        <SelectItem value="archived">Archived (アーカイブ)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status && (
                  <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>カバー画像</Label>
                <Controller
                  control={form.control}
                  name="cover_image"
                  render={({ field }) => (
                    <ImageUploadMultiple
                      images={field.value ? [field.value] : []}
                      onChange={(images) => field.onChange(images[0] || null)}
                      maxImages={1}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>メタデータ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo_url">デモURL</Label>
                <Input id="demo_url" placeholder="https://..." {...form.register('demo_url')} />
                {form.formState.errors.demo_url && (
                  <p className="text-sm text-destructive">{form.formState.errors.demo_url.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input id="github_url" placeholder="https://github.com/..." {...form.register('github_url')} />
                {form.formState.errors.github_url && (
                  <p className="text-sm text-destructive">{form.formState.errors.github_url.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">開始日</Label>
                  <Input id="start_date" type="date" {...form.register('start_date')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">終了日</Label>
                  <Input id="end_date" type="date" {...form.register('end_date')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="steps_count">工程数</Label>
                <Input
                  id="steps_count"
                  type="number"
                  min="0"
                  {...form.register('steps_count')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>タグ & AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>タグ</Label>
                <Controller
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/20 min-h-[60px]">
                      {availableTags.length === 0 ? (
                        <span className="text-sm text-muted-foreground p-1">タグを読み込み中...</span>
                      ) : (
                        availableTags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={field.value.includes(tag.id) ? 'default' : 'outline'}
                            className="cursor-pointer hover:opacity-80 transition-all"
                            onClick={() => toggleTag(tag.id, field)}
                          >
                            {tag.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>使用AI</Label>
                <Controller
                  control={form.control}
                  name="used_ai"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((ai, index) => (
                          <Badge key={index} variant="secondary" className="gap-1 pr-1">
                            {ai}
                            <button
                              type="button"
                              onClick={() => removeAiTag(ai, field)}
                              className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyDown={(e) => handleAiInputKeyDown(e, field)}
                          placeholder="AIツール名を入力してEnter"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (aiInput.trim() && !field.value.includes(aiInput.trim())) {
                              field.onChange([...field.value, aiInput.trim()])
                              setAiInput('')
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? '更新する' : '作成する'}
          </Button>
        </div>
      </div>
    </form>
  )
}
