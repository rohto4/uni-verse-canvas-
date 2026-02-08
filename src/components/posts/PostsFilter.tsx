'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TagWithCount } from '@/types/database'
import { useCallback, useTransition, useState, useEffect } from 'react'

interface PostsFilterProps {
  tags: TagWithCount[]
}

export function PostsFilter({ tags }: PostsFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const searchQuery = searchParams.get('search') || ''

  const [searchInput, setSearchInput] = useState(searchQuery)

  // Sync search input with URL params
  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

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

      // Reset page when filters change
      if ('tags' in updates || 'search' in updates) {
        params.delete('page')
      }

      return params.toString()
    },
    [searchParams]
  )

  const handleTagClick = (tagSlug: string) => {
    let newTags: string[]

    if (selectedTags.includes(tagSlug)) {
      // Remove tag
      newTags = selectedTags.filter(t => t !== tagSlug)
    } else {
      // Add tag
      newTags = [...selectedTags, tagSlug]
    }

    const queryString = createQueryString({
      tags: newTags.length > 0 ? newTags.join(',') : null,
    })

    startTransition(() => {
      router.push(`${pathname}?${queryString}`)
    })
  }

  const handleSearchSubmit = () => {
    const queryString = createQueryString({
      search: searchInput || null,
    })

    startTransition(() => {
      router.push(`${pathname}?${queryString}`)
    })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchSubmit()
    }
  }

  const clearAllFilters = () => {
    setSearchInput('')
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasActiveFilters = selectedTags.length > 0 || searchQuery !== ''

  return (
    <aside className="lg:w-80">
      <div className="sticky top-24 space-y-4">
        {/* Search Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">記事を検索</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="記事を検索... (Enterで実行)"
                className="pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {hasActiveFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">フィルタ:</span>
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
                {searchQuery && (
                  <Badge variant="default">
                    検索: {searchQuery}
                  </Badge>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-primary hover:underline"
                >
                  すべてクリア
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tag Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">タグで絞り込み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags
                .filter(tag => tag.postCount > 0)
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
                        ({tag.postCount})
                      </span>
                    </Badge>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
