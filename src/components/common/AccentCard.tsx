"use client"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { GradientAccent } from "./GradientAccent"

type AccentPosition = "top" | "bottom" | "left" | "right"
type AccentType = "header" | "footer" | "card" | "section" | "sidebar" | "button"

interface AccentCardProps extends React.ComponentProps<typeof Card> {
  accentPosition?: AccentPosition
  accentType?: AccentType
  accentThickness?: string
  showAccent?: boolean
  accentOpacity?: string
}

export function AccentCard({ children, className, accentPosition = "top", accentType = "card", accentThickness, showAccent = true, accentOpacity, ...props }: AccentCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)} {...props}>
      {showAccent && <GradientAccent position={accentPosition} type={accentType} thickness={accentThickness} className={accentOpacity} />}
      {children}
    </Card>
  )
}
