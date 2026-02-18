"use client"

import { useState, type ReactNode } from "react"
import { AdminSidebar } from "@/components/layout/AdminSidebar"

export function AdminClientLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <div className="admin-theme h-screen flex overflow-hidden bg-background text-foreground">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
