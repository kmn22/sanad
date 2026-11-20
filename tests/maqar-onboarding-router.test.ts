import { describe, expect, it } from 'vitest'
import {
  canAccessMaqarDashboard,
  maqarPersonaForDashboardPath,
  resolveMaqarDashboardPath,
  resolveMaqarPersona,
} from '../src/lib/auth/portals'

describe('Maqar Dynamic Dashboard Router & Persona Resolution', () => {
  it('routes ENTERPRISE_CORP organization and corporate counsel users to /dashboard/corporate', () => {
    expect(resolveMaqarPersona({ organizationType: 'ENTERPRISE_CORP' })).toBe('ENTERPRISE_CORP')
    expect(resolveMaqarDashboardPath({ organizationType: 'ENTERPRISE_CORP' })).toBe(
      '/dashboard/corporate'
    )
    expect(
      resolveMaqarDashboardPath({
        userType: 'CORPORATE_COUNSEL',
        workspaceType: 'corporate_clm',
      })
    ).toBe('/dashboard/corporate')
  })

  it('routes LAW_FIRM organization and attorney users to /dashboard/practice', () => {
    expect(resolveMaqarPersona({ organizationType: 'LAW_FIRM' })).toBe('LAW_FIRM')
    expect(resolveMaqarDashboardPath({ organizationType: 'LAW_FIRM' })).toBe(
      '/dashboard/practice'
    )
    expect(
      resolveMaqarDashboardPath({
        userType: 'ATTORNEY',
        workspaceType: 'firm',
        role: 'workspace_owner',
      })
    ).toBe('/dashboard/practice')
  })

  it('routes LAW_STUDENT and ACADEMIC_INSTITUTION tenants to /dashboard/academy', () => {
    expect(resolveMaqarPersona({ organizationType: 'ACADEMIC_INSTITUTION' })).toBe('LAW_STUDENT')
    expect(resolveMaqarDashboardPath({ organizationType: 'ACADEMIC_INSTITUTION' })).toBe(
      '/dashboard/academy'
    )
    expect(resolveMaqarDashboardPath({ userType: 'LAW_STUDENT', role: 'student' })).toBe(
      '/dashboard/academy'
    )
  })

  it('enforces strict role isolation across /dashboard/{corporate|practice|academy}', () => {
    expect(maqarPersonaForDashboardPath('/dashboard/corporate')).toBe('ENTERPRISE_CORP')
    expect(maqarPersonaForDashboardPath('/dashboard/practice')).toBe('LAW_FIRM')
    expect(maqarPersonaForDashboardPath('/dashboard/academy')).toBe('LAW_STUDENT')

    expect(canAccessMaqarDashboard('ENTERPRISE_CORP', '/dashboard/corporate')).toBe(true)
    expect(canAccessMaqarDashboard('ENTERPRISE_CORP', '/dashboard/practice')).toBe(false)
    expect(canAccessMaqarDashboard('LAW_FIRM', '/dashboard/practice')).toBe(true)
    expect(canAccessMaqarDashboard('LAW_STUDENT', '/dashboard/academy')).toBe(true)
    expect(canAccessMaqarDashboard('LAW_STUDENT', '/dashboard/corporate')).toBe(false)
  })
})

