import type { Metadata } from 'next'
import { SolutionsPersonaView } from '../_components/SolutionsPersonaView'

export const metadata: Metadata = {
  title: 'حلول مكاتب وشركات المحاماة — مقر',
  description:
    'المقر الرقمي للعمليات القانونية والحوكمة لمكاتب المحاماة: إدارة القضايا والمحاكم، حاسبة المواعيد والمهل النظامية، صياغة اللوائح، وبوابة الموكلين السيادية.',
}

export default function FirmsSolutionsPage() {
  return <SolutionsPersonaView activePersona="firms" />
}
