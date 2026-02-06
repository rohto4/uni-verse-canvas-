"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Folder,
  Clock,
  Database,
  Settings,
  Sparkles,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GradientAccent } from "@/components/common"
import { cn } from "@/lib/utils"

const adminNavItems = [
  { label: "ダッシュボード", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "記事管理", href: "/admin/posts", icon: FileText },
  { label: "プロジェクト", href: "/admin/projects", icon: Folder },
  { label: "進行中", href: "/admin/in-progress", icon: Clock },
  { label: "バックアップ", href: "/admin/backup", icon: Database },
]

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 relative overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* グラデーションアクセント（右端） */}
      <GradientAccent position="right" type="sidebar" thickness="3px" />

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>管理画面</span>
          </Link>
        )}
        {collapsed && (
          <Sparkles className="h-5 w-5 text-primary mx-auto" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-2 space-y-1">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "サイトを表示" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>サイトを表示</span>}
        </Link>
      </div>
    </aside>
  )
}
