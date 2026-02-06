import Link from "next/link"
import { Sparkles, Github, Twitter, Mail } from "lucide-react"
import { GradientAccent } from "@/components/common"

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30 relative">
      {/* 上部のグラデーションライン */}
      <GradientAccent position="top" type="section" thickness="2px" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>UniVerse Canvas</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your Universe, Your Canvas.<br />
              自分だけの宇宙を、自由に描く。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">ナビゲーション</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/posts" className="hover:text-primary transition-colors">読み物</Link></li>
              <li><Link href="/works" className="hover:text-primary transition-colors">作ったもの</Link></li>
              <li><Link href="/progress" className="hover:text-primary transition-colors">進行中のこと</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">自己紹介</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">リンク</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:example@example.com"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} UniVerse Canvas. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
