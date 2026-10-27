'use client'

import { Download, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SecuritySettingsState } from './use-security-settings'

export function DataPrivacySection({ v }: { v: SecuritySettingsState }) {
  const { privileged, workspaceName, exporting, deleteConfirmName, setDeleteConfirmName, deletePassword, setDeletePassword, deleting, exportWorkspaceData, deleteWorkspace } = v
  return (
    <>
        {/* 4. PDPL Data Export & Workspace Self-Service Erasure */}
        <section className="rounded-2xl border border-[#CCD8CE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                <Download className="w-5 h-5 text-[#1F7A46]" />
                <span>تصدير البيانات وحقوق الخصوصية (PDPL)</span>
              </h2>
              <p className="text-xs text-[#566A5C] mt-0.5">
                احصل على نسخة مقروءة وموقعة رقمياً من بيانات حسابك ومساحة عملك بصيغة JSON.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={exportWorkspaceData}
              disabled={exporting}
              className="border-[#CCD8CE] text-xs font-bold h-9 cursor-pointer"
            >
              {exporting ? 'جارٍ التصدير...' : 'تنزيل نسخة البيانات الكاملة (JSON)'}
            </Button>
          </div>

          {privileged && workspaceName && (
            <div className="mt-4 pt-4 border-t border-rose-500/30 space-y-3">
              <div className="flex items-start gap-2.5 text-rose-800">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">حذف مساحة العمل نهائياً ({workspaceName})</h3>
                  <p className="text-xs text-[#4A5D50] mt-0.5">
                    يمسح هذا الإجراء كافة القضايا والمستندات والفواتير والبيانات المرتبطة بمساحة العمل بشكل غير قابل للتراجع. يتطلب تفعيل MFA وعدم وجود حجز قانوني نشط.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={`اكتب «${workspaceName}» للتأكيد`}
                  className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs"
                />
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="كلمة المرور الحالية"
                  className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting || !deletePassword || deleteConfirmName.trim() !== workspaceName}
                onClick={deleteWorkspace}
                className="text-xs font-bold h-9 cursor-pointer"
              >
                {deleting ? 'جارٍ الحذف...' : 'حذف مساحة العمل نهائياً'}
              </Button>
            </div>
          )}
        </section>
    </>
  )
}
