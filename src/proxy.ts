import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const publicApiPath =
    pathname === '/api' ||
    pathname === '/api/health' ||
    pathname === '/api/auth/register' ||
    pathname.startsWith('/api/auth/')

  if (pathname.startsWith('/api/') && !publicApiPath) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'super-secret-sanad-key',
    })

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
  }

  // Protected paths
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'super-secret-sanad-key',
    })

    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If already authenticated, redirect away from /login and /register to /dashboard
  if (pathname === '/login' || pathname === '/register') {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'super-secret-sanad-key',
    })

    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/dashboard', '/login', '/register'],
}
