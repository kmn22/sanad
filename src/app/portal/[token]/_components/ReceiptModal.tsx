'use client'

import {
  CheckCircle2,
  Download,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function ReceiptModal({ v }: { v: PortalView }) {
  const { workspace, client, selectedInvoiceForReceipt, setSelectedInvoiceForReceipt } = v
  return (
    <>
      {/* ========================================================
          MODAL: PAID INVOICE OFFICIAL RECEIPT
         ======================================================== */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-sm">إيصال سداد إلكتروني معتمد</span>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedInvoiceForReceipt(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الفاتورة:</span>
                <span className="font-mono font-bold">{selectedInvoiceForReceipt.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المستفيد:</span>
                <span className="font-bold">{workspace?.name || 'مكتب المحاماة'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المسدد:</span>
                <span className="font-bold">{client.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ السداد:</span>
                <span className="font-mono">
                  {selectedInvoiceForReceipt.paidAt ? new Date(selectedInvoiceForReceipt.paidAt).toLocaleDateString('ar-SA') : '28 ديسمبر'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t text-emerald-700 dark:text-emerald-400">
                <span>المبلغ المسدد:</span>
                <span>{selectedInvoiceForReceipt.total.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                onClick={() => {
                  window.print()
                }}
              >
                <Download className="h-3.5 w-3.5" />
                <span>طباعة / حفظ الإيصال PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
