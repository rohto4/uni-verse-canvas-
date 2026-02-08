import { ExternalLink, Github, Twitter, Linkedin, Mail, Globe, BookOpen, MessageCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPage } from "@/lib/actions/pages"

const iconMap: Record<string, any> = {
  Github,
  Twitter,
  Linkedin,
  Mail,
  BookOpen,
  Globe,
  MessageCircle,
}

const colorMap: Record<string, string> = {
  Github: "hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900",
  Twitter: "hover:bg-blue-500 hover:text-white",
  Linkedin: "hover:bg-blue-700 hover:text-white",
  Mail: "hover:bg-primary hover:text-primary-foreground",
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

  const metadata = pageData.metadata as any
  const socialLinks = metadata.socialLinks || []
  const otherLinks = metadata.otherLinks || []
  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">関連リンク</h1>
          <p className="text-muted-foreground">
            各種SNSや外部サービスへのリンクです
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">SNS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialLinks.map((link: any) => {
              const Icon = iconMap[link.icon] || Globe
              const color = colorMap[link.icon] || ""
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className={`transition-all duration-300 ${color}`}>
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="p-3 rounded-full bg-secondary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{link.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {link.description}
                        </p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">その他</h2>
          <div className="space-y-3">
            {otherLinks.map((link: any) => {
              const Icon = iconMap[link.icon] || Globe
              const isExternal = link.url.startsWith("http")
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-medium">{link.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  {isExternal && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </a>
              )
            })}
          </div>
        </div>

        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10">
          <CardHeader className="text-center">
            <CardTitle>お仕事のご相談</CardTitle>
            <CardDescription>
              Webアプリケーション開発のご依頼を承っています
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg">
              <a href="mailto:example@example.com">
                <Mail className="h-5 w-5 mr-2" />
                お問い合わせ
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
