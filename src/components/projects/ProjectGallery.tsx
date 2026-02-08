'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'

interface ProjectGalleryProps {
  images: string[]
  alt: string
}

export function ProjectGallery({ images, alt }: ProjectGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  // スクロール位置を監視してインジケーターを更新
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      // スクロール完了を待つ（snap完了後に実行）
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        // 各画像の位置を確認して、最も中央に近いものを見つける
        let closestIndex = 0
        let minDistance = Infinity

        imageRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect()
            const containerRect = scrollElement.getBoundingClientRect()
            // 画像の中央とコンテナの中央の距離
            const imageCenter = rect.left + rect.width / 2
            const containerCenter = containerRect.left + containerRect.width / 2
            const distance = Math.abs(imageCenter - containerCenter)

            if (distance < minDistance) {
              minDistance = distance
              closestIndex = index
            }
          }
        })

        setCurrentIndex(closestIndex)
      }, 100) // スクロール終了後100ms待つ
    }

    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
    // 初期状態を設定
    handleScroll()

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [images.length])

  if (images.length === 0) {
    return null
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  return (
    <>
      <div className="relative group">
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={scrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={scrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              ref={(el) => { imageRefs.current[index] = el }}
              className="flex-shrink-0 w-full md:w-[600px] snap-center cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => openLightbox(index)}
            >
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`${alt} - Screenshot ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
                }`}
                onClick={() => {
                  setCurrentIndex(index)
                  if (scrollRef.current) {
                    const element = scrollRef.current.children[index] as HTMLElement
                    element.scrollIntoView({ behavior: 'smooth', inline: 'center' })
                  }
                }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-screen-lg p-0 bg-black/95">
          <VisuallyHidden>
            <DialogTitle>{alt} - 画像ギャラリー</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            <div className="relative w-full h-[80vh]">
              <Image
                src={images[currentIndex]}
                alt={`${alt} - Screenshot ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
