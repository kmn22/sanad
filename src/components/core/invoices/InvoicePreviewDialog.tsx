'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, MessageSquare, Printer, ShieldCheck } from 'lucide-react'
import { useLang } from '@/lib/core/i18n'
import { formatSAR, type Invoice } from '@/lib/core/types'
import { formatDualHijriGregorian } from '@/lib/dates'
import { buildFeeStatementWhatsAppMessage, buildWhatsAppShareUrl } from '@/lib/whatsapp'
import { STATUS_COLORS } from './meta'

export function InvoicePreviewDialog({
  open,
  onOpenChange,
  inv,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  inv: Invoice | null
}) {
  const { lang, t } = useLang()

  if (!inv) return null

  const handlePrint = () => {
    window.print()
  }

  const issueDual = formatDualHijriGregorian(inv.issueDate, lang)
  const dueDual = inv.dueDate ? formatDualHijriGregorian(inv.dueDate, lang) : null

  const handleShareWhatsApp = () => {
    const msg = buildFeeStatementWhatsAppMessage({
      clientName: inv.client?.name || (lang === 'ar' ? 'الموكّل الكريم' : 'Client'),
      invoiceNumber: inv.number,
      totalFormatted: formatSAR(inv.total, lang),
      dueDateLabel: dueDual?.combined || null,
      caseTitle: inv.case?.title || null,
      lang,
    })
    const url = buildWhatsAppShareUrl({ text: msg })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>
              {lang === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice Details'} — {inv.number}
            </span>
          </DialogTitle>
          <div className="flex items-center gap-1.5 ms-auto me-8 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="h-8 gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{lang === 'ar' ? 'مشاركة عبر واتساب' : 'WhatsApp'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1.5 cursor-pointer">
              <Printer className="h-4 w-4" />
              <span>{lang === 'ar' ? 'طباعة' : 'Print'}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Fee Statement Notice */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 print:hidden">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {lang === 'ar' ? 'بيان أتعاب ومطالبة داخلية' : 'Internal fee statement'}
              </span>
              <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px]">
                {lang === 'ar' ? 'غير ضريبية' : 'Non-ZATCA'}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {lang === 'ar'
                ? 'هذا المستند بيان أتعاب داخلي للمتابعة مع الموكّل فقط، ولا يُعد فاتورة ضريبية إلكترونية معتمدة لدى هيئة الزكاة والضريبة والجمارك.'
                : 'This document is an internal fee statement for client follow-up only and is not a ZATCA-cleared tax invoice.'}
            </p>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-6 bg-card border rounded-lg space-y-6 text-sm font-sans relative antialiased print:border-0 print:p-0">
          
          {/* Header section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between items-start border-b pb-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold text-lg">م</div>
                <h3 className="text-lg font-bold text-primary">{lang === 'ar' ? 'بيانات جهة الإصدار' : 'Issuer details'}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'بيانات المنشأة غير مهيأة لهذه الفاتورة' : 'Business details are not configured for this invoice'}</p>
              <p className="text-xs text-muted-foreground">الرياض، المملكة العربية السعودية</p>
            </div>
            <div className="text-start sm:rtl:text-end sm:ltr:text-start">
              <h2 className="text-lg font-bold tracking-tight text-primary">
                {lang === 'ar' ? 'فاتورة أتعاب — مسودة غير معتمدة ضريبياً' : 'Legal fees invoice — draft, not tax-certified'}
              </h2>
              <div className="mt-2 space-y-1 text-xs">
                <p>
                  <span className="text-muted-foreground">{lang === 'ar' ? 'رقم الفاتورة:' : 'Invoice No:'}</span>{' '}
                  <span className="font-mono font-medium">{inv.number}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">{lang === 'ar' ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>{' '}
                  <span>{issueDual.combined}</span>
                </p>
                {dueDual && (
                  <p>
                    <span className="text-muted-foreground">{lang === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'}</span>{' '}
                    <span>{dueDual.combined}</span>
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">{lang === 'ar' ? 'حالة السداد:' : 'Payment Status:'}</span>{' '}
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[inv.status]}`}>
                    {t(`istatus.${inv.status}`)}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-muted/30 p-4 rounded-md border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-semibold">
                {lang === 'ar' ? 'مفوتر إلى:' : 'Bill To:'}
              </p>
              <p className="font-medium text-sm text-foreground">{inv.client?.name || '—'}</p>
              {inv.client?.company && <p className="text-xs text-muted-foreground mt-0.5">{inv.client.company}</p>}
            </div>
            <div className="text-start sm:rtl:text-end sm:ltr:text-start">
              {inv.case && (
                <>
                  <p className="text-xs text-muted-foreground mb-0.5 font-semibold">
                    {lang === 'ar' ? 'الموضوع / القضية:' : 'Subject / Case:'}
                  </p>
                  <p className="text-xs text-foreground truncate">{inv.case.title}</p>
                </>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="ps-4">{lang === 'ar' ? 'الوصف' : 'Description'}</TableHead>
                  <TableHead className="text-center w-24">{lang === 'ar' ? 'الكمية' : 'Qty'}</TableHead>
                  <TableHead className="text-end w-32">{lang === 'ar' ? 'السعر' : 'Unit Price'}</TableHead>
                  <TableHead className="text-end pe-4 w-32">{lang === 'ar' ? 'المجموع' : 'Total'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="ps-4 font-medium py-4">
                    {lang === 'ar'
                      ? 'أتعاب الخدمات الاستشارية والتمثيل القانوني'
                      : 'Consultation Fees and Professional Legal Representation Services'}
                    {inv.case && (
                      <span className="block text-xs font-normal text-muted-foreground mt-1">
                        ({inv.case.title})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center py-4">1</TableCell>
                  <TableCell className="text-end py-4">{formatSAR(inv.subtotal, lang)}</TableCell>
                  <TableCell className="text-end pe-4 py-4 font-semibold">
                    {formatSAR(inv.subtotal, lang)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Totals & QR Code Section */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-6 pt-2">
            
            {/* Non-ZATCA Notice */}
            <div className="flex max-w-xs items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-center">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {lang === 'ar'
                  ? 'بيان أتعاب داخلي غير صادر عبر منصة فاتورة (ZATCA).'
                  : 'Internal fee statement — not issued through ZATCA Fatoora.'}
              </p>
            </div>

            {/* Financial Summary */}
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-medium">{formatSAR(inv.subtotal, lang)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {lang === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}
                </span>
                <span className="font-medium">{formatSAR(inv.vatAmount, lang)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold text-primary">
                <span>{lang === 'ar' ? 'المجموع الإجمالي:' : 'Grand Total:'}</span>
                <span>{formatSAR(inv.total, lang)}</span>
              </div>
              {inv.paidAmount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-emerald-600">
                  <span>{lang === 'ar' ? 'المبلغ المدفوع:' : 'Amount Paid:'}</span>
                  <span>{formatSAR(inv.paidAmount, lang)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms Footer */}
          {inv.notes && (
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground font-semibold mb-1">{lang === 'ar' ? 'ملاحظات:' : 'Notes:'}</p>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{inv.notes}</p>
            </div>
          )}

          <div className="text-center text-[10px] text-muted-foreground border-t pt-4">
            {lang === 'ar'
              ? 'شكراً لتعاملكم معنا. تم إنشاء هذه الفاتورة إلكترونياً.'
              : 'Thank you for your business. This invoice was generated electronically.'}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
