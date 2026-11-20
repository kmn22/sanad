import type { Metadata } from 'next'
import { StudentPortalFrame } from './StudentPortal'

export const metadata: Metadata = {
  title: 'المقر الأكاديمي — مقر',
  description: 'بوابة طالب القانون: المقررات، المواعيد، بنك المصطلحات، دفتر القضايا والمراجعة الذكية.',
  robots: { index: false, follow: false },
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentPortalFrame>{children}</StudentPortalFrame>
}
