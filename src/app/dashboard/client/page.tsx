import { redirect } from 'next/navigation'

export const metadata = {
  title: 'مقر — بوابة الموكل والعميل',
  description: 'المقر الرقمي لمتابعة القضايا ورفع المستندات وسداد الفواتير',
}

export default function DashboardClientPage() {
  redirect('/client')
}
