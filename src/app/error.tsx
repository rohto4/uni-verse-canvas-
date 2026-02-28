'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky via-universe to-cloud flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-12 w-12" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">エラーが発生しました</h1>
          <p className="text-muted-foreground">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="bg-muted p-4 rounded-lg border border-border text-left">
            <p className="text-xs text-muted-foreground font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Error Report Notice */}
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            このエラーが繰り返し発生する場合は、お問い合わせフォームからご報告いただけます。
          </p>
        </div>

        {/* Decoration */}
        <div className="py-4">
          <div className="flex justify-center gap-2">
            <div className="h-1 w-12 bg-primary/30 rounded-full"></div>
            <div className="h-1 w-12 bg-primary/20 rounded-full"></div>
            <div className="h-1 w-12 bg-primary/10 rounded-full"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            onClick={reset}
            variant="default"
            size="lg"
            className="gap-2 flex-1"
          >
            <RotateCcw className="h-4 w-4" />
            もう一度試す
          </Button>
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 w-full"
            >
              <Home className="h-4 w-4" />
              ホームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
