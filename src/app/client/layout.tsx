import type { Metadata } from 'next'
import { ClientPortalFrame } from './ClientPortalFrame'

export const metadata: Metadata = {
  title: 'بوابة الموكل — سند',
  description: 'متابعة القضايا والطلبات والملفات والفواتير لدى مكتب المحاماة.',
  robots: { index: false, follow: false },
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <ClientPortalFrame>{children}</ClientPortalFrame>
}
