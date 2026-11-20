import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { homePathFor } from '@/lib/auth/portals'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user) redirect('/login')
  redirect(homePathFor(role))
}
