import { getProjects } from "@/lib/actions/projects"
import { getTagsWithCount } from "@/lib/actions/tags"
import { ProjectsFilter } from "@/components/projects/ProjectsFilter"
import { ProjectCard } from "@/components/projects/ProjectCard"

export const metadata = {
  title: "作ったもの",
  description: "これまでに制作したプロジェクトの一覧です。",
}

interface WorksPageProps {
  searchParams: Promise<{
    tags?: string
  }>
}

export default async function WorksPage({ searchParams }: WorksPageProps) {
  const params = await searchParams
  const tags = params.tags?.split(',').filter(Boolean) || []

  const [projects, allTags] = await Promise.all([
    getProjects({ status: 'completed', tags }),
    getTagsWithCount(),
  ])
  return (
    <div className="min-h-screen bg-universe py-8">
      <div className="cloud-section max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">作ったもの</h1>
          <p className="text-muted-foreground">
            これまでに制作したプロジェクトの一覧です。
          </p>
        </div>

        <ProjectsFilter tags={allTags} />

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">プロジェクトが見つかりませんでした。</p>
            <p className="text-sm text-muted-foreground mt-2">
              フィルタ条件を変更してみてください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
