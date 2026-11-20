'use client'

import React from 'react'
import Link from 'next/link'
import {
  MaqarAppShell,
  AcademicResearchLabHub,
} from '@/components/maqar'
import { GraduationCap, Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AcademyDashboardPage() {
  return (
    <MaqarAppShell initialRole="LAW_STUDENT" lockRole>
      {({ activeModule, activeOrg, lang }) => {
        const initialSection =
          activeModule.id === 'drafting-simulator'
            ? 'DRAFTING_SIMULATOR'
            : activeModule.id === 'mentorship-internships'
            ? 'TALENT_DIRECTORY'
            : 'RAG_LAB'

        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'الأكاديمية والباحث القانوني' : 'Legal Academy & Research'}
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  {lang === 'ar'
                    ? 'الاستشهاد النظامي الموثق: مفعل'
                    : 'Strict Statutory Grounding: Active'}
                </span>
                <Link href="/student">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
                    <span>{lang === 'ar' ? 'بوابة المقررات والاستذكار' : 'Courses & Study Portal'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <AcademicResearchLabHub
              key={activeModule.id}
              initialSection={initialSection}
            />
          </div>
        )
      }}
    </MaqarAppShell>
  )
}
