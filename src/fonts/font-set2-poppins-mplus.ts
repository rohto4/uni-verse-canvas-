/**
 * Font Set 2: Poppins + M PLUS Rounded 1c
 *
 * 特徴: ポップな英語 + 柔らかい丸ゴシック
 * 印象: ふわふわ、カジュアル
 */
import { Geist_Mono, M_PLUS_Rounded_1c, Poppins } from "next/font/google"

export const fontEn = Poppins({
  variable: "--font-sans-en",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const fontJp = M_PLUS_Rounded_1c({
  variable: "--font-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
})

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
