import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Clock, FileText, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react'

const prisma = new PrismaClient()

export default async function ClientPortal({ params }: { params: { token: string } }) {
  const caseData = await prisma.legalCase.findUnique({
    where: { portalToken: params.token },
    include: {
      client: true,
      timeEntries: { orderBy: { date: 'desc' } },
      communications: { orderBy: { date: 'desc' } },
      invoices: { orderBy: { dueDate: 'desc' } }
    }
  })

  if (!caseData) return notFound()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex flex-col dir-rtl text-right">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">بوابة العميل | مكتب سند للمحاماة</h1>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          اتصال آمن ومشفّر
        </Badge>
      </header>

      <main className="max-w-4xl w-full mx-auto space-y-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-2xl">{caseData.title}</CardTitle>
            <p className="text-muted-foreground mt-1">مرحباً بك {caseData.clientName}، هذه الصفحة مخصصة لمتابعة حالة قضيتك المحدثة في الوقت الفعلي.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground">حالة القضية</p>
                  <p className="font-semibold">{caseData.stage}</p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">تاريخ الجلسة القادمة</p>
                  <p className="font-semibold">{caseData.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString('ar-SA') : 'لم يحدد بعد'}</p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">نوع القضية</p>
                  <p className="font-semibold">{caseData.caseType}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                آخر التحديثات والإجراءات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {caseData.timeEntries.slice(0, 5).map(entry => (
                  <li key={entry.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="text-xs text-muted-foreground mb-1">{new Date(entry.date).toLocaleDateString('ar-SA')}</p>
                    <p className="text-sm font-medium">{entry.description}</p>
                  </li>
                ))}
                {caseData.timeEntries.length === 0 && (
                  <p className="text-sm text-muted-foreground">لا توجد تحديثات مسجلة بعد.</p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                الفواتير المستحقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {caseData.invoices.filter(i => i.status !== 'paid').map(inv => (
                  <li key={inv.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="text-sm font-medium">{inv.number}</p>
                      <p className="text-xs text-muted-foreground">مستحقة في {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ar-SA') : 'غير محدد'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">{inv.total} ر.س</Badge>
                      {inv.paymentUrl && (
                        <Button size="sm" asChild>
                          <a href={inv.paymentUrl} target="_blank" rel="noopener noreferrer">ادفع الآن</a>
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
                {caseData.invoices.filter(i => i.status !== 'paid').length === 0 && (
                  <p className="text-sm text-emerald-600 font-medium">جميع الفواتير مدفوعة بالكامل. شكراً لثقتكم!</p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
