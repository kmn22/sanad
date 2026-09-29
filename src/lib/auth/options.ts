import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { clearRateLimit, rateLimit } from '@/lib/rate-limit'
import { decryptMfaSecret, hashRecoveryCode } from '@/lib/auth/mfa'
import { verifySync } from 'otplib'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email', placeholder: 'admin@sanad.sa' },
        password: { label: 'كلمة المرور', type: 'password' },
        otp: { label: 'رمز التحقق', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const cleanEmail = credentials.email.toLowerCase().trim()
        const limitKey = `login:email:${cleanEmail}`
        if (!(await rateLimit(limitKey, 5, 15 * 60 * 1000, 30 * 60 * 1000)).success) return null
        const dbUser = await db.user.findUnique({ where: { email: cleanEmail } })

        if (!dbUser?.password || dbUser.disabledAt || (dbUser.lockedUntil && dbUser.lockedUntil > new Date())) return null
        if (!verifyPassword(credentials.password, dbUser.password)) {
          const attempts = dbUser.failedLoginAttempts + 1
          await db.user.update({
            where: { id: dbUser.id },
            data: { failedLoginAttempts: attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null },
          })
          return null
        }
        if (!dbUser.emailVerified) return null
        if (dbUser.mfaEnabled) {
          if (!credentials.otp || !dbUser.mfaSecret) return null
          const otp = credentials.otp.replace(/\s/g, '').toUpperCase()
          const totpValid = /^\d{6}$/.test(otp) && verifySync({ secret: decryptMfaSecret(dbUser.mfaSecret), token: otp }).valid
          const recoveryCodes: string[] = dbUser.mfaRecoveryCodes ? JSON.parse(dbUser.mfaRecoveryCodes) : []
          const recoveryIndex = recoveryCodes.indexOf(hashRecoveryCode(otp))
          if (!totpValid && recoveryIndex < 0) return null
          if (recoveryIndex >= 0) {
            recoveryCodes.splice(recoveryIndex, 1)
            await db.user.update({ where: { id: dbUser.id }, data: { mfaRecoveryCodes: JSON.stringify(recoveryCodes) } })
          }
        }

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
          sessionVersion: dbUser.sessionVersion,
          mfaEnabled: dbUser.mfaEnabled,
          privacyNoticeVersion: dbUser.privacyNoticeVersion,
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
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion || 0
        token.mfaEnabled = Boolean((user as { mfaEnabled?: boolean }).mfaEnabled)
        token.privacyNoticeVersion = (user as { privacyNoticeVersion?: string }).privacyNoticeVersion
        return token
      }
      if (token.id) {
        const current = await db.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true, disabledAt: true, role: true, workspaceId: true, mfaEnabled: true, privacyNoticeVersion: true },
        })
        if (!current || current.disabledAt || current.sessionVersion !== token.sessionVersion) {
          delete token.id
          delete token.workspaceId
          delete token.role
        } else {
          token.role = current.role
          token.workspaceId = current.workspaceId
          token.mfaEnabled = current.mfaEnabled
          token.privacyNoticeVersion = current.privacyNoticeVersion
        }
      }
      return token
    },
    async session({ session, token }) {
      if (!token.id) return { ...session, user: undefined }
      if (session.user) {
        ;(session.user as { id?: string }).id = token.id as string
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { workspaceId?: string }).workspaceId = token.workspaceId as string | undefined
        ;(session.user as { mfaEnabled?: boolean }).mfaEnabled = Boolean(token.mfaEnabled)
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
