import { redirect } from 'next/navigation'

export const metadata = {
  title: 'مقر — لوحة الإدارة الفنية والأنظمة',
  description: 'المقر الرقمي لإدارة المنصة والمستأجرين وتدقيق العمليات',
}

export default function DashboardAdminPage() {
  redirect('/admin')
}
