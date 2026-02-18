"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Folder,
  Clock,
  Database,
  Sparkles,
  BookOpen,
  Tag,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { signOut } from "@/lib/supabase/auth.client"

const adminNavItems = [
  { label: "ダッシュボード", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "記事管理", href: "/admin/posts", icon: FileText },
  { label: "プロジェクト", href: "/admin/projects", icon: Folder },
  { label: "進行中", href: "/admin/in-progress", icon: Clock },
  { label: "タグ管理", href: "/admin/tags", icon: Tag },
  { label: "固定ページ", href: "/admin/pages", icon: BookOpen },
  { label: "バックアップ", href: "/admin/backup", icon: Database },
]

const fixedPageLinks = [
  { label: "ホーム", href: "/admin/pages/home" },
  { label: "自己紹介", href: "/admin/pages/about" },
  { label: "リンク", href: "/admin/pages/links" },
]

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut()
    }
  }

  return (
    <aside className={cn("h-screen bg-sidebar border-r-0 flex flex-col transition-all duration-300 relative overflow-hidden", collapsed ? "w-16" : "w-64")}>
      {/* ブルーアーカイブ色の区切り線（右端全体） */}
      <div
        className="absolute top-0 bottom-0 right-0 w-1 pointer-events-none z-10"
        style={{
          background: "var(--admin-sidebar-accent-gradient, var(--sidebar-accent-gradient))"
        }}
      />

      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>管理画面</span>
          </Link>
        )}
        {collapsed && <Sparkles className="h-5 w-5 text-primary mx-auto" />}
        <Button variant="ghost" size="icon" onClick={onToggle} className={cn("h-8 w-8", collapsed && "mx-auto")}>
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          const isFixedPages = item.href === "/admin/pages"
          return (
            <div key={item.href} className="space-y-1">
              <Link href={item.href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", collapsed && "justify-center px-2")} title={collapsed ? item.label : undefined}>
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
              {!collapsed && isFixedPages && (
                <div className="ml-9 space-y-1">
                  {fixedPageLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        pathname === link.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ログアウト・サイトを表示（最下部固定） */}
      <div className="mt-auto border-t border-sidebar-border space-y-1 p-2">
        <button 
          onClick={handleSignOut}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors", collapsed && "justify-center px-2")}
          title={collapsed ? "ログアウト" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>ログアウト</span>}
        </button>
        <Link 
          href="/" 
          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors", collapsed && "justify-center px-2")} 
          title={collapsed ? "サイトを表示" : undefined}
        >
          <Sparkles className="h-5 w-5 shrink-0" />
          {!collapsed && <span>サイトを表示</span>}
        </Link>
      </div>
    </aside>
  )
}
