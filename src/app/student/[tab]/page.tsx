import { notFound } from 'next/navigation'
import { StudentTabPage } from '../StudentPortal'
import { STUDENT_TABS, type StudentTab } from '../tabs'

export function generateStaticParams() {
  return STUDENT_TABS.map((tab) => ({ tab }))
}

export const dynamicParams = false

export default async function StudentTabRoute({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params
  if (!(STUDENT_TABS as readonly string[]).includes(tab)) notFound()
  return <StudentTabPage tab={tab as StudentTab} />
}
