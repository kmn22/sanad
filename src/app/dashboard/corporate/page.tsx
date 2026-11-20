'use client'

import React from 'react'
import Link from 'next/link'
import {
  MaqarAppShell,
  ExecutiveContractDashboard,
  VerticalModulePanel,
} from '@/components/maqar'
import { ShieldCheck, Building2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MODULE_PORTAL_HREFS: Record<string, string> = {
  'virtual-rooms': '/lawyer/communications',
  'shared-calendar': '/lawyer/calendar',
  'shared-documents': '/lawyer/documents',
  'shared-messages': '/lawyer/communications',
  'compliance-radar': '/lawyer/compliance',
  'board-resolutions': '/lawyer/briefs',
  'in-house-tasks': '/lawyer/tasks',
  'external-law-firms': '/lawyer/clients',
  'project-boards': '/lawyer/tasks',
  'client-portals': '/lawyer/clients',
  'service-packages': '/lawyer/invoices',
}

export default function CorporateDashboardPage() {
  return (
    <MaqarAppShell initialRole="ENTERPRISE_CORP" lockRole>
      {({ activeModule, activeOrg, lang, selectModuleById }) => {
        const portalHref = MODULE_PORTAL_HREFS[activeModule.id]
        const showClmPrimary =
          activeModule.id === 'contract-vault' ||
          activeModule.id === 'virtual-rooms' ||
          activeModule.id === 'compliance-radar'

        return (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
                    <Building2 className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'الإدارة القانونية والعقود' : 'Corporate Legal & CLM'}
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
                  <ShieldCheck className="w-4 h-4" />
                  {lang === 'ar' ? 'الامتثال لنظام PDPL: مستوفى' : 'SDAIA PDPL: Compliant'}
                </span>
                {portalHref && (
                  <Link href={portalHref}>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
                      <span>{lang === 'ar' ? 'فتح السجل التفصيلي' : 'Open Full View'}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {activeModule.id === 'compliance-radar' && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {lang === 'ar'
                      ? 'رادار الامتثال التنظيمي — نظام حماية البيانات الشخصية السعودي (PDPL)'
                      : 'Regulatory Compliance Radar — Saudi PDPL'}
                  </h2>
                  <Link href="/lawyer/compliance">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs cursor-pointer">
                      {lang === 'ar' ? 'إدارة سجلات الامتثال' : 'Manage Compliance Records'}
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === 'ar'
                    ? 'جميع سجلات معالجة البيانات الشخصية واتفاقيات عدم الإفصاح ومراكز الاستضافة السحابية مفحوصة ومطابقة لضوابط سدايا (SDAIA).'
                    : 'All data processing records, NDAs, and cloud hosting agreements are audited against SDAIA controls.'}
                </p>
              </div>
            )}

            {!showClmPrimary && (
              <div className="space-y-4">
                <VerticalModulePanel vertical="GENERAL" />
                <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {lang === 'ar'
                      ? `أنت تستعرض الآن وحدة «${activeModule.label.ar}». يمكنك إدارة البيانات الحية عبر البوابة التخصصية أو العودة إلى خزينة العقود.`
                      : `Viewing "${activeModule.label.en}". Open the full operational view or jump back to Contract Vault.`}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => selectModuleById('contract-vault')}
                      className="rounded-xl text-xs cursor-pointer"
                    >
                      {lang === 'ar' ? 'خزينة العقود (CLM)' : 'Contract Vault'}
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

            {showClmPrimary && <ExecutiveContractDashboard />}
          </div>
        )
      }}
    </MaqarAppShell>
  )
}
