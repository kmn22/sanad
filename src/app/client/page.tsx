import { redirect } from 'next/navigation'
import { getClientContext } from '@/lib/auth/workspace'
import { getClientPortalData } from '@/lib/client-portal'
import { ClientDashboard } from './ClientDashboard'

export default async function ClientPage() {
  const context = await getClientContext()
  if (!context) redirect('/login')
  const data = await getClientPortalData(context)
  if (!data.client) redirect('/login')
  return <ClientDashboard data={data} />
}
