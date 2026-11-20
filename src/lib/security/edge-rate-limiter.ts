/**
 * ============================================================================
 * Maqar (مقر) Security Hardening — Edge Sliding-Window Rate Limiter & Token Guard
 * (`src/lib/security/edge-rate-limiter.ts`)
 * ============================================================================
 *
 * Edge-runtime compatible sliding-window rate limiter & JWT claim verifier
 * protecting `/api/*` and authentication endpoints against brute-force,
 * credential stuffing, and automated scraping per NCA CCC-2:2024 controls.
 */

export interface RateLimitTierConfig {
  windowMs: number
  maxRequests: number
}

export interface EdgeRateLimitDecision {
  allowed: boolean
  limit: number
  remaining: number
  resetEpochSeconds: number
  retryAfterSeconds: number
}

interface BucketState {
  timestamps: number[]
}

const edgeBuckets = new Map<string, BucketState>()
const MAX_TRACKED_KEYS = 10_000

export const MAQAR_RATE_LIMIT_TIERS: Record<
  'AUTH_STRICT' | 'AI_COMPUTE' | 'STANDARD_API',
  RateLimitTierConfig
> = {
  AUTH_STRICT: { windowMs: 60_000, maxRequests: 20 },
  AI_COMPUTE: { windowMs: 60_000, maxRequests: 30 },
  STANDARD_API: { windowMs: 60_000, maxRequests: 180 },
}

const AUTH_READONLY_BOOTSTRAP_ROUTES = new Set([
  '/api/auth/session',
  '/api/auth/providers',
  '/api/auth/csrf',
])

export function resolveRateLimitTier(
  pathname: string
): keyof typeof MAQAR_RATE_LIMIT_TIERS {
  if (AUTH_READONLY_BOOTSTRAP_ROUTES.has(pathname)) return 'STANDARD_API'
  if (pathname.startsWith('/api/auth/')) return 'AUTH_STRICT'
  if (pathname.startsWith('/api/ai/') || pathname.startsWith('/api/academic/')) {
    return 'AI_COMPUTE'
  }
  return 'STANDARD_API'
}

/**
 * Evaluates a sliding-window rate limit for a client IP + tier key.
 */
export function evaluateEdgeRateLimit(
  clientKey: string,
  tier: keyof typeof MAQAR_RATE_LIMIT_TIERS = 'STANDARD_API',
  nowMs: number = Date.now()
): EdgeRateLimitDecision {
  const { windowMs, maxRequests } = MAQAR_RATE_LIMIT_TIERS[tier]
  const cutoff = nowMs - windowMs
  const compositeKey = `${tier}:${clientKey}`

  if (edgeBuckets.size > MAX_TRACKED_KEYS) {
    edgeBuckets.clear()
  }

  const bucket = edgeBuckets.get(compositeKey) ?? { timestamps: [] }
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff)

  if (bucket.timestamps.length >= maxRequests) {
    const oldestInWindow = bucket.timestamps[0] ?? nowMs
    const resetMs = oldestInWindow + windowMs
    const retryAfterSeconds = Math.max(1, Math.ceil((resetMs - nowMs) / 1000))
    edgeBuckets.set(compositeKey, bucket)
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetEpochSeconds: Math.ceil(resetMs / 1000),
      retryAfterSeconds,
    }
  }

  bucket.timestamps.push(nowMs)
  edgeBuckets.set(compositeKey, bucket)

  const resetMs = (bucket.timestamps[0] ?? nowMs) + windowMs
  return {
    allowed: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - bucket.timestamps.length),
    resetEpochSeconds: Math.ceil(resetMs / 1000),
    retryAfterSeconds: 0,
  }
}

export function resetEdgeRateLimiterForTests(): void {
  edgeBuckets.clear()
}

/**
 * Validates decoded JWT session token claims required for protected multi-tenant
 * API access (`id`, `orgId`, `workspaceId`, `role`, and token expiration `exp`).
 */
export function validateTenantJwtClaims(
  token: Record<string, unknown> | null | undefined,
  nowEpochSeconds: number = Math.floor(Date.now() / 1000),
  options?: { requireOrgId?: boolean }
): {
  valid: boolean
  reason?: 'MISSING_TOKEN' | 'EXPIRED_TOKEN' | 'MISSING_TENANT_SCOPE' | 'MISSING_ROLE'
} {
  if (!token || typeof token.id !== 'string' || !token.id) {
    return { valid: false, reason: 'MISSING_TOKEN' }
  }

  if (typeof token.exp === 'number' && token.exp <= nowEpochSeconds) {
    return { valid: false, reason: 'EXPIRED_TOKEN' }
  }

  if (typeof token.role !== 'string' || !token.role) {
    return { valid: false, reason: 'MISSING_ROLE' }
  }

  // Client portal users carry clientId + workspaceId; staff/students carry workspaceId
  if (typeof token.workspaceId !== 'string' || !token.workspaceId.trim()) {
    return { valid: false, reason: 'MISSING_TENANT_SCOPE' }
  }

  if (options?.requireOrgId || 'orgId' in token) {
    if (typeof token.orgId !== 'string' || !token.orgId.trim()) {
      return { valid: false, reason: 'MISSING_TENANT_SCOPE' }
    }
  }

  return { valid: true }
}

