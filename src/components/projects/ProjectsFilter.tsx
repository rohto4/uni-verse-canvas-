'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const currentVisibility = searchParams.get('visibility')
    ?? (searchParams.get('status') === 'registered' ? 'public' : null)

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

  const handleVisibilityClick = (visibility: string | null) => {
    const queryString = createQueryString({
      visibility,
      status: null,
    })
    startTransition(() => {
      router.push(`${pathname}?${queryString}`)
    })
  }

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

  const hasActiveFilters = selectedTags.length > 0 || Boolean(currentVisibility)

  return (
    <div className="mb-8 space-y-5">
      <div className="rounded-2xl border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">公開ステータス</p>
            <p className="text-xs text-muted-foreground">公開/非公開の切り替えはここから行います</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={!currentVisibility ? 'default' : 'outline'}
              className={!currentVisibility ? 'shadow-md shadow-primary/20' : ''}
              onClick={() => handleVisibilityClick(null)}
            >
              すべて
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentVisibility === 'public' ? 'default' : 'outline'}
              className={currentVisibility === 'public' ? 'shadow-md shadow-primary/20' : ''}
              onClick={() => handleVisibilityClick('public')}
            >
              公開
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currentVisibility === 'private' ? 'default' : 'outline'}
              className={currentVisibility === 'private' ? 'shadow-md shadow-primary/20' : ''}
              onClick={() => handleVisibilityClick('private')}
            >
              非公開
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">フィルタ:</span>
          {currentVisibility === 'public' && (
            <Badge
              variant="default"
              className="cursor-pointer"
              onClick={() => handleVisibilityClick(null)}
            >
              公開 ×
            </Badge>
          )}
          {currentVisibility === 'private' && (
            <Badge
              variant="default"
              className="cursor-pointer"
              onClick={() => handleVisibilityClick(null)}
            >
              非公開 ×
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
