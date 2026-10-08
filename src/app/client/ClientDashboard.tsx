'use client'

import { useState } from 'react'
import { Briefcase, CalendarDays, Download, FileText, MessageSquare, ReceiptText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PortalPageHeader, StatTile } from '@/components/portal/PortalShell'
import type { ClientPortalData } from '@/lib/client-portal'

export function ClientDashboard({ data }: { data: ClientPortalData }) {
  const [opening, setOpening] = useState<string | null>(null)

  async function openWorkspace(caseId: string | null) {
    setOpening(caseId || 'general')
    const response = await fetch('/api/client/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId }),
    })
    const result = await response.json().catch(() => ({}))
    setOpening(null)
    if (response.ok && result.url) window.location.href = result.url
  }

  return (
    <div className="space-y-6" dir="rtl">
      <PortalPageHeader portal="client" title={`مرحباً ${data.client?.name || ''}`} subtitle={`متابعة ملفاتك لدى ${data.firmName}`} actions={<Button onClick={() => openWorkspace(null)} disabled={opening !== null}><MessageSquare className="ms-1 h-4 w-4" />تواصل مع المكتب</Button>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="القضايا النشطة" value={data.stats.activeCases} icon={Briefcase} />
        <StatTile label="الجلسات القادمة" value={data.stats.upcomingHearings} icon={CalendarDays} />
        <StatTile label="الطلبات المفتوحة" value={data.stats.openRequests} icon={MessageSquare} tone={data.stats.openRequests ? 'warn' : 'default'} />
        <StatTile label="المستحقات" value={`${data.stats.outstanding.toLocaleString('ar-SA')} ر.س`} icon={ReceiptText} tone={data.stats.overdueInvoices ? 'bad' : 'default'} />
        <StatTile label="المستندات" value={data.documents.length} icon={FileText} />
      </div>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />قضاياي</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.cases.map((legalCase) => <div key={legalCase.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{legalCase.title}</h3><p className="text-xs text-muted-foreground">{legalCase.caseNumber || legalCase.caseType}</p></div><Badge>{legalCase.stage}</Badge></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground"><span>الجلسة: {legalCase.hearingDate ? new Date(legalCase.hearingDate).toLocaleDateString('ar-SA') : 'لم تحدد'}</span><span>المحامي: {legalCase.lawyers.map((lawyer) => lawyer.name).filter(Boolean).join('، ') || 'فريق المكتب'}</span></div>
              <Button className="mt-3" size="sm" onClick={() => openWorkspace(legalCase.id)} disabled={opening !== null}>{opening === legalCase.id ? 'جاري الفتح...' : 'فتح مساحة القضية'}</Button>
            </div>)}
            {!data.cases.length && <p className="text-sm text-muted-foreground">لا توجد قضايا مرتبطة بحسابك.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />طلبات المكتب</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.requests.map((request) => <div key={request.id} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-3"><strong>{request.title}</strong><Badge variant="outline">{request.status}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{request.message}</p>{request.dueDate && <p className="mt-2 text-xs">مطلوب قبل {new Date(request.dueDate).toLocaleDateString('ar-SA')}</p>}{request.caseId && <Button variant="outline" size="sm" className="mt-3" onClick={() => openWorkspace(request.caseId)}>الرد ورفع الملف</Button>}</div>)}
            {!data.requests.length && <p className="text-sm text-muted-foreground">لا توجد طلبات مفتوحة من المكتب.</p>}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />المستندات المشتركة</CardTitle></CardHeader>
          <CardContent className="space-y-2">{data.documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="text-sm font-medium">{document.title}</p><p className="text-xs text-muted-foreground">{document.docType} — {document.status}</p></div><ShieldCheck className="h-4 w-4 text-emerald-600" /></div>)}{!data.documents.length && <p className="text-sm text-muted-foreground">لا توجد مستندات مشتركة.</p>}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="h-5 w-5" />الفواتير</CardTitle></CardHeader>
          <CardContent className="space-y-2">{data.invoices.map((invoice) => <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="text-sm font-medium">{invoice.number}</p><p className="text-xs text-muted-foreground">{new Date(invoice.issueDate).toLocaleDateString('ar-SA')} — {invoice.status}</p></div><div className="text-left"><p className="font-semibold">{Number(invoice.total).toLocaleString('ar-SA')} ر.س</p>{invoice.paymentUrl && <a href={invoice.paymentUrl} rel="noreferrer" target="_blank" className="text-xs text-primary underline">بوابة الدفع المعتمدة</a>}</div></div>)}{!data.invoices.length && <p className="text-sm text-muted-foreground">لا توجد فواتير مرسلة.</p>}</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />ملفاتي المرفوعة</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">لرفع ملف جديد أو تنزيل ملفاتك السابقة، افتح مساحة القضية أو تواصل مع المكتب عبر الزر أعلاه. عدد الملفات الحالية: {data.files.length}.</p></CardContent>
      </Card>
    </div>
  )
}
