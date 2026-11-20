import type { Metadata } from 'next'
import { SolutionsPersonaView } from '../_components/SolutionsPersonaView'

export const metadata: Metadata = {
  title: 'حلول الشركات والإدارات القانونية (CLM) — مقر',
  description:
    'المقر الرقمي للعمليات القانونية والحوكمة للشركات والمنشآت: إدارة دورة حياة العقود (CLM)، فحص المخاطر التعاقدية الآلي، ومصفوفة الصلاحيات والاعتمادات.',
}

export default function EnterpriseSolutionsPage() {
  return <SolutionsPersonaView activePersona="enterprise" />
}
