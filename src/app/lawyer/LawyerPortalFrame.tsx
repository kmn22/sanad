'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { CalendarDays, Gavel, MessagesSquare, Network } from 'lucide-react'
import { NAV_ICONS } from '@/lib/sanad/constants'
import { PortalShell, type NavSection } from '@/components/portal/PortalShell'
import { useLawyerDashboard } from '@/components/portal/usePortalData'
import { lawyerHref } from './sections'

const CommandPalette = dynamic(() => import('@/components/sanad/CommandPalette').then((m) => m.CommandPalette))

const icon = (key: string, fallback: React.ComponentType<{ className?: string }>) => NAV_ICONS[key] || fallback

export function LawyerPortalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data, busy, refetch } = useLawyerDashboard()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const stats = data?.stats

  const sections: NavSection[] = [
    {
      title: { ar: 'العمليات والتركيز', en: 'Operations & focus' },
      items: [
        { href: '/lawyer', exact: true, icon: icon('today', CalendarDays), label: { ar: 'اليوم', en: 'Today' } },
        { href: '/lawyer/overview', icon: icon('dashboard', CalendarDays), label: { ar: 'لوحة الأداء', en: 'Overview' } },
        { href: '/lawyer/deepwork', icon: icon('deepwork', CalendarDays), label: { ar: 'العمل العميق', en: 'Deep work' } },
        { href: '/lawyer/calendar', icon: icon('calendar', CalendarDays), label: { ar: 'التقويم', en: 'Calendar' } },
      ],
    },
    {
      title: { ar: 'العمل القانوني', en: 'Legal practice' },
      items: [
        {
          href: '/lawyer/cases',
          icon: icon('cases', CalendarDays),
          label: { ar: 'القضايا', en: 'Cases' },
          badge: stats && stats.urgentCases > 0 ? { text: `${stats.urgentCases}`, tone: 'rose' } : null,
        },
        {
          href: '/lawyer/tasks',
          icon: icon('tasks', CalendarDays),
          label: { ar: 'المهام', en: 'Tasks' },
          badge: stats && stats.overdueTasks > 0 ? { text: `${stats.overdueTasks}`, tone: 'amber' } : stats && stats.openTasks > 0 ? { text: `${stats.openTasks}` } : null,
        },
        { href: '/lawyer/documents', icon: icon('documents', CalendarDays), label: { ar: 'المستندات والصياغة', en: 'Documents & drafting' }, badge: { text: 'AI' } },
        { href: '/lawyer/research', icon: icon('research', CalendarDays), label: { ar: 'مركز الأبحاث', en: 'Research hub' } },
        { href: '/lawyer/briefs', icon: icon('briefs', CalendarDays), label: { ar: 'النشرة اليومية', en: 'Daily brief' } },
        { href: '/lawyer/clients', icon: icon('clients', CalendarDays), label: { ar: 'الموكّلون', en: 'Clients' } },
        { href: '/lawyer/communications', icon: icon('communications', MessagesSquare), label: { ar: 'التواصل', en: 'Communications' } },
        { href: '/lawyer/workflow', icon: Gavel, label: { ar: 'سير العمل والطلبات', en: 'Workflow & requests' } },
      ],
    },
    {
      title: { ar: 'المالية والأدوات', en: 'Finance & tools' },
      items: [
        { href: '/lawyer/invoices', icon: icon('invoices', CalendarDays), label: { ar: 'الفواتير', en: 'Invoices' } },
        {
          href: '/lawyer/compliance',
          icon: icon('compliance', CalendarDays),
          label: { ar: 'الامتثال', en: 'Compliance' },
          badge: stats && stats.expiringCompliance > 0 ? { text: `${stats.expiringCompliance}`, tone: 'amber' } : null,
        },
        { href: '/lawyer/scanner', icon: icon('scanner', CalendarDays), label: { ar: 'الماسح الذكي', en: 'Smart scanner' } },
        { href: '/lawyer/ecosystem', icon: Network, label: { ar: 'خريطة الربط', en: 'Ecosystem map' } },
      ],
    },
  ]

  return (
    <PortalShell
      portal="lawyer"
      sections={sections}
      onRefresh={() => refetch()}
      refreshing={busy}
      onSearch={() => setPaletteOpen(true)}
    >
      {children}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNavigate={(v) => {
          setPaletteOpen(false)
          router.push(lawyerHref(v))
        }}
        onCreate={() => {}}
      />
    </PortalShell>
  )
}
