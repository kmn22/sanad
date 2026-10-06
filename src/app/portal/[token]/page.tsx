import { notFound } from 'next/navigation'
import { getPortalAccess } from '@/lib/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download, FileText, MessageSquare, Shield } from 'lucide-react'
import PortalActions from './portal-actions'

export default async function ClientPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const access = await getPortalAccess(token)
  if (!access) return notFound()

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-right dark:bg-slate-950 md:p-8" dir="rtl">
      <header className="mx-auto mb-8 flex w-full max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /><h1 className="text-xl font-bold">بوابة العميل الآمنة</h1></div>
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">وصول محدود وقابل للإلغاء</Badge>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl">{access.case?.title || 'ملف العميل'}</CardTitle>
            <p className="text-muted-foreground">مرحباً {access.client.name}، يمكنك متابعة الحالة وإرسال الملفات والطلبات إلى المكتب.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted p-4"><FileText className="h-5 w-5 text-purple-500" /><div><p className="text-xs text-muted-foreground">الحالة</p><p className="font-semibold">{access.case?.stage || 'قيد المتابعة'}</p></div></div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-4"><Calendar className="h-5 w-5 text-blue-500" /><div><p className="text-xs text-muted-foreground">الجلسة القادمة</p><p className="font-semibold">{access.case?.hearingDate ? new Date(access.case.hearingDate).toLocaleDateString('ar-SA') : 'لم تحدد بعد'}</p></div></div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-4"><Shield className="h-5 w-5 text-emerald-500" /><div><p className="text-xs text-muted-foreground">صلاحية الرابط</p><p className="font-semibold">حتى {new Date(access.expiresAt).toLocaleDateString('ar-SA')}</p></div></div>
            </div>
          </CardContent>
        </Card>

        <PortalActions token={token} allowUpload={access.allowUpload} requests={access.requests.filter((request) => request.status === 'open')} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-5 w-5" />الطلبات وحالتها</CardTitle></CardHeader>
            <CardContent><ul className="space-y-4">{access.requests.map((request) => <li key={request.id} className="border-b pb-3 last:border-0"><div className="flex items-center justify-between gap-3"><p className="font-medium">{request.title}</p><Badge>{request.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{request.message}</p></li>)}{!access.requests.length && <li className="text-sm text-muted-foreground">لا توجد طلبات مسجلة.</li>}</ul></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Download className="h-5 w-5" />الملفات المرسلة</CardTitle></CardHeader>
            <CardContent><ul className="space-y-3">{access.files.map((file) => <li key={file.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"><div><p className="text-sm font-medium">{file.originalName}</p><p className="text-xs text-muted-foreground">{Math.ceil(file.sizeBytes / 1024)}KB</p></div><a className="text-sm text-primary underline" href={`/api/portal/${token}/files/${file.id}`}>تنزيل</a></li>)}{!access.files.length && <li className="text-sm text-muted-foreground">لم يتم رفع ملفات بعد.</li>}</ul></CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
