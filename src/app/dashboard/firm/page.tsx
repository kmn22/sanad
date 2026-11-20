import { redirect } from 'next/navigation'

export const metadata = {
  title: 'مقر — لوحة مكاتب المحاماة والتقاضي',
  description: 'إدارة القضايا والجلسات وتوزيع الفرق والفوترة القانونية',
}

export default function DashboardFirmPage() {
  redirect('/dashboard/practice')
}
