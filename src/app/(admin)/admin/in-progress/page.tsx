import { getInProgressItems, createInProgress, updateInProgress, deleteInProgress } from "@/lib/actions/in-progress"
import { getProjects } from "@/lib/actions/projects"
import InProgressList from "@/components/admin/InProgressList"

export const metadata = {
  title: "進行中のこと | 管理画面",
}

export default async function InProgressPage() {
  const [items, projects] = await Promise.all([
    getInProgressItems(),
    getProjects({ status: ['completed', 'archived', 'registered'], limit: 200 }),
  ])

  const availableProjects = projects.projects.map((project) => ({
    id: project.id,
    title: project.title,
  }))

  async function createAction(input: Parameters<typeof createInProgress>[0]) {
    'use server'
    return createInProgress(input)
  }

  async function updateAction(id: string, input: Parameters<typeof updateInProgress>[1]) {
    'use server'
    return updateInProgress(id, input)
  }

  async function deleteAction(id: string) {
    'use server'
    return deleteInProgress(id)
  }

  return (
    <div className="p-6 lg:p-8">
      <InProgressList
        items={items}
        availableProjects={availableProjects}
        createAction={createAction}
        updateAction={updateAction}
        deleteAction={deleteAction}
      />
    </div>
  )
}
