'use client'

import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'
import type { SecuritySettingsState } from './use-security-settings'

export function SecurityHeader({ v }: { v: SecuritySettingsState }) {
  const { privileged, message } = v
  return (
    <>
        {/* Top Breadcrumb & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs text-[#566A5C]">
              <Link href="/dashboard" className="text-[#1F7A46] hover:underline font-bold inline-flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" /> العودة إلى مساحة العمل
              </Link>
              <span>/</span>
              <span>الأمان والخصوصية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#1B281F]">أمان الحساب والخصوصية</h1>
            <p className="text-xs sm:text-sm text-[#4A5D50] mt-1">
              التحقق بخطوتين (MFA)، كلمة المرور، تفضيلات الإشعارات، وحقوق صاحب البيانات وفق نظام (PDPL).
            </p>
          </div>
          {privileged && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#CCD8CE] bg-white px-3.5 py-2 text-xs font-bold text-[#1B281F] hover:border-[#1F7A46] transition-colors"
            >
              <Building2 className="w-4 h-4 text-[#1F7A46]" />
              لوحة الإدارة والامتثال
            </Link>
          )}
        </div>

        {message && (
          <div role="status" className="rounded-xl border border-[#CCD8CE] bg-[#E8EFE9] p-4 text-xs sm:text-sm text-[#1B281F] font-medium">
            {message}
          </div>
        )}

    </>
  )
}
