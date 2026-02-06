/**
 * Font Set 4: Nunito + Zen Maru Gothic
 *
 * 特徴: 柔らかい英語 + 上品な丸ゴシック
 * 印象: 温かみ、エレガント
 */
import { Geist_Mono, Nunito, Zen_Maru_Gothic } from "next/font/google"

export const fontEn = Nunito({
  variable: "--font-sans-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const fontJp = Zen_Maru_Gothic({
  variable: "--font-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
