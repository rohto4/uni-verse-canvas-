# フォント設定ガイド

## 推奨フォント一覧

### 日本語フォント

| フォント名 | 特徴 | URL |
|-----------|------|-----|
| **Noto Sans JP** | 万能、読みやすい、Googleデフォルト | `Noto+Sans+JP:wght@400;500;700` |
| **M PLUS Rounded 1c** | 丸ゴシック、柔らかい印象 | `M+PLUS+Rounded+1c:wght@400;500;700` |
| **M PLUS 1p** | モダン、シャープ | `M+PLUS+1p:wght@400;500;700` |
| **Zen Maru Gothic** | 上品な丸ゴシック | `Zen+Maru+Gothic:wght@400;500;700` |
| **Zen Kaku Gothic New** | モダンゴシック | `Zen+Kaku+Gothic+New:wght@400;500;700` |
| **Kosugi Maru** | 親しみやすい丸ゴシック | `Kosugi+Maru` |
| **Sawarabi Gothic** | スッキリしたゴシック | `Sawarabi+Gothic` |
| **Klee One** | 手書き風、温かみ | `Klee+One:wght@400;600` |

### 英語フォント（見出し用）

| フォント名 | 特徴 | URL |
|-----------|------|-----|
| **Inter** | モダン、高可読性 | `Inter:wght@400;500;600;700` |
| **Poppins** | 丸みがあってポップ | `Poppins:wght@400;500;600;700` |
| **Montserrat** | エレガント、洗練 | `Montserrat:wght@400;500;600;700` |
| **DM Sans** | シンプル、クリーン | `DM+Sans:wght@400;500;700` |
| **Nunito** | 柔らかい、親しみやすい | `Nunito:wght@400;500;600;700` |
| **Quicksand** | 丸みがあって軽やか | `Quicksand:wght@400;500;600;700` |

---

## おすすめ組み合わせ

### 1. ふわふわ系
```
見出し: Poppins / Quicksand / Nunito
本文: M PLUS Rounded 1c / Zen Maru Gothic
```

### 2. モダン系
```
見出し: Inter / Montserrat / DM Sans
本文: Noto Sans JP / Zen Kaku Gothic New
```

### 3. 温かみ系
```
見出し: Nunito / Quicksand
本文: Klee One / Kosugi Maru
```

---

## 設定方法

### 変更箇所: `src/app/layout.tsx`

現在の設定:
```tsx
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
```

### 変更例 1: Noto Sans JP + Inter

```tsx
import { Inter, Noto_Sans_JP } from "next/font/google"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

// body の className を変更
<body className={`${inter.variable} ${notoSansJP.variable} font-sans antialiased`}>
```

### 変更例 2: Poppins + M PLUS Rounded 1c

```tsx
import { Poppins, M_PLUS_Rounded_1c } from "next/font/google"

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const mplusRounded = M_PLUS_Rounded_1c({
  variable: "--font-mplus-rounded",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

// body の className を変更
<body className={`${poppins.variable} ${mplusRounded.variable} font-sans antialiased`}>
```

### 変更例 3: Quicksand + Zen Maru Gothic

```tsx
import { Quicksand, Zen_Maru_Gothic } from "next/font/google"

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

<body className={`${quicksand.variable} ${zenMaruGothic.variable} font-sans antialiased`}>
```

---

## CSS でフォントを適用

### 変更箇所: `src/app/globals.css`

```css
@theme inline {
  /* ここを変更 */
  --font-sans: var(--font-noto-sans-jp), var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;

  /* 見出し用フォント（オプション） */
  --font-heading: var(--font-inter), var(--font-noto-sans-jp), sans-serif;
}
```

### 見出しに別フォントを使う場合

```css
@layer base {
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }
}
```

---

## 試すときのチェックリスト

1. `src/app/layout.tsx` の import を変更
2. font 変数を定義
3. `<body>` の className を更新
4. `src/app/globals.css` の `--font-sans` を更新
5. ブラウザで確認

---

## 注意事項

- 日本語フォントはファイルサイズが大きい（数MB）
- `weight` は必要なものだけ指定（軽量化）
- `subsets: ["latin"]` でも日本語は自動的に読み込まれる
- プリロードで初回表示を高速化: `display: "swap"` オプション追加

```tsx
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",  // 追加
})
```
