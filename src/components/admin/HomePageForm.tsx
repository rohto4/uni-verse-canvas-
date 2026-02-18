"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface HomePageFormProps {
  initialHeroBadge: string
  initialHeroTitle: string
  initialHeroSubtitle: string
  initialPrimaryCtaLabel: string
  initialPrimaryCtaHref: string
  initialSecondaryCtaLabel: string
  initialSecondaryCtaHref: string
  initialSections: {
    postsTitle: string
    projectsTitle: string
    inProgressTitle: string
  }
  saveAction: (input: {
    page_type: "home"
    title: string
    content: Record<string, unknown>
    metadata: Record<string, unknown>
  }) => Promise<{ success: boolean; error?: string }>
}

function buildEmptyContent() {
  return { type: "doc", content: [] }
}

export default function HomePageForm({
  initialHeroBadge,
  initialHeroTitle,
  initialHeroSubtitle,
  initialPrimaryCtaLabel,
  initialPrimaryCtaHref,
  initialSecondaryCtaLabel,
  initialSecondaryCtaHref,
  initialSections,
  saveAction,
}: HomePageFormProps) {
  const [heroBadge, setHeroBadge] = useState(initialHeroBadge)
  const [heroTitle, setHeroTitle] = useState(initialHeroTitle)
  const [heroSubtitle, setHeroSubtitle] = useState(initialHeroSubtitle)
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState(initialPrimaryCtaLabel)
  const [primaryCtaHref, setPrimaryCtaHref] = useState(initialPrimaryCtaHref)
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState(initialSecondaryCtaLabel)
  const [secondaryCtaHref, setSecondaryCtaHref] = useState(initialSecondaryCtaHref)
  const [sections, setSections] = useState(initialSections)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    const metadata = {
      heroBadge: heroBadge.trim(),
      heroTitle: heroTitle.trim(),
      heroSubtitle: heroSubtitle.trim(),
      primaryCtaLabel: primaryCtaLabel.trim(),
      primaryCtaHref: primaryCtaHref.trim(),
      secondaryCtaLabel: secondaryCtaLabel.trim(),
      secondaryCtaHref: secondaryCtaHref.trim(),
      sections: {
        postsTitle: sections.postsTitle.trim(),
        projectsTitle: sections.projectsTitle.trim(),
        inProgressTitle: sections.inProgressTitle.trim(),
      },
    }

    startTransition(async () => {
      const result = await saveAction({
        page_type: "home",
        title: "home",
        content: buildEmptyContent(),
        metadata,
      })

      if (!result.success) {
        toast.error(result.error || "ホームページの保存に失敗しました")
        return
      }

      toast.success("ホームページを保存しました")
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ヒーロー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">バッジ</label>
            <Input value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">タイトル</label>
            <Textarea
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="改行で2行表示"
            />
          </div>
          <div>
            <label className="text-sm font-medium">サブタイトル</label>
            <Textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="改行で段落を分けられます"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CTA</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">メインCTA ラベル</label>
            <Input value={primaryCtaLabel} onChange={(e) => setPrimaryCtaLabel(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">メインCTA リンク</label>
            <Input value={primaryCtaHref} onChange={(e) => setPrimaryCtaHref(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">サブCTA ラベル</label>
            <Input value={secondaryCtaLabel} onChange={(e) => setSecondaryCtaLabel(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">サブCTA リンク</label>
            <Input value={secondaryCtaHref} onChange={(e) => setSecondaryCtaHref(e.target.value)} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>セクション見出し</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">読み物</label>
            <Input
              value={sections.postsTitle}
              onChange={(e) => setSections((prev) => ({ ...prev, postsTitle: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">作ったもの</label>
            <Input
              value={sections.projectsTitle}
              onChange={(e) => setSections((prev) => ({ ...prev, projectsTitle: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">進行中</label>
            <Input
              value={sections.inProgressTitle}
              onChange={(e) => setSections((prev) => ({ ...prev, inProgressTitle: e.target.value }))}
              className="mt-1"
            />
          </div>
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
