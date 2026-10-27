'use client'

import {
  CreditCard,
  Download,
  QrCode,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function InvoicesTab({ v }: { v: PortalView }) {
  const { caseData, activeTab, setSelectedInvoiceForPay, setSelectedInvoiceForQr, setSelectedInvoiceForReceipt } = v
  return (
    <>
      {/* ========================================================
          SCREEN S6: ZATCA INVOICES & PAYMENT (الفواتير)
         ======================================================== */}
      {activeTab === 'invoices' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">الفواتير الإلكترونية (ZATCA)</h2>
              <p className="text-xs text-muted-foreground">فواتير ضريبية مبسطة معتمدة ومتوافقة مع هيئة الزكاة والضريبة والجمارك</p>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-600">
              ضريبة 15%
            </Badge>
          </div>

          {/* Invoices List */}
          {(!caseData?.invoices || caseData.invoices.length === 0) ? (
            <Card className="p-8 text-center text-muted-foreground">
              <CreditCard className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm">لا توجد فواتير صادرة لهذا الملف حالياً.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {caseData.invoices.map((inv) => {
                const isPaid = inv.status === 'paid'
                return (
                  <Card key={inv.id} className="rounded-2xl border p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                          فاتورة {inv.number}
                        </span>
                        <Badge className={isPaid ? 'bg-emerald-600 text-white text-[10px]' : 'bg-amber-500 text-white text-[10px]'}>
                          {isPaid ? 'مدفوعة' : 'تستحق خلال 5 أيام'}
                        </Badge>
                      </div>

                      <button
                        onClick={() => setSelectedInvoiceForQr(inv)}
                        className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 cursor-pointer"
                        title="حالة الربط الضريبي ZATCA"
                      >
                        <QrCode className="h-4 w-4" />
                        <span className="text-[10px] hidden sm:inline">حالة ZATCA</span>
                      </button>
                    </div>

                    {/* Amounts */}
                    <div className="space-y-1 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                      <div className="flex justify-between text-muted-foreground">
                        <span>المبلغ الأساسي (قبل الضريبة):</span>
                        <span>{inv.subtotal.toLocaleString('ar-SA')} ر.س</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>ضريبة القيمة المضافة (15%):</span>
                        <span>{inv.vatAmount.toLocaleString('ar-SA')} ر.س</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-1 border-t text-slate-900 dark:text-white">
                        <span>المبلغ الإجمالي (شامل الضريبة):</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {inv.total.toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>
                      {isPaid && (
                        <div className="flex justify-between text-[11px] text-emerald-600 font-medium pt-1">
                          <span>المتبقي:</span>
                          <span>0.00 ر.س (تمت التسوية بالكامل)</span>
                        </div>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground">
                        تاريخ الإصدار: {new Date(inv.issueDate).toLocaleDateString('ar-SA')}
                      </span>

                      <div className="flex items-center gap-2">
                        {isPaid ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 gap-1 border-emerald-300 text-emerald-700"
                            onClick={() => setSelectedInvoiceForReceipt(inv)}
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>الإيصال متاح</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            onClick={() => setSelectedInvoiceForPay(inv)}
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>دفع الآن — مدى / Apple Pay</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Compliance Footnote */}
          <p className="text-[11px] text-muted-foreground text-center pt-2">
            جميع الفواتير صادرة إلكترونياً ومتوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (المرحلة الثانية).
          </p>
        </div>
      )}
    </>
  )
}
