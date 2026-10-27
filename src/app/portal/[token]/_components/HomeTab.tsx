'use client'

import {
  Calendar,
  ChevronLeft,
  CreditCard,
  MessageSquare,
  PenTool,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function HomeTab({ v }: { v: PortalView }) {
  const { caseData, activeTab, setActiveTab, setMoreSubScreen, unpaidInvoices, unsignedDocs, hearingDates, greeting, firstName } = v
  return (
    <>
      {/* ========================================================
          SCREEN S2: HOME DASHBOARD (الرئيسية)
         ======================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Greeting */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">
                {greeting}، {firstName}
              </h2>
              <p className="text-xs text-muted-foreground">
                إليك ملخص الإجراءات والتحديثات القانونية المباشرة لملفك اليوم
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
              رابط آمن محدود الصلاحية
            </Badge>
          </div>

          {/* Action-First Floating Alert if documents need approval */}
          {unsignedDocs.length > 0 && (
            <div
              onClick={() => setActiveTab('docs')}
              className="cursor-pointer rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                  <PenTool className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                      {unsignedDocs[0].title}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5">
                      ينتظر موافقتك
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                    مستند جاهز للمراجعة والتوقيع الإلكتروني من جوالك بنقرة زر.
                  </p>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-emerald-600 shrink-0" />
            </div>
          )}

          {/* Invoice Badge Card when payment is due */}
          {unpaidInvoices.length > 0 && (
            <div
              onClick={() => setActiveTab('invoices')}
              className="cursor-pointer rounded-2xl border border-amber-300 bg-amber-50/90 dark:bg-amber-950/30 p-4 shadow-xs hover:border-amber-400 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-amber-950 dark:text-amber-100">
                      فاتورة جديدة — {unpaidInvoices[0].total.toLocaleString('ar-SA')} ر.س
                    </span>
                    <Badge variant="outline" className="border-amber-400 text-amber-800 text-[10px]">
                      تستحق خلال 5 أيام
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                    الفاتورة رقم {unpaidInvoices[0].number} • الدفع الإلكتروني غير متاح حالياً
                  </p>
                </div>
              </div>
              <Button size="sm" disabled className="bg-amber-600 text-white text-xs h-8">
                الدفع غير متاح
              </Button>
            </div>
          )}

          {/* Matter Cards (One card per matter with client-friendly title) */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-slate-50/50 dark:bg-slate-900/50 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-600">القضية الحالية</span>
                  <CardTitle className="text-base font-bold">
                    {caseData?.title || 'قضية عقد العمل — شركة الريف'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {caseData?.court || 'المحكمة العامة بجدة'} • الدائرة العمالية الرابعة
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                  قيد الإجراء
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* One-Line Plain Arabic Status Phrase */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">حالة القضية الآن:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  قضيتك مستمرة — لا يوجد مطلوب منك حالياً. محاميك باشر إعداد الدفوع الرسمية للجلسة المقبلة.
                </p>
              </div>

              {/* Next Event Date */}
              {caseData?.hearingDate && (
                <div
                  onClick={() => {
                    setActiveTab('more')
                    setMoreSubScreen('sessions')
                  }}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between cursor-pointer hover:bg-emerald-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="text-[11px] text-muted-foreground block">موعد الجلسة القادمة:</span>
                      <span className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
                        {hearingDates.gregorian} ({hearingDates.hijri})
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-700">
                    لا يُشترط حضورك
                  </Badge>
                </div>
              )}

              {/* Direct quick action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs justify-between"
                  onClick={() => setActiveTab('cases')}
                >
                  <span>تفاصيل الخط الزمني</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs justify-between"
                  onClick={() => {
                    setActiveTab('more')
                    setMoreSubScreen('messages')
                  }}
                >
                  <span>مراسلة المكتب</span>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Second Demo Card (Multiple Matters Support) */}
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm opacity-90">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-xs">قضية عمالية — مطابقة الأجور والبدلات</span>
                <p className="text-[11px] text-muted-foreground">
                  قيد الإجراء — لا يوجد مطلوب منك
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                مكتملة الصياغة
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
