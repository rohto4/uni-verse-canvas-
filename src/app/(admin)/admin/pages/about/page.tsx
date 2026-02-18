import AboutPageForm from "@/components/admin/AboutPageForm"
import { getPage, upsertPage } from "@/lib/actions/pages"
import { uploadFile } from "@/lib/actions/storage"

type Skills = {
  core?: string[]
  infra?: string[]
  ai?: string[]
  method?: string
  workflow?: string[]
}

type TimelineItem = {
  year: string
  title: string
  description: string
}

type AboutMetadata = {
  name?: string
  role?: string
  location?: string
  employment?: string
  skills?: Skills
  timeline?: TimelineItem[]
  avatarUrl?: string
}

function extractIntro(content: unknown): string {
  if (!content || typeof content !== "object") return ""
  const doc = content as { content?: Array<{ content?: Array<{ text?: string }> }> }
  if (!doc.content) return ""
  return doc.content
    .map((node) => node.content?.map((textNode) => textNode.text || "").join("") || "")
    .filter(Boolean)
    .join("\n")
}

export default async function AdminAboutPage() {
  const pageData = await getPage("about")
  const metadata = (pageData?.metadata || {}) as AboutMetadata
  const skills = metadata.skills || {}

  async function uploadAction(formData: FormData) {
    "use server"
    return uploadFile(formData)
  }

  async function saveAction(input: Parameters<typeof upsertPage>[0]) {
    "use server"
    const result = await upsertPage(input)
    return result ? { success: true } : { success: false, error: "保存に失敗しました" }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">自己紹介ページ</h1>
        <p className="text-muted-foreground">公開用の自己紹介と経歴を編集します。</p>
      </div>
      <AboutPageForm
        initialName={metadata.name || ""}
        initialRole={metadata.role || ""}
        initialLocation={metadata.location || ""}
        initialEmployment={metadata.employment || ""}
        initialIntro={extractIntro(pageData?.content)}
        initialSkills={{
          core: skills.core?.join(", ") || "",
          infra: skills.infra?.join(", ") || "",
          ai: skills.ai?.join(", ") || "",
          method: skills.method || "",
          workflow: skills.workflow?.join(", ") || "",
        }}
        initialTimeline={metadata.timeline || []}
        initialAvatarUrl={metadata.avatarUrl || ""}
        uploadAction={uploadAction}
        saveAction={saveAction}
      />
    </div>
  )
}
