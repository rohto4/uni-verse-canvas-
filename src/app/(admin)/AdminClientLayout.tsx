"use client"

import { useState, type ReactNode } from "react"
import { AdminSidebar } from "@/components/layout/AdminSidebar"

export function AdminClientLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <div className="h-screen flex overflow-hidden">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
