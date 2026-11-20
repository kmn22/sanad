'use client'

import {
  AlertTriangle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function ZatcaStatusModal({ v }: { v: PortalView }) {
  const { selectedInvoiceForQr, setSelectedInvoiceForQr } = v
  return (
    <>
      {/* ========================================================
          MODAL: ZATCA COMPLIANCE STATUS VIEW
         ======================================================== */}
      {selectedInvoiceForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm">طبيعة بيان الأتعاب الداخلي</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedInvoiceForQr(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 inline-block shadow-inner w-full">
              <div className="flex flex-col items-center justify-center p-3 text-center gap-2">
                <AlertTriangle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">بيان أتعاب ومطالبة داخلية</span>
                <span className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-tight">هذا المستند لتوضيح الأتعاب والمواعيد فقط، وليس فاتورة ضريبية إلكترونية رسمية</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">مرجع البيان: {selectedInvoiceForQr.number}</p>
              <p className="text-muted-foreground text-[11px]">
                للحصول على الفاتورة الضريبية المعتمدة (متى ما كانت مطلوبة)، يُرجى التواصل مباشرة مع مكتب المحاماة.
              </p>
            </div>

            <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs" onClick={() => setSelectedInvoiceForQr(null)}>
              إغلاق
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
