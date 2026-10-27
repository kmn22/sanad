'use client'

import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Banknote, Briefcase, Gavel, LayoutDashboard, Settings, ShieldCheck, Users, UsersRound } from 'lucide-react'
import { NAV_ICONS } from '@/lib/sanad/constants'
import { PortalShell, type NavSection } from '@/components/portal/PortalShell'
import { useFirmDashboard } from '@/components/portal/usePortalData'

export function FirmPortalFrame({ children }: { children: React.ReactNode }) {
  const { data, busy, refetch } = useFirmDashboard()
  const qc = useQueryClient()
  const k = data?.kpis
  const icon = (key: string, fallback: React.ComponentType<{ className?: string }>) => NAV_ICONS[key] || fallback

  const sections: NavSection[] = [
    {
      title: { ar: 'إدارة المكتب', en: 'Firm management' },
      items: [
        { href: '/firm', exact: true, icon: LayoutDashboard, label: { ar: 'لوحة المكتب', en: 'Firm overview' } },
        { href: '/firm/team', icon: UsersRound, label: { ar: 'الفريق والدعوات', en: 'Team & invites' }, badge: k?.pendingInvites ? { text: `${k.pendingInvites}`, tone: 'muted' } : null },
        {
          href: '/firm/assignments',
          icon: Gavel,
          label: { ar: 'توزيع القضايا', en: 'Case assignments' },
          badge: k?.unassignedCases ? { text: `${k.unassignedCases}`, tone: 'amber' } : null,
        },
        { href: '/firm/workflow', icon: Gavel, label: { ar: 'سير العمل والطلبات', en: 'Workflow & requests' }, badge: k?.openPortalRequests ? { text: `${k.openPortalRequests}`, tone: 'amber' } : null },
      ],
    },
    {
      title: { ar: 'الأعمال', en: 'Practice' },
      items: [
        { href: '/firm/cases', icon: icon('cases', Briefcase), label: { ar: 'كل القضايا', en: 'All cases' } },
        { href: '/firm/clients', icon: icon('clients', Users), label: { ar: 'الموكّلون والبوابة', en: 'Clients & portal' } },
        {
          href: '/firm/invoices',
          icon: icon('invoices', Banknote),
          label: { ar: 'الفوترة والتحصيل', en: 'Billing & collections' },
          badge: k?.overdueInvoices ? { text: `${k.overdueInvoices}`, tone: 'rose' } : null,
        },
        { href: '/firm/compliance', icon: icon('compliance', ShieldCheck), label: { ar: 'امتثال المكتب', en: 'Firm compliance' } },
      ],
    },
    {
      title: { ar: 'النظام', en: 'System' },
      items: [{ href: '/firm/settings', icon: Settings, label: { ar: 'الإعدادات والخصوصية', en: 'Settings & privacy' } }],
    },
  ]

  return (
    <PortalShell
      portal="firm"
      sections={sections}
      refreshing={busy}
      onRefresh={() => {
        refetch()
        qc.invalidateQueries({ queryKey: ['dashboard', 'lawyer'] })
      }}
    >
      {children}
    </PortalShell>
  )
}
