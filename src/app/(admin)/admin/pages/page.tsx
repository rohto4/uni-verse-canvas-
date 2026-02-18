import Link from "next/link"
import { Home, User, Link as LinkIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const pageLinks = [
  {
    title: "ホーム",
    description: "ヒーローやセクション見出しを編集",
    href: "/admin/pages/home",
    icon: Home,
  },
  {
    title: "自己紹介",
    description: "プロフィールと経歴を編集",
    href: "/admin/pages/about",
    icon: User,
  },
  {
    title: "リンク",
    description: "SNS・外部リンクを管理",
    href: "/admin/pages/links",
    icon: LinkIcon,
  },
]

export default function AdminPagesIndex() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">固定ページ</h1>
        <p className="text-muted-foreground">公開ページのコンテンツを編集します。</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageLinks.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <Icon className="h-5 w-5" />
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
