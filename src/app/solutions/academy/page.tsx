import type { Metadata } from 'next'
import { SolutionsPersonaView } from '../_components/SolutionsPersonaView'

export const metadata: Metadata = {
  title: 'حلول الأكاديميين وطلاب القانون — مقر',
  description:
    'المقر الرقمي للعمليات القانونية والحوكمة للباحثين وطلاب القانون: بنك السوابق القضائية، محرك البحث الدلالي في الأنظمة السعودية، ومحاكي الصياغة القضائية.',
}

export default function AcademySolutionsPage() {
  return <SolutionsPersonaView activePersona="academy" />
}
