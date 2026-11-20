export interface ComplianceStatusCheck {
  isExpired: boolean
  isExpiring: boolean
  diffDays: number
  recommendedStatus: 'expired' | 'expiring' | 'active'
}

export function evaluateComplianceStatus(
  expiryDate: Date,
  notifyDays: number,
  now: Date = new Date()
): ComplianceStatusCheck {
  const expiry = new Date(expiryDate).getTime()
  const diffDays = Math.ceil((expiry - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = diffDays < 0
  const isExpiring = !isExpired && diffDays <= notifyDays

  let recommendedStatus: 'expired' | 'expiring' | 'active' = 'active'
  if (isExpired) {
    recommendedStatus = 'expired'
  } else if (isExpiring) {
    recommendedStatus = 'expiring'
  }

  return {
    isExpired,
    isExpiring,
    diffDays,
    recommendedStatus,
  }
}
