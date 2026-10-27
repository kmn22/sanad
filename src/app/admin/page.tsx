'use client'

import { useAdmin } from './_components/use-admin'
import { AdminHeader } from './_components/AdminHeader'
import { AdminNotice } from './_components/AdminNotice'
import { AdminStatusSection } from './_components/AdminStatusSection'

export default function AdminPage() {
  const v = useAdmin()

  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <AdminHeader v={v} />
      <AdminNotice v={v} />
      <AdminStatusSection v={v} />
    </main>
  )
}

