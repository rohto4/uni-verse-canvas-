"use client"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { GradientAccent } from "./GradientAccent"

type AccentPosition = "top" | "bottom" | "left" | "right"
type AccentType = "header" | "footer" | "card" | "section" | "sidebar" | "button"

interface AccentCardProps extends React.ComponentProps<typeof Card> {
  /** アクセントの位置（デフォルト: top） */
  accentPosition?: AccentPosition
  /** グラデーションタイプ（デフォルト: card） */
  accentType?: AccentType
  /** アクセントの太さ */
  accentThickness?: string
  /** アクセントを表示するか（デフォルト: true） */
  showAccent?: boolean
  /** アクセントの透明度クラス */
  accentOpacity?: string
}

/**
 * グラデーションアクセント付きカードコンポーネント
 *
 * 使用例:
 * <AccentCard accentPosition="top" accentType="card">
 *   <CardHeader>...</CardHeader>
 *   <CardContent>...</CardContent>
 * </AccentCard>
 */
export function AccentCard({
  children,
  className,
  accentPosition = "top",
  accentType = "card",
  accentThickness,
  showAccent = true,
  accentOpacity,
  ...props
}: AccentCardProps) {
  return (
    <Card
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {showAccent && (
        <GradientAccent
          position={accentPosition}
          type={accentType}
          thickness={accentThickness}
          className={accentOpacity}
        />
      )}
      {children}
    </Card>
  )
}
