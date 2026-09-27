import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/options'

const handler = (req: any, ctx: any) => {
  try {
    const headers = req.headers
    const host = headers?.get?.('x-forwarded-host') || headers?.get?.('host') || headers?.host || 'localhost:3001'
    const proto = headers?.get?.('x-forwarded-proto') || (String(host).includes('localhost') || String(host).includes('127.0.0.1') ? 'http' : 'https')
    process.env.NEXTAUTH_URL = `${proto}://${host}`
  } catch {}

  return NextAuth(req, ctx, authOptions)
}

export { handler as GET, handler as POST }
export { authOptions }
