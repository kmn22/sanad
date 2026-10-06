import type { Metadata } from 'next'
import { FirmPortalFrame } from './FirmPortal'

export const metadata: Metadata = {
  title: 'بوابة المكتب — سند',
  description: 'إدارة مكتب المحاماة: الفريق، توزيع القضايا، الفوترة، الموكّلون والأداء.',
  robots: { index: false, follow: false },
}

export default function FirmLayout({ children }: { children: React.ReactNode }) {
  return <FirmPortalFrame>{children}</FirmPortalFrame>
}
