import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import "@/styles/globals-pattern1-sky-coral.css"
import { fontEn, fontJp, fontMono } from "@/fonts/font-set1-quicksand-noto"

export const metadata: Metadata = {
  title: {
    default: "UniVerse Canvas",
    template: "%s | UniVerse Canvas",
  },
  description: "Your Universe, Your Canvas. 自分だけの宇宙を、自由に描く。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body
        className={`${fontEn.variable} ${fontJp.variable} ${fontMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
