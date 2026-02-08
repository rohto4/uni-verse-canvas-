'use client'

import { useRouter } from "next/navigation"
import { ExternalLink, Github, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ProjectWithTags } from "@/types/database"

interface ProjectCardProps {
  project: ProjectWithTags
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "進行中"
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/works/${project.slug}`)
  }

  return (
    <div onClick={handleCardClick} className="cursor-pointer">
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow" id={project.slug}>
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
          <span className="text-muted-foreground text-sm">プロジェクト画像</span>
        </div>

        <CardHeader className="flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
          </div>
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <CardDescription className="line-clamp-3">
            {project.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 4).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {project.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 4}
              </Badge>
            )}
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {project.demo_url && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(project.demo_url!, '_blank', 'noopener,noreferrer')
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Demo
              </Button>
            )}
            {project.github_url && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(project.github_url!, '_blank', 'noopener,noreferrer')
                }}
              >
                <Github className="h-4 w-4 mr-1" />
                Code
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
