'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { getLawyerDashboard } from '@/app/actions/dashboard'
import { getStudentDashboard } from '@/app/actions/studentDashboard'
import type { DashboardData, StudentDashboardData } from '@/lib/sanad/types'
import { getFirmDashboard, type FirmDashboard } from '@/app/actions/firmDashboard'

/**
 * Shared practice data for the Lawyer and Firm portals. Every page that calls
 * this hook shares one cached query, so navigating between sections is instant.
 */
export function useLawyerDashboard() {
  const { status } = useSession()
  const query = useQuery<DashboardData>({
    queryKey: ['dashboard', 'lawyer'],
    queryFn: async () => (await getLawyerDashboard()) as unknown as DashboardData,
    enabled: status === 'authenticated',
  })
  return { ...query, data: query.data ?? null, busy: query.isLoading || query.isRefetching }
}

export function useStudentDashboard() {
  const { status } = useSession()
  const query = useQuery<StudentDashboardData>({
    queryKey: ['dashboard', 'student'],
    queryFn: async () => (await getStudentDashboard()) as unknown as StudentDashboardData,
    enabled: status === 'authenticated',
  })
  return { ...query, data: query.data ?? null, busy: query.isLoading || query.isRefetching }
}

export function useFirmDashboard() {
  const { status } = useSession()
  const query = useQuery<FirmDashboard | null>({
    queryKey: ['dashboard', 'firm'],
    queryFn: () => getFirmDashboard(),
    enabled: status === 'authenticated',
  })
  return { ...query, data: query.data ?? null, busy: query.isLoading || query.isRefetching }
}
