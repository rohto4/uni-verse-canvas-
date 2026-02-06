import { MapPin, Briefcase, GraduationCap, Heart, Code2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const skills = {
  frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js"],
  backend: ["Node.js", "NestJS", "Python", "Go"],
  database: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
  devops: ["Docker", "AWS", "Vercel", "GitHub Actions"],
  other: ["Git", "Figma", "Notion", "Tiptap"],
}

const timeline = [
  {
    year: "2024",
    title: "フリーランスエンジニア",
    description: "Webアプリケーション開発を中心に活動中。",
    type: "work",
  },
  {
    year: "2022",
    title: "スタートアップ入社",
    description: "フルスタックエンジニアとしてプロダクト開発に従事。",
    type: "work",
  },
  {
    year: "2020",
    title: "Web開発を始める",
    description: "独学でプログラミングを学習開始。",
    type: "education",
  },
  {
    year: "2018",
    title: "大学卒業",
    description: "情報工学を専攻。",
    type: "education",
  },
]

export const metadata = {
  title: "自己紹介",
  description: "プロフィールと経歴を紹介します。",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-3xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="text-center mb-12">
          {/* Avatar */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
            <span className="text-4xl">👋</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Your Name</h1>
          <p className="text-xl text-muted-foreground mb-4">Web Developer</p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Tokyo, Japan
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              Freelance
            </span>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              自己紹介
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert">
            <p>
              はじめまして。Webアプリケーション開発を専門とするエンジニアです。
            </p>
            <p>
              フロントエンドからバックエンドまで幅広く対応できるフルスタックエンジニアとして、
              使いやすく美しいプロダクトを作ることを目指しています。
            </p>
            <p>
              特に Next.js と Supabase を使ったモダンなWebアプリケーション開発が得意です。
              新しい技術を学ぶことが好きで、常にスキルアップを心がけています。
            </p>
            <p>
              このサイトでは、技術記事や制作物、日々の学びを記録しています。
              お気軽にお声がけください。
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              スキル
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Frontend</h3>
              <div className="flex flex-wrap gap-2">
                {skills.frontend.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Backend</h3>
              <div className="flex flex-wrap gap-2">
                {skills.backend.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Database</h3>
              <div className="flex flex-wrap gap-2">
                {skills.database.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">DevOps & Tools</h3>
              <div className="flex flex-wrap gap-2">
                {[...skills.devops, ...skills.other].map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              経歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className="relative pl-12">
                    {/* Timeline dot */}
                    <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground">{item.year}</span>
                      <h3 className="font-semibold mt-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
