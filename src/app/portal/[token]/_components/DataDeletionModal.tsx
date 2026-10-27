'use client'

import {
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function DataDeletionModal({ v }: { v: PortalView }) {
  const { showDeleteModal, setShowDeleteModal, deleteReason, setDeleteReason, deleteSubmitting, handleSubmitDataDeletion } = v
  return (
    <>
      {/* ========================================================
          MODAL: PDPPL DATA DELETION REQUEST
         ======================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm">طلب حذف البيانات الشخصية (PDPPL)</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowDeleteModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              وفقاً لأحكام نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي، يُرسل هذا الطلب رسمياً إلى مسؤول الامتثال في مكتب المحاماة للمراجعة واتخاذ الإجراء النظامي المناسب مع مراعاة السجلات التي يلزم حفظها نظامياً.
            </p>

            <div>
              <label className="text-xs font-bold block mb-1">سبب الطلب (اختياري):</label>
              <textarea
                rows={3}
                placeholder="أدخل ملاحظاتك أو سبب طلب الحذف..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full rounded-xl border border-input bg-transparent p-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                disabled={deleteSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                onClick={handleSubmitDataDeletion}
              >
                {deleteSubmitting ? 'جاري الإرسال...' : 'تأكيد إرسال الطلب للمكتب'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
