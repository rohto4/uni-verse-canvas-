/**
 * Font Set 1: Quicksand + Noto Sans JP
 *
 * 特徴: 丸みがあって軽やか + 万能な日本語
 * 印象: モダン、親しみやすい
 */
import { Geist_Mono, Noto_Sans_JP, Quicksand } from "next/font/google"

export const fontEn = Quicksand({
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
