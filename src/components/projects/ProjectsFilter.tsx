'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import type { TagWithCount } from '@/types/database'
import { useCallback, useTransition } from 'react'

interface ProjectsFilterProps {
  tags: TagWithCount[]
}

export function ProjectsFilter({ tags }: ProjectsFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const currentStatus = searchParams.get('status')

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      return params.toString()
    },
    [searchParams]
  )

  const handleStatusClick = (status: string | null) => {
    const queryString = createQueryString({ status });
    startTransition(() => {
      router.push(`${pathname}?${queryString}`);
    });
  };

  const handleTagClick = (tagSlug: string) => {
    let newTags: string[]

    if (selectedTags.includes(tagSlug)) {
      newTags = selectedTags.filter(t => t !== tagSlug)
    } else {
      newTags = [...selectedTags, tagSlug]
    }

    const queryString = createQueryString({
      tags: newTags.length > 0 ? newTags.join(',') : null,
    })

    startTransition(() => {
      router.push(`${pathname}?${queryString}`)
    })
  }

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasActiveFilters = selectedTags.length > 0 || currentStatus

  return (
    <div className="mb-8 space-y-4">
      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <h3 className="text-sm font-semibold mr-2 text-muted-foreground">表示:</h3>
        <Badge
          variant={!currentStatus ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => handleStatusClick(null)}
        >
          すべて
        </Badge>
        <Badge
          variant={currentStatus === 'registered' ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => handleStatusClick('registered')}
        >
          公開済み
        </Badge>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">フィルタ:</span>
          {currentStatus === 'registered' && (
            <Badge
              variant="default"
              className="cursor-pointer"
              onClick={() => handleStatusClick(null)}
            >
              公開済み ×
            </Badge>
          )}
          {selectedTags.map((tagSlug) => {
            const tag = tags.find(t => t.slug === tagSlug)
            return tag ? (
              <Badge
                key={tagSlug}
                variant="default"
                className="cursor-pointer"
                onClick={() => handleTagClick(tagSlug)}
              >
                {tag.name} ×
              </Badge>
            ) : null
          })}
          <button
            onClick={clearAllFilters}
            className="text-xs text-primary hover:underline"
          >
            すべてクリア
          </button>
        </div>
      )}

      {/* Tag Filter */}
      <div className="flex flex-wrap gap-2">
        <h3 className="text-sm font-semibold mr-2 text-muted-foreground">タグ:</h3>
        <Badge
          variant={selectedTags.length === 0 ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => {
            const queryString = createQueryString({ tags: null });
            startTransition(() => {
              router.push(`${pathname}?${queryString}`);
            });
          }}
        >
          すべて
        </Badge>
        {tags
          .filter(tag => tag.projectCount > 0)
          .map((tag) => {
            const isSelected = selectedTags.includes(tag.slug)
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleTagClick(tag.slug)}
              >
                {tag.name}
                <span className="ml-1 text-muted-foreground">
                  ({tag.projectCount})
                </span>
              </Badge>
            )
          })}
      </div>
    </div>
  )
}
