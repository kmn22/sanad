'use client'

import {
  HelpCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function CaseTimelineTab({ v }: { v: PortalView }) {
  const { caseData, activeTab, setActiveTab, unsignedDocs, hearingDates } = v
  return (
    <>
      {/* ========================================================
          SCREEN S3: CASE TIMELINE (قضاياي — التفاصيل)
         ======================================================== */}
      {activeTab === 'cases' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">قضاياي — مسار الإجراءات</h2>
              <p className="text-xs text-muted-foreground">
                تتبع أين وصلت قضيتك باللغة العربية الواضحة والخالية من التعقيد
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-600">
              محدث لحظياً
            </Badge>
          </div>

          {/* Matter Header */}
          <Card className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono">رقم المرجع: {caseData?.caseNumber || 'CASE-2026-SA'}</span>
                <h3 className="text-base font-bold">{caseData?.title || 'قضية عقد العمل — شركة الريف'}</h3>
                <p className="text-xs text-slate-300">
                  {caseData?.court || 'المحكمة العامة بجدة'} • نوع القضية: عمالية
                </p>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px]">قيد المتابعة</Badge>
            </div>
          </Card>

          {/* Vertical Timeline */}
          <Card className="rounded-2xl p-4 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground">الخط الزمني المعتمد للإجراءات:</h4>

            <div className="relative pr-6 space-y-6 before:absolute before:right-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Event 1 (Past - Muted) */}
              <div className="relative">
                <span className="absolute -right-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-950" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">قُدّمت صحيفة الدعوى</span>
                    <span className="text-[10px] text-muted-foreground">12 نوفمبر</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    استلم مكتبك القضية وبدأ الإجراء الرسمي وقيد المعاملة في منصة ناجز.
                  </p>
                </div>
              </div>

              {/* Event 2 (Past - Muted) */}
              <div className="relative">
                <span className="absolute -right-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-950" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">عُقدت الجلسة الأولى</span>
                    <span className="text-[10px] text-muted-foreground">3 ديسمبر</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    حضر محاميك الجلسة وقدم وثيقة قانونية أعدّها لدعم موقفك، وطلب القاضي مهلة للاطلاع.
                  </p>
                </div>
              </div>

              {/* Event 3 (Current - Accent with emerald pulsing dot) */}
              <div className="relative">
                <span className="absolute -right-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 ring-4 ring-emerald-500/20" />
                <div className="space-y-1 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
                      الجلسة القادمة: {hearingDates.gregorian}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[9px]">الجارية</Badge>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    <strong>لا يُشترط حضورك — سنعلمك بما يتم.</strong> يتولى المحامي الترافع وتقديم مذكرات الرد نيابة عنك.
                  </p>
                </div>
              </div>

              {/* Event 4 (Future - Dotted) */}
              <div className="relative opacity-60">
                <span className="absolute -right-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-950" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-muted-foreground">صدور قرار المحكمة الأول واستلام الصك</span>
                  <p className="text-[11px] text-muted-foreground">المرحلة الختامية للتقاضي يعقبها بدء إجراءات تحصيل المبالغ.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Permanent Pinned "What is required from me?" Card */}
          <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-slate-900 shadow-md space-y-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-600" />
              <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
                ما المطلوب مني الآن؟
              </h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {unsignedDocs.length > 0
                ? `مطلوب مراجعة واعتماد مسودة "${unsignedDocs[0].title}" في قسم المستندات قبل تاريخ الجلسة.`
                : 'لا شيء حالياً — راجع المستند المرفق في قسم المستندات إن أمكن، وفريق المكتب يتولى كافة الإجراءات القضائية.'}
            </p>
            {unsignedDocs.length > 0 && (
              <Button size="sm" className="w-full bg-emerald-600 text-white text-xs mt-1" onClick={() => setActiveTab('docs')}>
                الانتقال لمراجعة وتوقيع المستند
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
