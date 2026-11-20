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
        email: { label: 'البريد الإلكتروني', type: 'email', placeholder: 'admin@maqar.sa' },
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
        let isOwner = false
        let effectiveOrgId = dbUser.orgId
        if (dbUser.workspaceId) {
          const [workspace, membership] = await Promise.all([
            db.workspace.findUnique({
              where: { id: dbUser.workspaceId },
              select: { status: true, orgId: true, organization: { select: { isActive: true } } },
            }),
            db.workspaceMembership.findUnique({ where: { workspaceId_userId: { workspaceId: dbUser.workspaceId, userId: dbUser.id } }, select: { status: true, role: true, isOwner: true } }),
          ])
          if (
            !workspace ||
            workspace.status !== 'active' ||
            workspace.organization?.isActive === false ||
            !membership ||
            membership.status !== 'active'
          ) {
            return null
          }
          dbUser.role = membership.role
          isOwner = membership.isOwner
          effectiveOrgId = workspace.orgId || dbUser.orgId
        }
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
          userType: dbUser.userType,
          orgId: effectiveOrgId,
          workspaceId: dbUser.workspaceId,
          clientId: dbUser.clientId,
          sessionVersion: dbUser.sessionVersion,
          mfaEnabled: dbUser.mfaEnabled,
          isOwner,
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
        token.email = user.email
        token.role = (user as { role?: string }).role || 'lawyer'
        token.userType = (user as { userType?: string }).userType || 'ATTORNEY'
        token.orgId = (user as { orgId?: string }).orgId
        token.workspaceId = (user as { workspaceId?: string }).workspaceId
        token.clientId = (user as { clientId?: string | null }).clientId || undefined
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion || 0
        token.mfaEnabled = Boolean((user as { mfaEnabled?: boolean }).mfaEnabled)
        token.isOwner = Boolean((user as { isOwner?: boolean }).isOwner)
        token.privacyNoticeVersion = (user as { privacyNoticeVersion?: string }).privacyNoticeVersion
        return token
      }
      if (token.id) {
        const current = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            email: true,
            sessionVersion: true,
            disabledAt: true,
            role: true,
            userType: true,
            orgId: true,
            workspaceId: true,
            clientId: true,
            mfaEnabled: true,
            privacyNoticeVersion: true,
            workspace: {
              select: {
                orgId: true,
                status: true,
                type: true,
                onboardingStatus: true,
                organization: { select: { type: true, isActive: true } },
              },
            },
            memberships: { where: { status: 'active' }, select: { workspaceId: true, role: true, isOwner: true } },
          },
        })
        const activeMembership = current?.workspaceId ? current.memberships.find((membership) => membership.workspaceId === current.workspaceId) : null
        if (
          !current ||
          current.disabledAt ||
          current.sessionVersion !== token.sessionVersion ||
          current.workspace?.status !== 'active' ||
          current.workspace?.organization?.isActive === false ||
          !activeMembership
        ) {
          delete token.id
          delete token.orgId
          delete token.workspaceId
          delete token.clientId
          delete token.role
        } else {
          token.email = current.email
          token.role = activeMembership.role
          token.userType = current.userType
          token.isOwner = activeMembership.isOwner
          token.orgId = current.workspace.orgId || current.orgId
          token.workspaceId = current.workspaceId
          token.clientId = current.clientId || undefined
          token.mfaEnabled = current.mfaEnabled
          token.privacyNoticeVersion = current.privacyNoticeVersion
          token.workspaceType = current.workspace?.type || 'firm'
          token.onboardingStatus = current.workspace?.onboardingStatus || 'completed'
          token.organizationType = current.workspace?.organization?.type || undefined
        }
      }
      return token
    },
    async session({ session, token }) {
      if (!token.id || !token.workspaceId || !token.orgId) return { ...session, user: undefined }
      if (session.user) {
        ;(session.user as { id?: string }).id = token.id as string
        ;(session.user as { email?: string }).email = (token.email as string | undefined) || session.user.email || undefined
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { userType?: string }).userType = token.userType as string | undefined
        ;(session.user as { orgId?: string }).orgId = token.orgId as string
        ;(session.user as { workspaceId?: string }).workspaceId = token.workspaceId as string | undefined
        ;(session.user as { clientId?: string }).clientId = token.clientId as string | undefined
        ;(session.user as { mfaEnabled?: boolean }).mfaEnabled = Boolean(token.mfaEnabled)
        ;(session.user as { isOwner?: boolean }).isOwner = Boolean(token.isOwner)
        ;(session.user as { workspaceType?: string }).workspaceType = token.workspaceType as string | undefined
        ;(session.user as { organizationType?: string }).organizationType = token.organizationType as string | undefined
        ;(session.user as { onboardingStatus?: string }).onboardingStatus = token.onboardingStatus as string | undefined
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
