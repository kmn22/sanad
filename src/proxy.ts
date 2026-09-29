import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { PRIVACY_NOTICE_VERSION } from '@/lib/compliance'

const secureCookie = process.env.NODE_ENV === 'production'
const authSecret = process.env.NEXTAUTH_SECRET

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicApiPath =
    pathname === '/api' ||
    pathname === '/api/health' ||
    pathname === '/api/auth/register' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/billing/webhook') ||
    pathname === '/api/privacy/requests'

  if (pathname.startsWith('/api/') && !publicApiPath) {
    const token = await getToken({
      req,
      secret: authSecret,
      secureCookie,
    })

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (pathname !== '/api/privacy/accept' && token.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return NextResponse.json({ error: 'Current privacy notice acceptance is required', code: 'PRIVACY_NOTICE_REQUIRED' }, { status: 403 })
    }
  }

  // Protected paths
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings') || pathname.startsWith('/admin') || pathname === '/privacy/accept') {
    const token = await getToken({
      req,
      secret: authSecret,
      secureCookie,
    })

    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (pathname !== '/privacy/accept' && token.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return NextResponse.redirect(new URL('/privacy/accept', req.url))
    }
  }

  // If already authenticated, redirect away from /login and /register to /dashboard
  if (pathname === '/login' || pathname === '/register') {
    const token = await getToken({
      req,
      secret: authSecret,
      secureCookie,
    })

    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/dashboard', '/settings/:path*', '/admin/:path*', '/admin', '/privacy/accept', '/login', '/register'],
}
