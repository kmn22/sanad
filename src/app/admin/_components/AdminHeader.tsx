'use client'

import Link from 'next/link'
import type { AdminState } from './use-admin'

export function AdminHeader({ v }: { v: AdminState }) {
  const { exporting, handleExportData } = v
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="text-emerald-700 hover:underline font-medium">العودة إلى مساحة العمل</Link>
            <span>/</span>
            <span>لوحة الإدارة</span>
          </div>
          <h1 className="text-3xl font-bold">إدارة سند والامتثال</h1>
          <p className="text-sm text-muted-foreground mt-1">الرقابة الإدارية، طلبات نظام حماية البيانات الشخصية، وسجلات التدقيق.</p>
        </div>
        <button
          onClick={handleExportData}
          disabled={exporting}
          className="rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium transition-colors"
        >
          {exporting ? 'جارٍ التصدير...' : 'تصدير بيانات الامتثال (PDPPL)'}
        </button>
      </div>
    </>
  )
}
