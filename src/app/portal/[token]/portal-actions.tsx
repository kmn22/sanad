'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Home,
  FileText,
  Receipt,
  MessageSquare,
  CloudUpload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react'

type Tab = 'overview' | 'documents' | 'invoices' | 'messages' | 'uploads'

interface PortalData {
  workspace?: { id: string; name: string }
  client?: { id: string; name: string; type: string; phone: string | null; email: string | null }
  case?: {
    id?: string
    title?: string
    caseType?: string
    stage?: string
    priority?: string
    dueDate?: string
    hearingDate?: string
    caseNumber?: string
    court?: string
    opposingParty?: string
    notes?: string
    invoices?: Array<{
      id: string
      number: string
      status: string
      subtotal: number
      vatAmount: number
      total: number
      paidAmount: number
      paidAt: string | null
      issueDate: string
      dueDate: string | null
    }>
  }
  documents?: Array<{
    id: string
    title: string
    docType: string
    status: string
    parties: string
    signedDate: string | null
    updatedAt: string
    notes?: string | null
  }>
  files?: Array<{
    id: string
    originalName: string
    mimeType: string
    sizeBytes: number
    status: string
    createdAt: string
  }>
  requests?: Array<{
    id: string
    title: string
    message: string
    status: string
    priority: string
    dueDate: string | null
    createdAt: string
  }>
}

export default function PortalActions({ token, allowUpload, requests }: { token: string; allowUpload: boolean; requests: { id: string; title: string }[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [requestId, setRequestId] = useState('')
  const [busy, setBusy] = useState<'message' | 'upload' | 'pay' | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [portalData, setPortalData] = useState<PortalData | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(true)

  const fetchPortal = async () => {
    try {
      const res = await fetch(`/api/portal/${token}`)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to load portal')
      setPortalData(json)
    } catch (e) {
      console.error('Portal data fetch failed', e)
    } finally {
      setLoadingPortal(false)
    }
  }

  useEffect(() => {
    fetchPortal()
  }, [token])

  async function submitMessage(event: React.FormEvent) {
    event.preventDefault()
    setBusy('message')
    const response = await fetch(`/api/portal/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message }),
    })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) return toast.error(data.error || 'تعذر إرسال الطلب')
    setTitle('')
    setMessage('')
    toast.success('تم إرسال الطلب إلى المكتب')
    await fetchPortal()
    router.refresh()
  }

  async function uploadFile() {
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('اختر ملفاً أولاً')
    setBusy('upload')
    const form = new FormData()
    form.set('file', file)
    if (requestId) form.set('requestId', requestId)
    const response = await fetch(`/api/portal/${token}`, { method: 'POST', body: form })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) return toast.error(data.error || 'تعذر رفع الملف')
    if (fileRef.current) fileRef.current.value = ''
    toast.success('تم رفع الملف بأمان')
    await fetchPortal()
    router.refresh()
  }

  async function payInvoice(invoiceId: string) {
    setBusy('pay')
    const response = await fetch(`/api/portal/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pay_invoice', invoiceId, paymentMethod: 'mada' }),
    })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) return toast.error(data.error || 'تعذر إتمام السداد')
    toast.success('تم سداد الفاتورة بنجاح')
    await fetchPortal()
    router.refresh()
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'نظرة عامة', icon: Home },
    { id: 'documents' as Tab, label: 'المستندات', icon: FileText },
    { id: 'invoices' as Tab, label: 'الفواتير', icon: Receipt },
    { id: 'messages' as Tab, label: 'الرسائل', icon: MessageSquare },
    { id: 'uploads' as Tab, label: 'الرفع', icon: CloudUpload },
  ]

  if (loadingPortal) {
    return (
      <div className="rounded-xl border bg-white dark:bg-slate-900 p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>جاري تحميل بوابة الموكل...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">مرحباً {portalData?.client?.name || 'عميلنا العزيز'}</h2>
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 ms-1" /> بوابة آمنة
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {portalData?.workspace?.name ? `مكتب ${portalData.workspace.name}` : 'مكتب المحاماة'}
            </p>
            {portalData?.case && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">القضية</span>
                  <span className="font-medium text-end">{portalData.case.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مرحلة القضية</span>
                  <span className="font-medium">{portalData.case.stage}</span>
                </div>
                {portalData.case.hearingDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الجلسة القادمة</span>
                    <span className="font-medium">{new Date(portalData.case.hearingDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <QuickStat label="مستندات" value={portalData?.documents?.length ?? 0} />
              <QuickStat label="فواتير" value={portalData?.case?.invoices?.length ?? 0} />
              <QuickStat label="طلبات" value={portalData?.requests?.length ?? 0} />
            </div>
          </div>

          <div className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              آخر التحديثات
            </h2>
            {portalData?.requests?.length ? (
              <ul className="space-y-2">
                {portalData.requests.slice(0, 3).map((req) => (
                  <li key={req.id} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="mt-0.5 text-xs">{req.status === 'pending' ? 'قيد المراجعة' : req.status}</Badge>
                    <span className="flex-1">{req.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد طلبات حديثة.</p>
            )}
          </div>
        </div>
      )}

      {/* Documents */}
      {tab === 'documents' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-3">
          <h2 className="font-bold text-lg">مستندات القضية</h2>
          {portalData?.documents?.length ? (
            <ul className="divide-y divide-border">
              {portalData.documents.map((doc) => (
                <li key={doc.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.parties}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{doc.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد مستندات مشتركة بعد.</p>
          )}
        </div>
      )}

      {/* Invoices */}
      {tab === 'invoices' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-3">
          <h2 className="font-bold text-lg">الفواتير</h2>
          {portalData?.case?.invoices?.length ? (
            <ul className="divide-y divide-border">
              {portalData.case.invoices.map((inv) => {
                const isPaid = inv.status === 'paid'
                return (
                  <li key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{inv.number}</p>
                      <p className="text-xs text-muted-foreground">
                        إجمالي: {inv.total.toLocaleString('ar-SA')} ر.س
                      </p>
                    </div>
                    {isPaid ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        مدفوعة
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => payInvoice(inv.id)} disabled={busy === 'pay'}>
                        {busy === 'pay' ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : 'سداد'}
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد فواتير لعرضها.</p>
          )}
        </div>
      )}

      {/* Messages */}
      {tab === 'messages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={submitMessage} className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="font-bold text-lg">طلب أو استفسار للمكتب</h2>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="عنوان الطلب" required maxLength={160} />
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="اكتب تفاصيل الطلب أو الاستفسار" required maxLength={4000} className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm" />
            <Button type="submit" disabled={busy === 'message'}>
              {busy === 'message' ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : 'إرسال الطلب'}
            </Button>
          </form>

          <div className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="font-bold text-lg">سجل الطلبات</h2>
            {portalData?.requests?.length ? (
              <ul className="space-y-2">
                {portalData.requests.map((req) => (
                  <li key={req.id} className="rounded-md border p-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{req.title}</span>
                      <Badge variant="outline" className="text-xs">{req.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد طلبات سابقة.</p>
            )}
          </div>
        </div>
      )}

      {/* Uploads */}
      {tab === 'uploads' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">رفع المستندات المطلوبة</h2>
            <Badge variant="outline" className="text-xs">الأنواع المسموحة: PDF وصور ومستندات Office ونصوص، بحد أقصى 10MB</Badge>
          </div>
          {requests.length > 0 && (
            <select value={requestId} onChange={(event) => setRequestId(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="">رفع عام</option>
              {requests.map((request) => <option key={request.id} value={request.id}>رد على: {request.title}</option>)}
            </select>
          )}
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx,.xls,.xlsx" className="w-full text-sm" disabled={!allowUpload} />
          <Button type="button" onClick={uploadFile} disabled={!allowUpload || busy === 'upload'}>
            {busy === 'upload' ? <Loader2 className="w-4 h-4 animate-spin me-1" /> : 'رفع الملف'}
          </Button>
          {!allowUpload && <p className="text-sm text-amber-600">تم تعطيل الرفع لهذا الرابط.</p>}

          {portalData?.files?.length ? (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">الملفات المرفوعة</p>
              <ul className="space-y-2">
                {portalData.files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{file.originalName}</span>
                    <span className="text-xs text-muted-foreground">{file.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

function QuickStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/30 p-2 text-center">
      <div className="text-sm font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
