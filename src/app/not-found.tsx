import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Compass } from 'lucide-react'

export default function NotFound() {
  const humors = [
    '迷子さん、こんにちは👋',
    'ページが宇宙のどこかへ消えてしまいました...',
    '探してるページはここじゃないみたい 🚀',
    'このURL、存在しないんです...',
    'デジタル迷子の皆さんへ',
  ]
  const humor = humors[Math.floor(Math.random() * humors.length)]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky via-universe to-cloud flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Error Code with Animation */}
        <div className="space-y-3">
          <div className="text-8xl font-bold text-primary/20 animate-pulse">404</div>
          <h2 className="text-3xl font-bold text-foreground">ページが見つかりません</h2>
        </div>

        {/* Humorous Message */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-lg text-foreground italic font-medium">
            「{humor}」
          </p>
        </div>

        {/* Helpful Description */}
        <p className="text-muted-foreground text-base leading-relaxed">
          URLを間違えてしまったか、ページが移動した可能性があります。<br />
          ホームから探し直してみてください。
        </p>

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
          <Link href="/" className="flex-1">
            <Button size="lg" className="gap-2 w-full">
              <Home className="h-4 w-4" />
              ホームに戻る
            </Button>
          </Link>
          <Link href="/posts" className="flex-1">
            <Button size="lg" variant="outline" className="gap-2 w-full">
              <Compass className="h-4 w-4" />
              記事を探す
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
