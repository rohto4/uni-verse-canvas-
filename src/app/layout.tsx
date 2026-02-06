import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"

// ============================================
// テーマ設定（CSS）
// 使いたいパターンの行だけコメント解除してください
// ============================================
import "@/styles/globals-pattern1-sky-coral.css"           // スカイ＆コーラル（爽やかブルー＋コーラルピンク）
// import "@/styles/globals-pattern2-lavender-dream.css"   // ラベンダードリーム（幻想的パープル＋ピーチ）
// import "@/styles/globals-pattern3-forest-gold.css"      // フォレスト＆ゴールド（深緑＋リッチゴールド）
// import "@/styles/globals-pattern4-sunset-glow.css"      // サンセットグロウ（オレンジ〜ピンクグラデ）
// import "@/styles/globals-pattern5-mono-neon.css"        // モノ＆ネオン（モノクロ＋ネオングリーン）

// ============================================
// フォント設定
// 使いたいパターンの行だけコメント解除してください
// ============================================
import { fontEn, fontJp, fontMono } from "@/fonts/font-set1-quicksand-noto"       // Quicksand + Noto Sans JP
// import { fontEn, fontJp, fontMono } from "@/fonts/font-set2-poppins-mplus"     // Poppins + M PLUS Rounded
// import { fontEn, fontJp, fontMono } from "@/fonts/font-set3-inter-zen"         // Inter + Zen Kaku Gothic
// import { fontEn, fontJp, fontMono } from "@/fonts/font-set4-nunito-zen-maru"   // Nunito + Zen Maru Gothic
// import { fontEn, fontJp, fontMono } from "@/fonts/font-set5-dm-sans-noto"      // DM Sans + Noto Sans JP

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
