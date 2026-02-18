import { exportData, importData } from '@/lib/actions/backup'
import { BackupClient } from '@/components/admin/BackupClient'

export default function BackupPage() {
  async function exportAction() {
    'use server'
    return exportData()
  }

  async function importAction(data: unknown) {
    'use server'
    return importData(data as Parameters<typeof importData>[0])
  }

  return (
    <BackupClient
      exportAction={exportAction}
      importAction={importAction}
    />
  )
}
