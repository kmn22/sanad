import type { Metadata } from 'next'
import { SolutionsPersonaView } from './_components/SolutionsPersonaView'

export const metadata: Metadata = {
  title: 'الحلول حسب القطاع — مقر | المقر الرقمي للعمليات القانونية والحوكمة',
  description:
    'حلول مقر المخصصة للشركات والإدارات القانونية (CLM)، ومكاتب المحاماة (إدارة المحاكم والقضايا)، والباحثين وطلاب القانون (بنك السوابق القضائية).',
}

export default function SolutionsIndexPage() {
  return <SolutionsPersonaView activePersona="enterprise" />
}
