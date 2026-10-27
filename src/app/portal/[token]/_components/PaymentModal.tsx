'use client'

import {
  CreditCard,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function PaymentModal({ v }: { v: PortalView }) {
  const { selectedInvoiceForPay, setSelectedInvoiceForPay, paymentMethod, setPaymentMethod } = v
  return (
    <>
      {/* ========================================================
          MODAL: S6 ZATCA INVOICE PAYMENT CHECKOUT
         ======================================================== */}
      {selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">الدفع الإلكتروني غير متاح حالياً</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedInvoiceForPay(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block">رقم الفاتورة:</span>
                  <span className="font-mono font-bold text-sm text-emerald-950 dark:text-emerald-100">{selectedInvoiceForPay.number}</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground block">المبلغ الإجمالي:</span>
                  <span className="font-bold text-base text-emerald-600 font-mono">
                    {selectedInvoiceForPay.total.toLocaleString('ar-SA')} ر.س
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1.5">اختر وسيلة الدفع المصرفية:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled
                    onClick={() => setPaymentMethod('mada')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'mada'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    💳 بطاقة مدى
                  </button>
                  <button
                    type="button"
                    disabled
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'apple_pay'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🍎 Apple Pay
                  </button>
                  <button
                    type="button"
                    disabled
                    onClick={() => setPaymentMethod('sadad')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'sadad'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🏦 نظام سداد
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] space-y-1">
                <p className="font-semibold">⚠️ بوابة الدفع الإلكتروني غير مهيأة في هذه البيئة.</p>
                <p>• يُرجى التنسيق المباشر مع مكتب المحاماة للسداد عبر التحويل المصرفي أو بمقر المكتب.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setSelectedInvoiceForPay(null)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                disabled
                className="bg-emerald-600 text-white font-bold text-xs opacity-50 cursor-not-allowed"
              >
                الدفع الإلكتروني غير متاح
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
