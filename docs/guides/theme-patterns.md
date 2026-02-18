# デザインテーマパターン提案

## 共通方針
- ダークモード廃止（ライトモードのみ）
- パステルオレンジ（黄色寄り）ベース
- ふわふわ感 or ツヤ感 + ソリッド感

---

## Admin Theme Direction: Blue Archive Sky + Pink

**目的**: 管理画面は Blue Archive の空色 + ピンクを主軸に、よりエネルギッシュで軽快な印象へ。

**方針**:
- ライトモード強調（暗い配色は最小限）
- 公開UIと分離するため、`.admin-theme` のスコープ内で管理画面用トークンを上書き
- エネルギー感: 明るいグラデーション、軽い光彩、シャープなアクセントライン

**推奨トークン例（admin限定）**:
```css
.admin-theme {
  --admin-gradient-from: oklch(0.74 0.14 220);
  --admin-gradient-to: oklch(0.80 0.16 350);
  --admin-gradient-via: oklch(0.78 0.12 280);

  --admin-bg: oklch(0.985 0.015 220);
  --admin-fg: oklch(0.24 0.04 230);
  --admin-card: oklch(1 0 0);
  --admin-border: oklch(0.90 0.03 220);

  --admin-primary: oklch(0.66 0.16 225);
  --admin-primary-foreground: oklch(1 0 0);
  --admin-accent: oklch(0.78 0.16 350);
  --admin-accent-foreground: oklch(1 0 0);
}
```

**使い分け**:
- 管理画面の背景、カード、ボタン、サイドバーは `.admin-theme` トークンを使用
- 公開ページは既存 `:root` のテーマを維持

---

## Pattern 1: Soft Cream（ふわふわクリーム）

**コンセプト**: 柔らかいクリーム色ベース、ほんのり影でふわっと浮かぶ感じ

```css
:root {
  --radius: 1rem;

  --background: oklch(0.988 0.012 70);
  --foreground: oklch(0.28 0.03 55);

  --card: oklch(0.998 0.008 70);
  --card-foreground: oklch(0.28 0.03 55);

  --primary: oklch(0.82 0.11 60);
  --primary-foreground: oklch(0.25 0.03 55);

  --secondary: oklch(0.95 0.04 65);
  --secondary-foreground: oklch(0.32 0.03 55);

  --muted: oklch(0.96 0.025 70);
  --muted-foreground: oklch(0.48 0.02 55);

  --accent: oklch(0.90 0.06 160);
  --accent-foreground: oklch(0.25 0.04 160);

  --border: oklch(0.92 0.03 65);
  --input: oklch(0.94 0.02 65);
  --ring: oklch(0.82 0.11 60);
}
```

**特徴的なスタイル**:
```css
/* ふわっと浮かぶカード */
.card {
  box-shadow:
    0 2px 8px oklch(0.82 0.08 60 / 0.08),
    0 8px 24px oklch(0.82 0.08 60 / 0.06);
  border: 1px solid oklch(0.94 0.03 65);
}

/* 柔らかいボタン */
.button-primary {
  background: linear-gradient(135deg, oklch(0.85 0.10 58), oklch(0.80 0.12 62));
  box-shadow: 0 4px 12px oklch(0.82 0.11 60 / 0.25);
}
```

---

## Pattern 2: Glossy Peach（ツヤツヤピーチ）

**コンセプト**: グロッシーな質感、光沢感のあるボタン、くっきりした境界

```css
:root {
  --radius: 0.75rem;

  --background: oklch(0.985 0.015 72);
  --foreground: oklch(0.22 0.035 50);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.035 50);

  --primary: oklch(0.78 0.14 58);
  --primary-foreground: oklch(0.98 0.01 60);

  --secondary: oklch(0.94 0.05 68);
  --secondary-foreground: oklch(0.28 0.04 50);

  --muted: oklch(0.96 0.03 70);
  --muted-foreground: oklch(0.45 0.025 50);

  --accent: oklch(0.88 0.08 170);
  --accent-foreground: oklch(0.22 0.05 170);

  --border: oklch(0.90 0.04 68);
  --input: oklch(0.97 0.015 68);
  --ring: oklch(0.78 0.14 58);
}
```

**特徴的なスタイル**:
```css
/* ツヤのあるカード */
.card {
  background: linear-gradient(180deg, oklch(1 0 0) 0%, oklch(0.995 0.008 70) 100%);
  box-shadow:
    0 1px 0 oklch(1 0 0 / 0.8) inset,
    0 4px 16px oklch(0 0 0 / 0.06);
  border: 1px solid oklch(0.92 0.03 68);
}

/* グロッシーボタン */
.button-primary {
  background: linear-gradient(180deg, oklch(0.82 0.12 58) 0%, oklch(0.75 0.15 58) 100%);
  box-shadow:
    0 1px 0 oklch(0.88 0.08 58 / 0.6) inset,
    0 4px 12px oklch(0.78 0.14 58 / 0.3);
  border: 1px solid oklch(0.72 0.14 58);
}
```

---

## Pattern 3: Matte Apricot（マットアプリコット）

**コンセプト**: マットな質感、フラットだが奥行きあり、落ち着いた印象

```css
:root {
  --radius: 0.625rem;

  --background: oklch(0.975 0.02 68);
  --foreground: oklch(0.25 0.04 45);

  --card: oklch(0.99 0.012 68);
  --card-foreground: oklch(0.25 0.04 45);

  --primary: oklch(0.75 0.13 55);
  --primary-foreground: oklch(0.98 0.01 55);

  --secondary: oklch(0.92 0.045 65);
  --secondary-foreground: oklch(0.30 0.04 45);

  --muted: oklch(0.94 0.03 68);
  --muted-foreground: oklch(0.50 0.025 45);

  --accent: oklch(0.85 0.07 145);
  --accent-foreground: oklch(0.25 0.05 145);

  --border: oklch(0.88 0.035 65);
  --input: oklch(0.95 0.02 68);
  --ring: oklch(0.75 0.13 55);
}
```

**特徴的なスタイル**:
```css
/* マットなカード */
.card {
  background: oklch(0.99 0.012 68);
  box-shadow: 0 2px 4px oklch(0 0 0 / 0.04);
  border: 2px solid oklch(0.90 0.035 65);
}

/* フラットボタン */
.button-primary {
  background: oklch(0.75 0.13 55);
  box-shadow: none;
  border: 2px solid oklch(0.70 0.14 55);
}

.button-primary:hover {
  background: oklch(0.72 0.14 55);
}
```

---

## Pattern 4: Bubble Orange（バブルオレンジ）

**コンセプト**: 泡のようなふわふわ感、大きめの角丸、グラデーション背景

```css
:root {
  --radius: 1.25rem;

  --background: oklch(0.99 0.01 75);
  --foreground: oklch(0.26 0.03 60);

  --card: oklch(1 0 0 / 0.85);
  --card-foreground: oklch(0.26 0.03 60);

  --primary: oklch(0.80 0.12 62);
  --primary-foreground: oklch(0.24 0.03 60);

  --secondary: oklch(0.96 0.04 70);
  --secondary-foreground: oklch(0.30 0.03 60);

  --muted: oklch(0.97 0.02 72);
  --muted-foreground: oklch(0.46 0.02 60);

  --accent: oklch(0.92 0.05 155);
  --accent-foreground: oklch(0.24 0.04 155);

  --border: oklch(0.93 0.03 68);
  --input: oklch(0.96 0.02 70);
  --ring: oklch(0.80 0.12 62);
}
```

**特徴的なスタイル**:
```css
/* 背景グラデーション */
body {
  background: linear-gradient(
    135deg,
    oklch(0.99 0.015 75) 0%,
    oklch(0.97 0.025 65) 50%,
    oklch(0.99 0.01 80) 100%
  );
  background-attachment: fixed;
}

/* バブルカード */
.card {
  background: oklch(1 0 0 / 0.9);
  backdrop-filter: blur(10px);
  box-shadow:
    0 8px 32px oklch(0.80 0.10 62 / 0.1),
    0 2px 8px oklch(0 0 0 / 0.04);
  border: 1px solid oklch(0.95 0.02 68);
}

/* ぷるんとしたボタン */
.button-primary {
  background: linear-gradient(135deg, oklch(0.84 0.10 60), oklch(0.78 0.13 64));
  box-shadow:
    0 6px 20px oklch(0.80 0.12 62 / 0.3),
    0 2px 4px oklch(0 0 0 / 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px oklch(0.80 0.12 62 / 0.35),
    0 4px 8px oklch(0 0 0 / 0.1);
}
```

---

## Pattern 5: Solid Honey（ソリッドハニー）

**コンセプト**: はっきりした色使い、シャープな影、モダンでプロフェッショナル

```css
:root {
  --radius: 0.5rem;

  --background: oklch(0.98 0.018 70);
  --foreground: oklch(0.20 0.04 50);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.20 0.04 50);

  --primary: oklch(0.76 0.15 55);
  --primary-foreground: oklch(1 0 0);

  --secondary: oklch(0.93 0.055 65);
  --secondary-foreground: oklch(0.25 0.04 50);

  --muted: oklch(0.95 0.03 68);
  --muted-foreground: oklch(0.42 0.03 50);

  --accent: oklch(0.82 0.10 175);
  --accent-foreground: oklch(0.20 0.06 175);

  --border: oklch(0.86 0.05 65);
  --input: oklch(0.96 0.02 68);
  --ring: oklch(0.76 0.15 55);
}
```

**特徴的なスタイル**:
```css
/* シャープなカード */
.card {
  background: oklch(1 0 0);
  box-shadow:
    0 1px 3px oklch(0 0 0 / 0.08),
    0 4px 12px oklch(0 0 0 / 0.05);
  border: 1px solid oklch(0.88 0.04 65);
}

/* ソリッドボタン */
.button-primary {
  background: oklch(0.76 0.15 55);
  box-shadow: 0 2px 0 oklch(0.68 0.16 55);
  border: none;
  transform: translateY(0);
  transition: transform 0.1s, box-shadow 0.1s;
}

.button-primary:hover {
  transform: translateY(1px);
  box-shadow: 0 1px 0 oklch(0.68 0.16 55);
}

.button-primary:active {
  transform: translateY(2px);
  box-shadow: none;
}
```

---

## パターン比較表

| パターン | 角丸 | 質感 | 印象 |
|---------|------|------|------|
| 1. Soft Cream | 大 (1rem) | ふわふわ | 優しい、親しみやすい |
| 2. Glossy Peach | 中 (0.75rem) | ツヤツヤ | 洗練、高級感 |
| 3. Matte Apricot | 小 (0.625rem) | マット | 落ち着き、信頼感 |
| 4. Bubble Orange | 特大 (1.25rem) | バブル | 楽しい、ポップ |
| 5. Solid Honey | 極小 (0.5rem) | ソリッド | モダン、プロ |

---

## 適用方法

1. `src/app/globals.css` の `:root { ... }` を置き換え
2. `.dark { ... }` セクションを削除
3. 必要に応じて特徴的なスタイルを追加
