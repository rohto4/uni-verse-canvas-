import { getInProgressItems } from "@/lib/actions/in-progress"
import InProgressList from "@/components/admin/InProgressList"

export const metadata = {
  title: "進行中のこと | 管理画面",
}

export default async function InProgressPage() {
  const items = await getInProgressItems()

  return (
    <div className="p-6 lg:p-8">
      <InProgressList items={items} />
    </div>
  )
}
