'use client'

import { useState } from 'react'
import { Twitter, Facebook, Link as LinkIcon, Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('リンクをコピーしました')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank')
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
        <Share2 className="h-4 w-4" />
        シェア
      </span>
      
      <TooltipProvider>
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={shareOnTwitter} className="rounded-full hover:text-[#1DA1F2] hover:border-[#1DA1F2]">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitterでシェア</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Twitterでシェア</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={shareOnFacebook} className="rounded-full hover:text-[#4267B2] hover:border-[#4267B2]">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebookでシェア</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Facebookでシェア</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={handleCopyLink} className="rounded-full">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                <span className="sr-only">リンクをコピー</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>リンクをコピー</TooltipContent>
          </Tooltip>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleNativeShare} className="rounded-full md:hidden">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">その他の方法でシェア</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>その他の方法でシェア</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}
