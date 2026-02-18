import HomePageForm from "@/components/admin/HomePageForm"
import { getPage, upsertPage } from "@/lib/actions/pages"

type HomeSections = {
  postsTitle: string
  projectsTitle: string
  inProgressTitle: string
}

type HomeMetadata = {
  heroBadge?: string
  heroTitle?: string
  heroSubtitle?: string
  primaryCtaLabel?: string
  primaryCtaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  sections?: HomeSections
}

const defaultMetadata: {
  heroBadge: string
  heroTitle: string
  heroSubtitle: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  sections: HomeSections
} = {
  heroBadge: "Your Universe, Your Canvas",
  heroTitle: "自分だけの宇宙を\n自由に描く",
  heroSubtitle: "技術記事、プロジェクト、日々の学びを記録する場所。\n思考を整理し、成長の軌跡を残していきます。",
  primaryCtaLabel: "読み物を見る",
  primaryCtaHref: "/posts",
  secondaryCtaLabel: "作ったものを見る",
  secondaryCtaHref: "/works",
  sections: {
    postsTitle: "最新の読み物",
    projectsTitle: "最近の作ったもの",
    inProgressTitle: "進行中のこと",
  },
}

export default async function AdminHomePage() {
  const pageData = await getPage("home")
  const metadata = (pageData?.metadata || {}) as HomeMetadata

  async function saveAction(input: Parameters<typeof upsertPage>[0]) {
    "use server"
    const result = await upsertPage(input)
    return result ? { success: true } : { success: false, error: "保存に失敗しました" }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ホームページ</h1>
        <p className="text-muted-foreground">トップページのヒーローと見出しを編集します。</p>
      </div>
      <HomePageForm
        initialHeroBadge={metadata.heroBadge || defaultMetadata.heroBadge}
        initialHeroTitle={metadata.heroTitle || defaultMetadata.heroTitle}
        initialHeroSubtitle={metadata.heroSubtitle || defaultMetadata.heroSubtitle}
        initialPrimaryCtaLabel={metadata.primaryCtaLabel || defaultMetadata.primaryCtaLabel}
        initialPrimaryCtaHref={metadata.primaryCtaHref || defaultMetadata.primaryCtaHref}
        initialSecondaryCtaLabel={metadata.secondaryCtaLabel || defaultMetadata.secondaryCtaLabel}
        initialSecondaryCtaHref={metadata.secondaryCtaHref || defaultMetadata.secondaryCtaHref}
        initialSections={{
          postsTitle: metadata.sections?.postsTitle || defaultMetadata.sections.postsTitle,
          projectsTitle: metadata.sections?.projectsTitle || defaultMetadata.sections.projectsTitle,
          inProgressTitle: metadata.sections?.inProgressTitle || defaultMetadata.sections.inProgressTitle,
        }}
        saveAction={saveAction}
      />
    </div>
  )
}
