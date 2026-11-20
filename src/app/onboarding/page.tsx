import { MaqarOnboardingWizard } from '@/components/maqar/MaqarOnboardingWizard'

export const metadata = {
  title: 'مقر (MAQAR) — تهيئة المقر الرقمي وتحديد المسار المهني',
  description:
    'تهيئة الحساب وتخصيص بيئة العمليات القانونية وحوكمة الشركات والمحاماة والمختبر الأكاديمي.',
}

export default function MaqarOnboardingPage() {
  return <MaqarOnboardingWizard />
}

