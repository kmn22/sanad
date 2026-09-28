import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { clearRateLimit, rateLimit } from '@/lib/rate-limit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email', placeholder: 'admin@sanad.sa' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const cleanEmail = credentials.email.toLowerCase().trim()
        const limitKey = `login:email:${cleanEmail}`
        if (!(await rateLimit(limitKey, 5, 15 * 60 * 1000, 30 * 60 * 1000)).success) return null
        const dbUser = await db.user.findUnique({ where: { email: cleanEmail } })

        if (!dbUser?.password || (dbUser.lockedUntil && dbUser.lockedUntil > new Date())) return null
        if (!verifyPassword(credentials.password, dbUser.password)) {
          const attempts = dbUser.failedLoginAttempts + 1
          await db.user.update({
            where: { id: dbUser.id },
            data: { failedLoginAttempts: attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null },
          })
          return null
        }
        if (!dbUser.emailVerified) return null

        await db.$transaction([
          db.user.update({ where: { id: dbUser.id }, data: { failedLoginAttempts: 0, lockedUntil: null } }),
          db.auditLog.create({ data: { workspaceId: dbUser.workspaceId, userId: dbUser.id, action: 'auth.login' } }),
        ])
        await clearRateLimit(limitKey)

        return {
          id: dbUser.id,
          name: dbUser.name || cleanEmail.split('@')[0],
          email: dbUser.email,
          role: dbUser.role || 'lawyer',
          workspaceId: dbUser.workspaceId,
        }
      },
    }),
  ],
  useSecureCookies: process.env.NODE_ENV === 'production',
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role || 'lawyer'
        token.workspaceId = (user as { workspaceId?: string }).workspaceId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id?: string }).id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { workspaceId?: string }).workspaceId = token.workspaceId as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return url
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {}
      return baseUrl || '/'
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
