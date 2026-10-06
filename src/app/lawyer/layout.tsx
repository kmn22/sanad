import type { Metadata } from 'next'
import { LawyerPortalFrame } from './LawyerPortalFrame'

export const metadata: Metadata = {
  title: 'بوابة المحامي — سند',
  description: 'مساحة عمل المحامي اليومية: القضايا، المهام، الصياغة، الفوترة والامتثال.',
  robots: { index: false, follow: false },
}

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  return <LawyerPortalFrame>{children}</LawyerPortalFrame>
}
