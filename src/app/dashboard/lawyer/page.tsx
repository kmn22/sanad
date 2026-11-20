import { redirect } from 'next/navigation'

export const metadata = {
  title: 'مقر — لوحة ممارسة المحامي',
  description: 'إدارة ملفات القضايا وصياغة المذكرات وحساب المواعيد النظامية',
}

export default function DashboardLawyerPage() {
  redirect('/lawyer')
}
