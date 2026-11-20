import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { PRIVACY_NOTICE_VERSION } from '@/lib/compliance'
import {
  canAccessPortal,
  homePathFor,
  portalForPath,
} from '@/lib/auth/portals'
import {
  evaluateEdgeRateLimit,
  resolveRateLimitTier,
  validateTenantJwtClaims,
} from '@/lib/security/edge-rate-limiter'

const secureCookie = process.env.NODE_ENV === 'production'
const authSecret = process.env.NEXTAUTH_SECRET

// Global request-body ceilings — applied before any route parses a body.
// Multipart uploads are allowed up to the 10 MB file cap plus form overhead;
// everything else (JSON) is far smaller.
const MAX_JSON_BODY_BYTES = 256 * 1024
const MAX_MULTIPART_BODY_BYTES = 12 * 1024 * 1024

// TLS is terminated upstream (Tailscale funnel / reverse proxy), so the app
// itself always speaks HTTP. HTTPS-only headers must therefore be applied
// conditionally: on a plain-HTTP origin they would instruct the browser to
// upgrade fetches to https://<host>:<port>, where nothing speaks TLS — the
// result is ERR_SSL_PROTOCOL_ERROR on every API call.
function requestIsHttps(req: NextRequest): boolean {
  if (req.headers.get('x-forwarded-proto') === 'https') return true
  if (req.nextUrl.protocol === 'https:') return true
  const canonical = process.env.NEXTAUTH_URL
  if (canonical?.startsWith('https:')) {
    try {
      return req.headers.get('host') === new URL(canonical).host
    } catch {
      return false
    }
  }
  return false
}

function requestIdFor(req: NextRequest): string {
  const incoming = req.headers.get('x-request-id')
  return incoming && incoming.length <= 128 ? incoming : crypto.randomUUID()
}

function clientIpFor(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() || '127.0.0.1'
}

function nextWithRequestId(
  req: NextRequest,
  requestId: string,
  tenantScope?: { workspaceId?: string; orgId?: string; userId?: string }
): NextResponse {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-request-id', requestId)
  // Always strip client-supplied tenant headers first to prevent spoofing on
  // public routes or unauthenticated requests before injecting verified claims.
  requestHeaders.delete('x-tenant-workspace-id')
  requestHeaders.delete('x-tenant-org-id')
  requestHeaders.delete('x-tenant-user-id')

  if (tenantScope?.workspaceId) {
    requestHeaders.set('x-tenant-workspace-id', tenantScope.workspaceId)
  }
  if (tenantScope?.orgId) {
    requestHeaders.set('x-tenant-org-id', tenantScope.orgId)
  }
  if (tenantScope?.userId) {
    requestHeaders.set('x-tenant-user-id', tenantScope.userId)
  }
  return NextResponse.next({ request: { headers: requestHeaders } })
}

function withSecureHeaders(req: NextRequest, requestId: string, res: NextResponse): NextResponse {
  res.headers.set('x-request-id', requestId)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (requestIsHttps(req)) {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    res.headers.append('Content-Security-Policy', 'upgrade-insecure-requests')
  }
  return res
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const requestId = requestIdFor(req)

  // Exact matches only — a prefix match would open every path sharing the
  // prefix (e.g. /api/billing/webhook-admin) to unauthenticated access.
  const isPublicApi =
    pathname === '/api' ||
    pathname === '/api/health' ||
    pathname === '/api/auth/register' ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/privacy/requests' ||
    pathname === '/api/invitations/preview' ||
    pathname === '/api/waitlist' ||
    pathname === '/api/analytics/events' ||
    pathname === '/api/ai/check-clause' ||
    pathname === '/api/ai/summarize-contract' ||
    pathname.startsWith('/api/portal/') ||
    pathname.startsWith('/api/cron/')

  const isApi = pathname.startsWith('/api/')
  const isPrivacyAcceptanceApi = pathname === '/api/privacy/accept'
  const portal = portalForPath(pathname)
  const legacySection = ['cases', 'clients', 'tasks', 'documents', 'invoices', 'compliance', 'calendar', 'communications'].find(
    (s) => pathname === `/${s}` || pathname.startsWith(`/${s}/`),
  )
  const isProtectedPage =
    portal !== null ||
    legacySection !== undefined ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/workflow') ||
    pathname === '/privacy/accept'
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/signup'

  if (!isApi && !isProtectedPage && !isAuthPage) return withSecureHeaders(req, requestId, nextWithRequestId(req, requestId))

  // Resolve the token once and reuse it for every branch below.
  const token = await getToken({ req, secret: authSecret, secureCookie })
  const role = (token?.role as string | undefined) || undefined

  if (isApi) {
    // 1. NCA CCC Edge Sliding-Window Rate Limiting
    const clientIp = clientIpFor(req)
    const rlTier = resolveRateLimitTier(pathname)
    const rlDecision = evaluateEdgeRateLimit(clientIp, rlTier)
    if (!rlDecision.allowed) {
      const rateLimitedRes = NextResponse.json(
        {
          error: 'Too many requests — rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfterSeconds: rlDecision.retryAfterSeconds,
        },
        { status: 429 }
      )
      rateLimitedRes.headers.set('Retry-After', String(rlDecision.retryAfterSeconds))
      rateLimitedRes.headers.set('X-RateLimit-Limit', String(rlDecision.limit))
      rateLimitedRes.headers.set('X-RateLimit-Remaining', '0')
      rateLimitedRes.headers.set('X-RateLimit-Reset', String(rlDecision.resetEpochSeconds))
      return withSecureHeaders(req, requestId, rateLimitedRes)
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const isMultipart = (req.headers.get('content-type') || '').includes('multipart/form-data')
      const ceiling = isMultipart ? MAX_MULTIPART_BODY_BYTES : MAX_JSON_BODY_BYTES
      const declared = Number(req.headers.get('content-length') || 0)
      if (declared > ceiling) {
        return withSecureHeaders(req, requestId, NextResponse.json({ error: 'Request body is too large' }, { status: 413 }))
      }
    }
    if (isPublicApi) return withSecureHeaders(req, requestId, nextWithRequestId(req, requestId))

    // 2. Strict JWT Token & Tenant Claim Validation (`id`, `orgId`, `workspaceId`, `role`, `exp`)
    const claimCheck = validateTenantJwtClaims(
      token as Record<string, unknown> | null,
      undefined,
      { requireOrgId: true }
    )
    if (!token || !claimCheck.valid) {
      return withSecureHeaders(
        req,
        requestId,
        NextResponse.json(
          { error: 'Authentication required', code: claimCheck.reason || 'UNAUTHORIZED' },
          { status: 401 }
        )
      )
    }
    if (!isPrivacyAcceptanceApi && token.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return withSecureHeaders(req, requestId, NextResponse.json({ error: 'Current privacy notice acceptance is required', code: 'PRIVACY_NOTICE_REQUIRED' }, { status: 403 }))
    }
    // Client logins may only reach the client-scoped API surface. This is a
    // defence-in-depth layer on top of getAuthContext() rejecting clients.
    if (role === 'client' && !pathname.startsWith('/api/client/')) {
      return withSecureHeaders(req, requestId, NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    }
    if (pathname.startsWith('/api/client/') && role !== 'client') {
      return withSecureHeaders(req, requestId, NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    }
    const okRes = nextWithRequestId(req, requestId, {
      workspaceId: token.workspaceId as string | undefined,
      orgId: token.orgId as string | undefined,
      userId: token.id as string | undefined,
    })
    okRes.headers.set('X-RateLimit-Limit', String(rlDecision.limit))
    okRes.headers.set('X-RateLimit-Remaining', String(rlDecision.remaining))
    return withSecureHeaders(req, requestId, okRes)
  }

  const pageClaimCheck = validateTenantJwtClaims(
    token as Record<string, unknown> | null,
    undefined,
    { requireOrgId: true }
  )

  if (isProtectedPage) {
    if (!token || !pageClaimCheck.valid) {
      const loginUrl = new URL('/login', req.url)
      // Preserve the query string so deep links survive the login round trip.
      loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search)
      return withSecureHeaders(req, requestId, NextResponse.redirect(loginUrl))
    }
    if (pathname !== '/privacy/accept' && token.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return withSecureHeaders(req, requestId, NextResponse.redirect(new URL('/privacy/accept', req.url)))
    }
    const verifiedTenantHeaders = {
      workspaceId: token.workspaceId as string | undefined,
      orgId: token.orgId as string | undefined,
      userId: token.id as string | undefined,
    }
    const home = homePathFor(role)
    // Legacy practice paths → current portal's section.
    if (legacySection) {
      return withSecureHeaders(req, requestId, NextResponse.redirect(new URL(`${home}/${legacySection}`, req.url)))
    }
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      return withSecureHeaders(req, requestId, NextResponse.redirect(new URL(home, req.url)))
    }
    // Portal guard: wrong-role users are sent to their own portal.
    if (portal && !canAccessPortal(role, portal)) {
      return withSecureHeaders(req, requestId, NextResponse.redirect(new URL(home, req.url)))
    }
    // Admin guard: only admin, workspace_owner, or a workspace owner (e.g. solo lawyer) can access /admin
    if (pathname.startsWith('/admin') && role !== 'admin' && role !== 'workspace_owner' && !token.isOwner) {
      return withSecureHeaders(req, requestId, NextResponse.redirect(new URL(home, req.url)))
    }
    // Workflow tooling is for practice staff only.
    if (pathname.startsWith('/workflow') && role === 'client') {
      return withSecureHeaders(req, requestId, NextResponse.redirect(new URL(home, req.url)))
    }
    return withSecureHeaders(req, requestId, nextWithRequestId(req, requestId, verifiedTenantHeaders))
  }

  // Authenticated users with valid tenant claims have no business on /login or /register.
  if (isAuthPage && token && pageClaimCheck.valid) {
    return withSecureHeaders(req, requestId, NextResponse.redirect(new URL(homePathFor(role), req.url)))
  }

  return withSecureHeaders(req, requestId, nextWithRequestId(req, requestId))
}

export const config = {
  matcher: [
    // Run on every request so HTTPS-only headers are applied site-wide;
    // static assets are skipped for performance.
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|manifest.webmanifest|og-preview.png|logo.svg|icon-192.png|icon-512.png|icons/).*)',
    '/api/:path*',
    '/dashboard/:path*', '/dashboard',
    '/lawyer/:path*', '/lawyer',
    '/firm/:path*', '/firm',
    '/client/:path*', '/client',
    '/cases/:path*', '/cases',
    '/clients/:path*', '/clients',
    '/tasks/:path*', '/tasks',
    '/documents/:path*', '/documents',
    '/invoices/:path*', '/invoices',
    '/compliance/:path*', '/compliance',
    '/calendar/:path*', '/calendar',
    '/communications/:path*', '/communications',
    '/settings/:path*', '/admin/:path*', '/admin', '/workflow/:path*', '/workflow',
    '/privacy/accept', '/login', '/register',
  ],
}
