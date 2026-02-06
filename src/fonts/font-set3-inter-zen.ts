/**
 * Font Set 3: Inter + Zen Kaku Gothic New
 *
 * 特徴: 高可読性の英語 + モダンゴシック
 * 印象: プロフェッショナル、信頼感
 */
import { Geist_Mono, Inter, Zen_Kaku_Gothic_New } from "next/font/google"

export const fontEn = Inter({
  variable: "--font-sans-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const fontJp = Zen_Kaku_Gothic_New({
  variable: "--font-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
