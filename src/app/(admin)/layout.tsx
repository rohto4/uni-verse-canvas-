import { redirect } from 'next/navigation'
import { getUserServer, isAdminByUid } from '@/lib/supabase/auth'
import { AdminClientLayout } from './AdminClientLayout'
import type { ReactNode } from 'react'

// Server component for authentication guard
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getUserServer()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await isAdminByUid(user.id)

  if (!isAdmin) {
    redirect('/')
  }

  return <AdminClientLayout>{children}</AdminClientLayout>
}
