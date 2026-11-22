'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow } from '@/components/ui/table'
import { Plus, FileText, DollarSign, Clock, CheckCircle2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/core/i18n'
import { formatSAR, formatDuration, type Invoice, type Client, type LegalCase, type TimeEntry } from '@/lib/core/types'
import { formatDualHijriGregorian } from '@/lib/dates'
import { STATUS_FILTERS } from './invoices/meta'
import { StatTile } from './invoices/StatTile'
import { InvoiceRow } from './invoices/InvoiceRow'
import { InvoiceCard } from './invoices/InvoiceCard'
import { CreateInvoiceDialog } from './invoices/CreateInvoiceDialog'
import { InvoicePreviewDialog } from './invoices/InvoicePreviewDialog'

interface Props {
  invoices: Invoice[]
  clients: Client[]
  cases: LegalCase[]
  timeEntries: TimeEntry[]
  stats: {
    outstandingInvoices: number
    outstandingSAR: number
    paidThisMonthSAR: number
    uninvoicedSec: number
    uninvoicedSAR: number
  }
  onChange: () => void
}

export function InvoicesView({ invoices, clients, cases, timeEntries, stats, onChange }: Props) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [selectAllOnOpen, setSelectAllOnOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const num = (n: number) => (lang === 'ar' ? n.toLocaleString('ar-EG') : n.toString())

  const sorted = useMemo(
    () =>
      [...invoices].sort(
        (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      ),
    [invoices]
  )

  const filtered = filter === 'all' ? sorted : sorted.filter((i) => i.status === filter)

  const counts: Record<string, number> = { all: sorted.length }
  STATUS_FILTERS.forEach((s) => {
    if (s !== 'all') counts[s] = sorted.filter((i) => i.status === s).length
  })

  const patchStatus = async (inv: Invoice, status: 'sent' | 'paid') => {
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || (lang === 'ar' ? 'فشل تحديث حالة الفاتورة' : 'Failed to update invoice status'))
      }
      toast.success(status === 'paid' ? t('invoices.marked_paid') : t('invoices.marked_sent'))
      onChange()
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'فشل تحديث حالة الفاتورة' : 'Failed to update invoice status'))
    }
  }

  const handleDelete = async (inv: Invoice) => {
    try {
      const res = await fetch(`/api/invoices/${inv.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || (lang === 'ar' ? 'فشل حذف الفاتورة' : 'Failed to delete invoice'))
      }
      toast.success(t('invoices.deleted'))
      onChange()
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'فشل حذف الفاتورة' : 'Failed to delete invoice'))
    }
  }

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error(lang === 'ar' ? 'لا توجد بيانات أتعاب لتصديرها' : 'No fee statements to export')
      return
    }
    const headers = [
      'رقم البيان / Number',
      'الموكل / Client',
      'القضية / Case',
      'تاريخ الإصدار (ميلادي) / Issue Date',
      'تاريخ الإصدار (هجري) / Hijri Date',
      'تاريخ الاستحقاق / Due Date',
      'المبلغ قبل الضريبة (SAR) / Subtotal',
      'ضريبة القيمة المضافة 15% (SAR) / VAT',
      'الإجمالي (SAR) / Total',
      'الحالة / Status',
    ]
    const escapeCell = (val: string | number | null | undefined) => {
      const s = String(val ?? '').replace(/"/g, '""')
      return `"${s}"`
    }
    const rows = filtered.map((inv) => {
      const dualIssue = formatDualHijriGregorian(inv.issueDate, 'ar')
      const dualDue = inv.dueDate ? formatDualHijriGregorian(inv.dueDate, 'ar').combined : '—'
      return [
        inv.number,
        inv.client?.name || '—',
        inv.case?.title || '—',
        dualIssue.gregorian,
        dualIssue.hijri,
        dualDue,
        inv.subtotal.toFixed(2),
        inv.vatAmount.toFixed(2),
        inv.total.toFixed(2),
        inv.status,
      ]
        .map(escapeCell)
        .join(',')
    })
    const csvContent = `\uFEFF${headers.map(escapeCell).join(',')}\n${rows.join('\n')}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `maqar-fee-statements-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(lang === 'ar' ? 'تم تصدير تقرير الأتعاب والتحصيل (CSV / Excel)' : 'Fee statements CSV exported')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('invoices.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('invoices.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? 'تصدير CSV / Excel' : 'Export CSV'}</span>
          </Button>
          <CreateInvoiceDialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v)
            if (!v) setSelectAllOnOpen(false)
          }}
          initialSelectAll={selectAllOnOpen}
          clients={clients}
          cases={cases}
          timeEntries={timeEntries}
          onSaved={() => {
            onChange()
            setOpen(false)
            setSelectAllOnOpen(false)
          }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label={t('invoices.outstanding')}
          value={num(stats.outstandingInvoices)}
          sub={formatSAR(stats.outstandingSAR, lang)}
          tone="amber"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatTile
          label={t('invoices.paid_month')}
          value={formatSAR(stats.paidThisMonthSAR, lang)}
          tone="emerald"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatTile
          label={t('invoices.uninvoiced')}
          value={formatSAR(stats.uninvoicedSAR, lang)}
          sub={formatDuration(stats.uninvoicedSec, lang)}
          tone="rose"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatTile
          label={t('invoices.title')}
          value={num(sorted.length)}
          tone="slate"
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      {/* Uninvoiced hours conversion banner */}
      {stats.uninvoicedSAR > 0 && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-950 dark:text-amber-200">
                {lang === 'ar' ? 'ساعات عمل قانونية جاهزة للفوترة' : 'Unbilled Billable Hours Available'}
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                {lang === 'ar'
                  ? `يوجد ${formatDuration(stats.uninvoicedSec, lang)} بقيمة ${formatSAR(stats.uninvoicedSAR, lang)} يمكن إعدادها كمسودة فاتورة أتعاب.`
                  : `${formatDuration(stats.uninvoicedSec, lang)} totaling ${formatSAR(stats.uninvoicedSAR, lang)} can be prepared as a draft legal-fees invoice.`}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSelectAllOnOpen(true)
              setOpen(true)
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 self-start sm:self-auto gap-1 text-xs"
          >
            <Plus className="mx-1 h-3.5 w-3.5" />
            {lang === 'ar' ? 'إعداد مسودة فاتورة بالساعات' : 'Draft Invoice for Hours'}
          </Button>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s)}
            className="h-7 text-xs"
          >
            {s === 'all'
              ? t('comp.all', { n: counts.all })
              : `${t(`istatus.${s}`)} (${num(counts[s])})`}
          </Button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {t('invoices.empty')}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="ps-4">{t('invoices.number')}</TableHead>
                    <TableHead>{t('invoices.client')}</TableHead>
                    <TableHead>{t('invoices.case')}</TableHead>
                    <TableHead>{t('invoices.issue_date')}</TableHead>
                    <TableHead>{t('invoices.due_date')}</TableHead>
                    <TableHead className="text-end">{t('invoices.total')}</TableHead>
                    <TableHead className="text-end">{t('invoices.balance')}</TableHead>
                    <TableHead className="pe-3 w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inv) => (
                    <InvoiceRow
                      key={inv.id}
                      inv={inv}
                      onPatch={patchStatus}
                      onDelete={handleDelete}
                      onView={(i) => {
                        setActiveInvoice(i)
                        setPreviewOpen(true)
                      }}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile card grid */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((inv) => (
              <InvoiceCard
                key={inv.id}
                inv={inv}
                onPatch={patchStatus}
                onDelete={handleDelete}
                onView={(i) => {
                  setActiveInvoice(i)
                  setPreviewOpen(true)
                }}
              />
            ))}
          </div>
        </>
      )}

      <InvoicePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        inv={activeInvoice}
      />
    </div>
  )
}
