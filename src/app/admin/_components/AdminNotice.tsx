'use client'

import Link from 'next/link'
import type { AdminState } from './use-admin'

export function AdminNotice({ v }: { v: AdminState }) {
  const { status, message } = v
  return (
    <>
      {message && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          {message}
        </div>
      )}

      {!status && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            يتطلب الوصول إلى لوحة الإدارة تفعيل التحقق بخطوتين (MFA) لحساب مالك المكتب أو المدير.
          </p>
          <Link
            href="/settings/security"
            className="inline-flex items-center rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-xs font-bold transition-colors"
          >
            تفعيل التحقق بخطوتين (MFA) الآن
          </Link>
        </div>
      )}
    </>
  )
}
