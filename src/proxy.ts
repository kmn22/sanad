import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { PRIVACY_NOTICE_VERSION } from '@/lib/compliance'

const secureCookie = process.env.NODE_ENV === 'production'
const authSecret = process.env.NEXTAUTH_SECRET

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Exact matches only — a prefix match would open every path sharing the
  // prefix (e.g. /api/billing/webhook-admin) to unauthenticated access.
  const isPublicApi =
    pathname === '/api' ||
    pathname === '/api/health' ||
    pathname === '/api/auth/register' ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/billing/webhook' ||
    pathname === '/api/privacy/requests' ||
    pathname === '/api/invitations/preview' ||
    pathname.startsWith('/api/portal/') ||
    pathname.startsWith('/api/cron/')

  const isApi = pathname.startsWith('/api/')
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/workflow') ||
    pathname === '/privacy/accept'
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (!isApi && !isProtectedPage && !isAuthPage) return NextResponse.next()

  // Resolve the token once and reuse it for every branch below.
  const token = await getToken({ req, secret: authSecret, secureCookie })

  if (isApi) {
    if (isPublicApi) return NextResponse.next()
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (token.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return NextResponse.json({ error: 'Current privacy notice acceptance is required', code: 'PRIVACY_NOTICE_REQUIRED' }, { status: 403 })
    }
    return NextResponse.next()
  }

  if (isProtectedPage) {
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      // Preserve the query string so deep links survive the login round trip.
      loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }
    // Admin guard: only admin or workspace_owner can access /admin
    if (pathname.startsWith('/admin') && token.role !== 'admin' && token.role !== 'workspace_owner') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (pathname !== '/privacy/accept' && token.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return NextResponse.redirect(new URL('/privacy/accept', req.url))
    }
    return NextResponse.next()
  }

  // Authenticated users have no business on /login or /register.
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/dashboard', '/settings/:path*', '/admin/:path*', '/admin', '/workflow/:path*', '/workflow', '/privacy/accept', '/login', '/register'],
}
