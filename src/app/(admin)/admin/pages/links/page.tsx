import LinksPageForm from "@/components/admin/LinksPageForm"
import { getPage, upsertPage } from "@/lib/actions/pages"
import { uploadFile } from "@/lib/actions/storage"

type LinkItem = {
  name: string
  url: string
  description: string
  icon: string
}

type LinksMetadata = {
  contactEmail?: string
  socialLinks?: LinkItem[]
  otherLinks?: LinkItem[]
}

export default async function AdminLinksPage() {
  const pageData = await getPage("links")
  const metadata = (pageData?.metadata || {}) as LinksMetadata

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
        <h1 className="text-3xl font-bold">リンクページ</h1>
        <p className="text-muted-foreground">SNSや外部リンクを編集します。</p>
      </div>
      <LinksPageForm
        initialContactEmail={metadata.contactEmail || ""}
        initialSocialLinks={metadata.socialLinks || []}
        initialOtherLinks={metadata.otherLinks || []}
        uploadAction={uploadAction}
        saveAction={saveAction}
      />
    </div>
  )
}
