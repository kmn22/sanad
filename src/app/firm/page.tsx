import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/auth/workspace'
import { getWorkspacePlan } from '@/lib/saas/entitlements'
import { FirmOverviewPage } from './FirmPortal'

export default async function FirmHome() {
  const auth = await getAuthContext()
  if (!auth) redirect('/login')
  const status = await getWorkspacePlan(auth.workspaceId)
  if (status?.workspace.onboardingStatus !== 'completed') redirect('/firm/onboarding')
  return <FirmOverviewPage />
}
