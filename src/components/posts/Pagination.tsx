'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransition } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function Pagination({ currentPage, totalPages, hasNext, hasPrev }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `${pathname}?${params.toString()}`
  }

  const handlePageChange = (page: number) => {
    startTransition(() => {
      router.push(createPageUrl(page))
    })
  }

  // Don't show pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={!hasPrev || isPending}
      >
        <ChevronLeft className="h-4 w-4" />
        前へ
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 py-1">
              ...
            </span>
          )
        }

        const pageNum = page as number
        const isActive = pageNum === currentPage

        return (
          <Button
            key={pageNum}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNum)}
            disabled={isPending}
            className={isActive ? "pointer-events-none" : ""}
          >
            {pageNum}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={!hasNext || isPending}
      >
        次へ
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
