import { notFound } from 'next/navigation'
import { getPortalAccess } from '@/lib/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Clock, FileText, Calendar, Download, MessageSquare } from 'lucide-react'
import PortalActions from './portal-actions'

export default async function ClientPortal({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const access = await getPortalAccess(token)
  if (!access) return notFound()
  const caseData = access.case

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-right" dir="rtl">
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">بوابة العميل الآمنة</h1>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">رابط محدود الصلاحية</Badge>
      </header>

      <main className="max-w-5xl w-full mx-auto space-y-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl">{caseData?.title || 'ملف العميل'}</CardTitle>
            <p className="text-muted-foreground mt-1">مرحباً {access.client.name}، تتيح هذه البوابة متابعة الحالة وإرسال الملفات والطلبات إلى المكتب.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg flex items-center gap-3"><Clock className="h-5 w-5 text-amber-500" /><div><p className="text-xs text-muted-foreground">الحالة</p><p className="font-semibold">{caseData?.stage || 'قيد المتابعة'}</p></div></div>
              <div className="bg-muted p-4 rounded-lg flex items-center gap-3"><Calendar className="h-5 w-5 text-blue-500" /><div><p className="text-xs text-muted-foreground">الجلسة القادمة</p><p className="font-semibold">{caseData?.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString('ar-SA') : 'لم تحدد بعد'}</p></div></div>
              <div className="bg-muted p-4 rounded-lg flex items-center gap-3"><FileText className="h-5 w-5 text-purple-500" /><div><p className="text-xs text-muted-foreground">المرجع</p><p className="font-semibold">{caseData?.caseNumber || 'داخلي'}</p></div></div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">تنتهي صلاحية الوصول في {new Date(access.expiresAt).toLocaleDateString('ar-SA')}.</p>
          </CardContent>
        </Card>

        <PortalActions token={token} allowUpload={access.allowUpload} requests={access.requests.filter((request) => request.status === 'open')} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" />طلباتك وحالتها</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {access.requests.map((request) => (
                  <li key={request.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between gap-3"><p className="font-medium">{request.title}</p><Badge>{request.status}</Badge></div>
                    <p className="mt-1 text-sm text-muted-foreground">{request.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleString('ar-SA')}</p>
                  </li>
                ))}
                {!access.requests.length && <p className="text-sm text-muted-foreground">لا توجد طلبات مسجلة بعد.</p>}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Download className="h-5 w-5" />الملفات المرسلة</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {access.files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div><p className="text-sm font-medium">{file.originalName}</p><p className="text-xs text-muted-foreground">{Math.ceil(file.sizeBytes / 1024)}KB • {new Date(file.createdAt).toLocaleDateString('ar-SA')}</p></div>
                    <a className="text-sm text-primary underline" href={`/api/portal/${token}/files/${file.id}`}>تنزيل</a>
                  </li>
                ))}
                {!access.files.length && <p className="text-sm text-muted-foreground">لم يتم رفع ملفات بعد.</p>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
