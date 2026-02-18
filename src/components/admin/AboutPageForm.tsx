"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type TimelineItem = {
  year: string
  title: string
  description: string
}

type SkillsInput = {
  core: string
  infra: string
  ai: string
  method: string
  workflow: string
}

interface AboutPageFormProps {
  initialName: string
  initialRole: string
  initialLocation: string
  initialEmployment: string
  initialIntro: string
  initialSkills: SkillsInput
  initialTimeline: TimelineItem[]
  initialAvatarUrl: string
  uploadAction: (formData: FormData) => Promise<{ url: string | null; error?: string }>
  saveAction: (input: {
    page_type: "about"
    title: string
    content: Record<string, unknown>
    metadata: Record<string, unknown>
  }) => Promise<{ success: boolean; error?: string }>
}

function splitSkills(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildIntroContent(text: string) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    })),
  }
}

export default function AboutPageForm({
  initialName,
  initialRole,
  initialLocation,
  initialEmployment,
  initialIntro,
  initialSkills,
  initialTimeline,
  initialAvatarUrl,
  uploadAction,
  saveAction,
}: AboutPageFormProps) {
  const [name, setName] = useState(initialName)
  const [role, setRole] = useState(initialRole)
  const [location, setLocation] = useState(initialLocation)
  const [employment, setEmployment] = useState(initialEmployment)
  const [intro, setIntro] = useState(initialIntro)
  const [skills, setSkills] = useState(initialSkills)
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [isPending, startTransition] = useTransition()

  const updateTimelineItem = (index: number, key: keyof TimelineItem, value: string) => {
    setTimeline((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    )
  }

  const addTimelineItem = () => {
    setTimeline((prev) => [...prev, { year: "", title: "", description: "" }])
  }

  const removeTimelineItem = (index: number) => {
    setTimeline((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const result = await uploadAction(formData)
    if (!result?.url) {
      toast.error(result?.error || "画像のアップロードに失敗しました")
      return
    }
    setAvatarUrl(result.url)
    toast.success("プロフィール画像を更新しました")
  }

  const handleSave = () => {
    const metadata = {
      name: name.trim(),
      role: role.trim(),
      location: location.trim(),
      employment: employment.trim(),
      skills: {
        core: splitSkills(skills.core),
        infra: splitSkills(skills.infra),
        ai: splitSkills(skills.ai),
        method: skills.method.trim(),
        workflow: splitSkills(skills.workflow),
      },
      avatarUrl: avatarUrl.trim(),
      timeline: timeline
        .map((item) => ({
          year: item.year.trim(),
          title: item.title.trim(),
          description: item.description.trim(),
        }))
        .filter((item) => item.year || item.title || item.description),
    }

    const content = buildIntroContent(intro)

    startTransition(async () => {
      const result = await saveAction({
        page_type: "about",
        title: "about",
        content,
        metadata,
      })

      if (!result.success) {
        toast.error(result.error || "自己紹介ページの保存に失敗しました")
        return
      }

      toast.success("自己紹介ページを保存しました")
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">プロフィール画像</label>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">👋</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  />
                  <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    画像アップロード
                  </span>
                </label>
                {avatarUrl && (
                  <Button variant="outline" onClick={() => setAvatarUrl("")}>画像を外す</Button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">名前</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">肩書き</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">所在地</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">働き方</label>
            <Input value={employment} onChange={(e) => setEmployment(e.target.value)} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>自己紹介本文</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={6}
            placeholder="改行で段落分けされます"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>スキル</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">スキル</label>
            <Input
              value={skills.core}
              onChange={(e) => setSkills((prev) => ({ ...prev, core: e.target.value }))}
              className="mt-1"
              placeholder="例: Next.js, React, TypeScript"
            />
          </div>
          <div>
            <label className="text-sm font-medium">インフラ/データベース</label>
            <Input
              value={skills.infra}
              onChange={(e) => setSkills((prev) => ({ ...prev, infra: e.target.value }))}
              className="mt-1"
              placeholder="例: Supabase, PostgreSQL, Vercel"
            />
          </div>
          <div>
            <label className="text-sm font-medium">生成AI</label>
            <Input
              value={skills.ai}
              onChange={(e) => setSkills((prev) => ({ ...prev, ai: e.target.value }))}
              className="mt-1"
              placeholder="例: Claude, Gemini, ChatGPT"
            />
          </div>
          <div>
            <label className="text-sm font-medium">開発手法</label>
            <Input
              value={skills.method}
              onChange={(e) => setSkills((prev) => ({ ...prev, method: e.target.value }))}
              className="mt-1"
              placeholder="例: ドキュメント駆動開発"
            />
          </div>
          <div>
            <label className="text-sm font-medium">ワークフロー/ツール</label>
            <Input
              value={skills.workflow}
              onChange={(e) => setSkills((prev) => ({ ...prev, workflow: e.target.value }))}
              className="mt-1"
              placeholder="例: NotebookLM, Notion, Linear"
            />
          </div>
          <p className="text-xs text-muted-foreground">スキルと生成AIはカンマ区切りで入力してください。</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>経歴</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeline.map((item, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  value={item.year}
                  onChange={(e) => updateTimelineItem(index, "year", e.target.value)}
                  placeholder="2024"
                />
                <Input
                  value={item.title}
                  onChange={(e) => updateTimelineItem(index, "title", e.target.value)}
                  placeholder="タイトル"
                />
                <Button
                  variant="outline"
                  onClick={() => removeTimelineItem(index)}
                >
                  削除
                </Button>
              </div>
              <Textarea
                value={item.description}
                onChange={(e) => updateTimelineItem(index, "description", e.target.value)}
                rows={3}
                placeholder="説明"
              />
            </div>
          ))}
          <Separator />
          <Button variant="outline" onClick={addTimelineItem}>
            経歴を追加
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  )
}
