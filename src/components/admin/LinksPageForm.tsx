"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  BookOpen,
  Globe,
  MessageCircle,
  Youtube,
  Instagram,
  Link as LinkIcon,
  Rss,
  Code2,
  FileText,
  Sparkles,
  Bot,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type LinkItem = {
  name: string
  url: string
  description: string
  icon: string
  iconImageUrl?: string
}

interface LinksPageFormProps {
  initialContactEmail: string
  initialSocialLinks: LinkItem[]
  initialOtherLinks: LinkItem[]
  uploadAction: (formData: FormData) => Promise<{ url: string | null; error?: string }>
  saveAction: (input: {
    page_type: "links"
    title: string
    content: Record<string, unknown>
    metadata: Record<string, unknown>
  }) => Promise<{ success: boolean; error?: string }>
}

const iconOptions = [
  "Github",
  "Twitter",
  "Linkedin",
  "Mail",
  "BookOpen",
  "Globe",
  "MessageCircle",
  "Youtube",
  "Instagram",
  "Link",
  "Rss",
  "Code2",
  "FileText",
  "Sparkles",
  "Bot",
  "Misskey",
  "note",
  "Zenn",
  "Qiita",
]

const iconMap = {
  Github,
  Twitter,
  Linkedin,
  Mail,
  BookOpen,
  Globe,
  MessageCircle,
  Youtube,
  Instagram,
  Link: LinkIcon,
  Rss,
  Code2,
  FileText,
  Sparkles,
  Bot,
  Misskey: MessageCircle,
  note: BookOpen,
  Zenn: Sparkles,
  Qiita: Code2,
}

function normalizeLinks(links: LinkItem[]) {
  return links
    .map((link) => ({
      name: link.name.trim(),
      url: link.url.trim(),
      description: link.description.trim(),
      icon: link.icon.trim() || "Globe",
      iconImageUrl: link.iconImageUrl?.trim() || "",
    }))
    .filter((link) => link.name && link.url)
}

function buildEmptyContent() {
  return { type: "doc", content: [] }
}

export default function LinksPageForm({
  initialContactEmail,
  initialSocialLinks,
  initialOtherLinks,
  uploadAction,
  saveAction,
}: LinksPageFormProps) {
  const [contactEmail, setContactEmail] = useState(initialContactEmail)
  const [socialLinks, setSocialLinks] = useState<LinkItem[]>(initialSocialLinks)
  const [otherLinks, setOtherLinks] = useState<LinkItem[]>(initialOtherLinks)
  const [isPending, startTransition] = useTransition()

  const updateLink = (
    list: "social" | "other",
    index: number,
    key: keyof LinkItem,
    value: string
  ) => {
    const updater = list === "social" ? setSocialLinks : setOtherLinks
    updater((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    )
  }

  const addLink = (list: "social" | "other") => {
    const updater = list === "social" ? setSocialLinks : setOtherLinks
    updater((prev) => [...prev, { name: "", url: "", description: "", icon: "Globe", iconImageUrl: "" }])
  }

  const removeLink = (list: "social" | "other", index: number) => {
    const updater = list === "social" ? setSocialLinks : setOtherLinks
    updater((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (list: "social" | "other", index: number, file?: File) => {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const result = await uploadAction(formData)
    if (!result?.url) {
      toast.error(result?.error || "画像のアップロードに失敗しました")
      return
    }
    updateLink(list, index, "iconImageUrl", result.url)
    toast.success("画像をアップロードしました")
  }

  const handleSave = () => {
    const metadata = {
      contactEmail: contactEmail.trim(),
      socialLinks: normalizeLinks(socialLinks),
      otherLinks: normalizeLinks(otherLinks),
    }

    startTransition(async () => {
      const result = await saveAction({
        page_type: "links",
        title: "links",
        content: buildEmptyContent(),
        metadata,
      })

      if (!result.success) {
        toast.error(result.error || "リンクページの保存に失敗しました")
        return
      }

      toast.success("リンクページを保存しました")
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>お問い合わせメール</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="example@example.com"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SNS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,1fr,1fr,1fr] gap-3 items-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {link.iconImageUrl ? (
                    <img
                      src={link.iconImageUrl}
                      alt={link.name || "icon"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (() => {
                      const Icon = iconMap[link.icon as keyof typeof iconMap] || Globe
                      return <Icon className="h-5 w-5" />
                    })()
                  )}
                </div>
                <Input
                  value={link.name}
                  onChange={(e) => updateLink("social", index, "name", e.target.value)}
                  placeholder="名前"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateLink("social", index, "url", e.target.value)}
                  placeholder="https://..."
                />
                <Input
                  value={link.description}
                  onChange={(e) => updateLink("social", index, "description", e.target.value)}
                  placeholder="説明"
                />
                <Select
                  value={link.icon || "Globe"}
                  onValueChange={(value) => updateLink("social", index, "icon", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="アイコン" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload("social", index, e.target.files?.[0])}
                  />
                  <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    画像アップロード
                  </span>
                </label>
                {link.iconImageUrl && (
                  <Button
                    variant="outline"
                    onClick={() => updateLink("social", index, "iconImageUrl", "")}
                  >
                    画像を外す
                  </Button>
                )}
                <Button variant="outline" onClick={() => removeLink("social", index)}>
                  削除
                </Button>
              </div>
            </div>
          ))}
          <Separator />
          <Button variant="outline" onClick={() => addLink("social")}
          >
            SNSリンクを追加
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>その他リンク</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {otherLinks.map((link, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,1fr,1fr,1fr] gap-3 items-center">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {link.iconImageUrl ? (
                    <img
                      src={link.iconImageUrl}
                      alt={link.name || "icon"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (() => {
                      const Icon = iconMap[link.icon as keyof typeof iconMap] || Globe
                      return <Icon className="h-5 w-5" />
                    })()
                  )}
                </div>
                <Input
                  value={link.name}
                  onChange={(e) => updateLink("other", index, "name", e.target.value)}
                  placeholder="名前"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateLink("other", index, "url", e.target.value)}
                  placeholder="https://..."
                />
                <Input
                  value={link.description}
                  onChange={(e) => updateLink("other", index, "description", e.target.value)}
                  placeholder="説明"
                />
                <Select
                  value={link.icon || "Globe"}
                  onValueChange={(value) => updateLink("other", index, "icon", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="アイコン" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload("other", index, e.target.files?.[0])}
                  />
                  <span className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    画像アップロード
                  </span>
                </label>
                {link.iconImageUrl && (
                  <Button
                    variant="outline"
                    onClick={() => updateLink("other", index, "iconImageUrl", "")}
                  >
                    画像を外す
                  </Button>
                )}
                <Button variant="outline" onClick={() => removeLink("other", index)}>
                  削除
                </Button>
              </div>
            </div>
          ))}
          <Separator />
          <Button variant="outline" onClick={() => addLink("other")}
          >
            その他リンクを追加
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
