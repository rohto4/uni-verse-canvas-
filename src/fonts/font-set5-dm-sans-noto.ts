/**
 * Font Set 5: DM Sans + Noto Sans JP
 *
 * 特徴: シンプルでクリーンな英語 + 万能な日本語
 * 印象: ミニマル、モダン
 */
import { DM_Sans, Geist_Mono, Noto_Sans_JP } from "next/font/google"

export const fontEn = DM_Sans({
  variable: "--font-sans-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const fontJp = Noto_Sans_JP({
  variable: "--font-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
