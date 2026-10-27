'use client'

import {
  Building2,
  Calendar,
  FileText,
  MapPin,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { PortalView } from '../_lib/use-portal-view'

export function SessionsTab({ v }: { v: PortalView }) {
  const { caseData, activeTab, setActiveTab, moreSubScreen, hearingDates } = v
  return (
    <>
      {/* ========================================================
          SCREEN S4: SESSIONS & APPOINTMENTS (الجلسات والمواعيد)
         ======================================================== */}
      {activeTab === 'more' && moreSubScreen === 'sessions' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">الجلسات والمواعيد القضائية</h2>
              <p className="text-xs text-muted-foreground">جدول الجلسات وحالة الحضور والاتجاهات الجغرافية</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab('home')}>
              عودة للرئيسية
            </Button>
          </div>

          {/* Next Session Card with Oversized Date & Time */}
          {caseData?.hearingDate ? (
            <Card className="rounded-2xl border-2 border-emerald-500 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
              <div className="bg-emerald-600 text-white p-4">
                <span className="text-[11px] font-medium text-emerald-100 block">الجلسة القادمة المحددة:</span>
                <div className="text-xl sm:text-2xl font-black mt-1">
                  {hearingDates.gregorian} — 9:00 ص
                </div>
                <div className="text-xs text-emerald-200 mt-0.5 font-mono">
                  الموافق بالهجري: {hearingDates.hijri}
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{caseData.court || 'المحكمة العامة بجدة'} — الدائرة العمالية الرابعة</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{caseData.title}</span>
                  </div>
                </div>

                {/* Explicit Attendance Expectation Line */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  ✓ <strong>لا يُشترط حضورك</strong> — محاميك المعتمد سيمثل المكتب أمام القاضي، وسيتم إبلاغك بنتيجة الجلسة فور انتهائها.
                </div>

                {/* Two Key Actions: ICS Calendar & Google Maps */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                    onClick={() => {
                      const title = `جلسة: ${caseData.title}`
                      const details = `المحكمة: ${caseData.court || 'المحكمة العامة'}\nرقم القضية: ${caseData.caseNumber || 'ملف رقمي'}`
                      const icsData = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(title)}%0ADESCRIPTION:${encodeURIComponent(details)}%0AEND:VEVENT%0AEND:VCALENDAR`
                      window.open(icsData)
                      toast.success('تم تنزيل موعد الجلسة لتقويم جهازك')
                    }}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>أضف إلى التقويم</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 border-slate-300"
                    onClick={() => {
                      window.open(`https://maps.google.com/?q=${encodeURIComponent(caseData.court || 'المحكمة العامة بجدة')}`, '_blank')
                    }}
                  >
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    <span>الموقع والاتجاهات</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground space-y-2">
              <Calendar className="h-8 w-8 mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد جلسات مجدولة حالياً</p>
              <p className="text-xs">سيتم إشعارك فور قيام المحكمة أو المحامي بتحديد موعد الجلسة التالية.</p>
            </Card>
          )}

          {/* Past Sessions Collapse Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-muted-foreground">جلسات سابقة منتهية:</h4>

            <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">3 ديسمبر — جلسة أولى</span>
                <Badge variant="outline" className="text-[9px]">تمت</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                حضرها محاميك · تم إلقاء المرافعة الأولى وتسليم مذكرة الرد على دعوى الخصم.
              </p>
            </div>

            <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">17 نوفمبر — جلسة تأسيسية</span>
                <Badge variant="outline" className="text-[9px]">تمت</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                تم التحقق من الأوراق النظامية والوكالة الإلكترونية وإبلاغك بالموعد.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
