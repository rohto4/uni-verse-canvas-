'use client'

import { useRouter } from "next/navigation"
import type { KeyboardEvent } from "react"
import { ExternalLink, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProjectWithTags } from "@/types/database"

interface AdminProjectCardProps {
  project: ProjectWithTags
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "進行中"
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const statusLabel: Record<ProjectWithTags['status'], { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-accent text-accent-foreground" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
  registered: { label: "Registered", className: "bg-primary/20 text-primary" },
}

export function AdminProjectCard({ project }: AdminProjectCardProps) {
  const router = useRouter()

  const handleNavigate = () => {
    router.push(`/admin/projects/${project.id}`)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleNavigate()
    }
  }

  return (
    <Card
      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={`${project.title}を編集`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <Badge className={statusLabel[project.status].className}>
              {statusLabel[project.status].label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {project.tags.slice(0, 5).map((tag) => (
              <Badge key={tag.id} variant="outline">{tag.name}</Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(project.start_date)} - {formatDate(project.end_date)}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {project.demo_url && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation()
                window.open(project.demo_url!, '_blank', 'noopener,noreferrer')
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={(event) => {
              event.stopPropagation()
              handleNavigate()
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  )
}
