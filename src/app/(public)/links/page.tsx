import {
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Globe,
  BookOpen,
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
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPage } from "@/lib/actions/pages"
import { ComponentType } from "react"

interface LinkItem {
    name: string;
    url: string;
    description: string;
    icon: string;
    iconImageUrl?: string;
}

interface LinksMetadata {
    socialLinks: LinkItem[];
    otherLinks: LinkItem[];
    contactUrl?: string;
    contactIconImageUrl?: string;
    contactMessage?: string;
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
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
}

const colorMap: Record<string, string> = {
  Github: "hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900",
  Twitter: "hover:bg-blue-500 hover:text-white",
  Linkedin: "hover:bg-blue-700 hover:text-white",
  Mail: "hover:bg-primary hover:text-primary-foreground",
  Youtube: "hover:bg-red-600 hover:text-white",
  Instagram: "hover:bg-pink-500 hover:text-white",
  Rss: "hover:bg-orange-500 hover:text-white",
}

export const metadata = {
  title: "関連リンク",
  description: "SNSや外部サービスへのリンク集です。",
}

export default async function LinksPage() {
  const pageData = await getPage('links')

  if (!pageData) {
    return <div>ページが見つかりません</div>
  }

  const metadata = pageData.metadata as unknown as LinksMetadata
  const socialLinks = metadata.socialLinks || []
  const otherLinks = metadata.otherLinks || []
  const contactUrl = metadata.contactUrl || ""
  const contactIconImageUrl = metadata.contactIconImageUrl || ""
  const contactMessage = metadata.contactMessage || ""
  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">関連リンク</h1>
          <p className="text-muted-foreground">
            各種SNSや外部サービスへのリンクです
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">SNS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialLinks.map((link: LinkItem) => {
              const Icon = iconMap[link.icon] || Globe
              const color = colorMap[link.icon] || ""
              const hasUrl = Boolean(link.url)
              const cardContent = (
                <Card className={`transition-all duration-300 ${hasUrl ? color : "opacity-50"}`}>
                  <CardContent className="flex items-center gap-4 p-6">
                    {link.iconImageUrl ? (
                      <div className="h-12 w-12 rounded-full bg-secondary flex-shrink-0 overflow-hidden">
                        <img src={link.iconImageUrl} alt={link.name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="p-3 rounded-full bg-secondary flex-shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{link.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                    {hasUrl ? (
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <span className="text-xs text-muted-foreground/60">準備中</span>
                    )}
                  </CardContent>
                </Card>
              )
              return hasUrl ? (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {cardContent}
                </a>
              ) : (
                <div key={link.name} className="block cursor-default">
                  {cardContent}
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">その他</h2>
          <div className="space-y-3">
            {otherLinks.map((link: LinkItem) => {
              const Icon = iconMap[link.icon] || Globe
              const hasUrl = Boolean(link.url)
              const isExternal = hasUrl && link.url.startsWith("http")
              const inner = (
                <>
                  <div className="flex-shrink-0">
                    {link.iconImageUrl ? (
                      <img src={link.iconImageUrl} alt={link.name} className="h-5 w-5 rounded-full object-cover" />
                    ) : (
                      <Icon className={`h-5 w-5 ${hasUrl ? "text-primary" : "text-muted-foreground/50"}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{link.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  {hasUrl ? (
                    isExternal && <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <span className="text-xs text-muted-foreground/60">準備中</span>
                  )}
                </>
              )
              return hasUrl ? (
                <a
                  key={link.name}
                  href={link.url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={link.name}
                  className="flex items-center gap-4 p-4 rounded-lg border opacity-50 cursor-default"
                >
                  {inner}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-12 space-y-3">
          {contactMessage && (
            <p className="text-center text-sm text-muted-foreground">{contactMessage}</p>
          )}
          {contactUrl && contactIconImageUrl ? (
            <div className="flex justify-center">
              <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border hover:opacity-80 transition-opacity max-w-[375px] w-full">
                <img
                  src={contactIconImageUrl}
                  alt="お問い合わせ"
                  className="w-full h-auto object-contain"
                />
              </a>
            </div>
          ) : contactUrl ? (
            <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center">
              <Button asChild size="lg">
                <a href={contactUrl} target="_blank" rel="noopener noreferrer">
                  <Mail className="h-5 w-5 mr-2" />
                  お問い合わせ
                </a>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center">
              <Button size="lg" disabled>
                <Mail className="h-5 w-5 mr-2" />
                お問い合わせ（準備中）
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
