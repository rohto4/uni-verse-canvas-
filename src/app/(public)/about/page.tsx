import { MapPin, Briefcase, GraduationCap, Heart, Code2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getPage } from "@/lib/actions/pages"
import { JSONContent } from "@tiptap/core"

interface Skills {
  core?: string[];
  infra?: string[];
  ai?: string[];
  method?: string;
  workflow?: string[];
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

interface AboutMetadata {
  name: string;
  role: string;
  location: string;
  employment: string;
  skills: Skills;
  timeline: TimelineItem[];
  avatarUrl?: string;
}


export const metadata = {
  title: "自己紹介",
  description: "プロフィールと経歴を紹介します。",
}

export default async function AboutPage() {
  const pageData = await getPage('about')

  if (!pageData) {
    return <div>ページが見つかりません</div>
  }

  const metadata = pageData.metadata as AboutMetadata
  const skills = metadata.skills || {}
  const timeline = metadata.timeline || []
  const avatarUrl = metadata.avatarUrl || ""
  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-3xl mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={metadata.name || "profile"} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl">👋</span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{metadata.name || 'Your Name'}</h1>
          <p className="text-xl text-muted-foreground mb-4">{metadata.role || 'Web Developer'}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {metadata.location || 'Tokyo, Japan'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {metadata.employment || 'Freelance'}
            </span>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              自己紹介
            </CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert">
            {pageData.content.content?.map((node: JSONContent, index: number) => (
              <p key={index}>
                {node.content?.map((textNode, textIndex: number) => (
                  <span key={textIndex}>{textNode.text}</span>
                ))}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              スキル
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {skills.core && skills.core.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">スキル</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.core.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}
            {skills.infra && skills.infra.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">インフラ/データベース</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.infra.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}
            {skills.ai && skills.ai.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">生成AI</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.ai.map((skill: string) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}
            {skills.method && (
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">開発手法</h3>
                <Badge variant="outline">{skills.method}</Badge>
              </div>
            )}
            {skills.workflow && skills.workflow.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">ワークフロー/ツール</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.workflow.map((skill: string) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              経歴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-8">
                {timeline.map((item: TimelineItem, index: number) => (
                  <div key={index} className="relative pl-12">
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
