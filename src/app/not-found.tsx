import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky via-universe to-cloud flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Error Code */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary/20">404</h1>
          <h2 className="text-3xl font-bold text-foreground">ページが見つかりません</h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-lg">
          申し訳ございません。お探しのページは存在しないか、移動された可能性があります。
        </p>

        {/* Decoration */}
        <div className="py-4">
          <div className="flex justify-center gap-2">
            <div className="h-1 w-12 bg-primary/30 rounded-full"></div>
            <div className="h-1 w-12 bg-primary/20 rounded-full"></div>
            <div className="h-1 w-12 bg-primary/10 rounded-full"></div>
          </div>
        </div>

        {/* Action Button */}
        <Link href="/">
          <Button size="lg" className="gap-2 w-full">
            <Home className="h-4 w-4" />
            ホームに戻る
          </Button>
        </Link>
      </div>
    </div>
  )
}
