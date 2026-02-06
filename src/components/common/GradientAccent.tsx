import { cn } from "@/lib/utils"

type AccentPosition = "top" | "bottom" | "left" | "right" | "diagonal-right" | "diagonal-left"
type AccentType = "header" | "footer" | "card" | "section" | "sidebar" | "button"

interface GradientAccentProps {
  /** アクセントの位置 */
  position?: AccentPosition
  /** グラデーションタイプ（CSS変数を選択） */
  type?: AccentType
  /** 太さ（デフォルト: 3px for horizontal, 4px for vertical） */
  thickness?: string
  /** 幅（diagonal用、デフォルト: 20%） */
  width?: string
  /** 斜めの角度（diagonal用、デフォルト: -12deg） */
  skewAngle?: string
  /** 追加のクラス名 */
  className?: string
  /** カスタムグラデーション（CSS変数を上書き） */
  customGradient?: string
}

/**
 * グラデーションアクセントコンポーネント
 *
 * 使用例:
 * - <GradientAccent position="top" type="card" />
 * - <GradientAccent position="diagonal-right" type="header" width="25%" />
 * - <GradientAccent position="left" type="sidebar" thickness="6px" />
 */
export function GradientAccent({
  position = "top",
  type = "card",
  thickness,
  width = "20%",
  skewAngle = "-12deg",
  className,
  customGradient,
}: GradientAccentProps) {
  const gradientVar = customGradient || `var(--${type}-accent-gradient)`

  // 位置に応じたスタイル
  const positionStyles: Record<AccentPosition, React.CSSProperties> = {
    top: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: thickness || "3px",
      background: gradientVar,
    },
    bottom: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: thickness || "3px",
      background: gradientVar,
    },
    left: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: thickness || "4px",
      background: gradientVar,
    },
    right: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      width: thickness || "4px",
      background: gradientVar,
    },
    "diagonal-right": {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: width,
      background: gradientVar,
      transform: `skewX(${skewAngle})`,
      transformOrigin: "top right",
    },
    "diagonal-left": {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: width,
      background: gradientVar,
      transform: `skewX(${skewAngle.startsWith("-") ? skewAngle.slice(1) : `-${skewAngle}`})`,
      transformOrigin: "top left",
    },
  }

  return (
    <div
      className={cn("pointer-events-none", className)}
      style={positionStyles[position]}
      aria-hidden="true"
    />
  )
}
