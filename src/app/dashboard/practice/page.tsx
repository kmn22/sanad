'use client'

import React from 'react'
import Link from 'next/link'
import {
  MaqarAppShell,
  LitigationPleadingWorkbench,
  VerticalModulePanel,
} from '@/components/maqar'
import { Scale, CalendarClock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PRACTICE_MODULE_HREFS: Record<string, string> = {
  'virtual-rooms': '/lawyer/communications',
  'shared-calendar': '/lawyer/calendar',
  'shared-documents': '/lawyer/documents',
  'shared-messages': '/lawyer/communications',
  'cases-litigations': '/lawyer/cases',
  'hearings-calendar': '/lawyer/calendar',
  'client-invoicing': '/lawyer/invoices',
  'submissions-briefs': '/lawyer/documents',
  'team-allocation': '/firm/assignments',
  'poa-compliance': '/lawyer/compliance',
}

export default function PracticeDashboardPage() {
  return (
    <MaqarAppShell initialRole="LAW_FIRM" lockRole>
      {({ activeModule, activeOrg, lang, selectModuleById }) => {
        const portalHref = PRACTICE_MODULE_HREFS[activeModule.id]
        const showLitigationWorkbench = [
          'virtual-rooms',
          'cases-litigations',
          'hearings-calendar',
          'submissions-briefs',
        ].includes(activeModule.id)

        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                    <Scale className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'مكاتب المحاماة والتقاضي' : 'Law Firm & Litigation'}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {activeOrg.name[lang]}
                  </span>
                </div>
                <h1 className="text-xl font-extrabold text-foreground mt-1.5">
                  {activeModule.label[lang]}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeModule.subtitle[lang]}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 font-semibold">
                  <CalendarClock className="w-4 h-4" />
                  {lang === 'ar'
                    ? 'جلسة المحكمة التجارية بالدمام: خلال 5 أيام'
                    : 'Dammam Commercial Court Hearing: in 5 days'}
                </span>
                {portalHref && (
                  <Link href={portalHref}>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
                      <span>{lang === 'ar' ? 'فتح بوابة الممارسة' : 'Open Practice View'}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {!showLitigationWorkbench && (
              <div className="space-y-4">
                <VerticalModulePanel vertical="LEGAL" />
                <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {lang === 'ar'
                      ? `أنت تستعرض الآن وحدة «${activeModule.label.ar}». يمكنك فتح السجلات التفاعلية الكاملة أو العودة إلى منضدة المرافعات والمواعيد.`
                      : `Viewing "${activeModule.label.en}". Open full practice records or return to the litigation workbench.`}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => selectModuleById('cases-litigations')}
                      className="rounded-xl text-xs cursor-pointer"
                    >
                      {lang === 'ar' ? 'القضايا والمنازعات' : 'Cases & Litigations'}
                    </Button>
                    {portalHref && (
                      <Link href={portalHref}>
                        <Button size="sm" className="rounded-xl text-xs bg-[#1F7A46] hover:bg-[#165832] text-white cursor-pointer">
                          {lang === 'ar' ? 'فتح القسم' : 'Open Section'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showLitigationWorkbench && <LitigationPleadingWorkbench />}
          </div>
        )
      }}
    </MaqarAppShell>
  )
}
