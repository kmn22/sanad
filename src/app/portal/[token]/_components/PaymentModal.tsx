'use client'

import {
  CreditCard,
  MessageSquare,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildWhatsAppShareUrl } from '@/lib/whatsapp'
import type { PortalView } from '../_lib/use-portal-view'

export function PaymentModal({ v }: { v: PortalView }) {
  const {
    selectedInvoiceForPay,
    setSelectedInvoiceForPay,
    paymentMethod,
    setPaymentMethod,
    payingBusy,
    handleConfirmPayment,
    workspace,
    client,
  } = v

  const handleNotifyWhatsApp = () => {
    if (!selectedInvoiceForPay) return
    const officeName = workspace?.name || 'مكتب المحاماة'
    const text = `مرحباً ${officeName}،\nأود إشعاركم بسداد بيان الأتعاب رقم ${selectedInvoiceForPay.number} بقيمة ${selectedInvoiceForPay.total.toLocaleString('ar-SA')} ر.س (${client.name}).`
    window.open(buildWhatsAppShareUrl({ text }), '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* ========================================================
          MODAL: S6 FEE STATEMENT PAYMENT & SETTLEMENT
         ======================================================== */}
      {selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">سداد بيان الأتعاب</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedInvoiceForPay(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block">رقم البيان:</span>
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
                <label className="font-bold block mb-1.5">اختر وسيلة السداد:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
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
                    onClick={() => setPaymentMethod('sadad')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'sadad'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🏦 تحويل بنكي
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] space-y-1.5">
                {paymentMethod === 'sadad' ? (
                  <>
                    <p className="font-semibold">🏦 التحويل البنكي المباشر لحساب المكتب:</p>
                    <p>• بعد إتمام التحويل البنكي برقم البيان ({selectedInvoiceForPay.number})، اضغط على إشعار المكتب ليتم توثيق السداد وإصدار الإيصال.</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">🔒 الدفع الإلكتروني عبر بوابة Moyasar (مدى / Apple Pay):</p>
                    <p>• عند تفعيل البوابة لدى المكتب، سيتم نقلك لصفحة السداد المشفّرة؛ أو يمكنك إشعار المكتب بالتحويل البنكي مباشرة.</p>
                  </>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNotifyWhatsApp}
                className="w-full text-xs h-8 gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>إشعار المكتب بالسداد عبر واتساب</span>
              </Button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setSelectedInvoiceForPay(null)}>
                إغلاق
              </Button>
              <Button
                size="sm"
                disabled={payingBusy}
                onClick={handleConfirmPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
              >
                {payingBusy
                  ? 'جارٍ المعالجة...'
                  : paymentMethod === 'sadad'
                    ? 'إرسال إشعار التحويل للمكتب'
                    : 'متابعة الدفع (مدى / Apple Pay)'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
