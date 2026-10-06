'use client'

import { Home } from 'lucide-react'
import { PortalShell, type NavSection } from '@/components/portal/PortalShell'

const sections: NavSection[] = [
  {
    title: { ar: 'بوابة الموكل', en: 'Client portal' },
    items: [{ href: '/client', exact: true, icon: Home, label: { ar: 'ملفي', en: 'My file' } }],
  },
]

export function ClientPortalFrame({ children }: { children: React.ReactNode }) {
  return <PortalShell portal="client" sections={sections}>{children}</PortalShell>
}
