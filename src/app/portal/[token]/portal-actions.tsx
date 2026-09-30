'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function PortalActions({ token, allowUpload, requests }: { token: string; allowUpload: boolean; requests: { id: string; title: string }[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [requestId, setRequestId] = useState('')
  const [busy, setBusy] = useState<'message' | 'upload' | null>(null)

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
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <form onSubmit={submitMessage} className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-4">
        <h2 className="font-bold text-lg">طلب أو استفسار للمكتب</h2>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="عنوان الطلب" required maxLength={160} />
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="اكتب تفاصيل الطلب أو الاستفسار" required maxLength={4000} className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        <Button type="submit" disabled={busy === 'message'}>{busy === 'message' ? 'جاري الإرسال...' : 'إرسال الطلب'}</Button>
      </form>

      <div className="rounded-xl border bg-white dark:bg-slate-900 p-5 space-y-4">
        <h2 className="font-bold text-lg">رفع المستندات المطلوبة</h2>
        <p className="text-sm text-muted-foreground">الأنواع المسموحة: PDF وصور ومستندات Office ونصوص، بحد أقصى 10MB.</p>
        {requests.length > 0 && (
          <select value={requestId} onChange={(event) => setRequestId(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">رفع عام</option>
            {requests.map((request) => <option key={request.id} value={request.id}>رد على: {request.title}</option>)}
          </select>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx,.xls,.xlsx" className="w-full text-sm" disabled={!allowUpload} />
        <Button type="button" onClick={uploadFile} disabled={!allowUpload || busy === 'upload'}>{busy === 'upload' ? 'جاري الرفع...' : 'رفع الملف'}</Button>
        {!allowUpload && <p className="text-sm text-amber-600">تم تعطيل الرفع لهذا الرابط.</p>}
      </div>
    </div>
  )
}
