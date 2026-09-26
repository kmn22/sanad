import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { verifyPassword } from "@/lib/auth/password"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email", placeholder: "admin@sanad.sa" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const cleanEmail = credentials.email.toLowerCase().trim()

        // 1. Check user in database by exact email
        const dbUser = await db.user.findFirst({
          where: { email: cleanEmail }
        })

        if (dbUser) {
          // If user has a cryptographically hashed password, verify it
          if (dbUser.password) {
            const isValid = verifyPassword(credentials.password, dbUser.password)
            if (!isValid) {
              return null
            }
          } else {
            // Legacy / seed user without password: allow demo password
            if (credentials.password !== 'admin' && credentials.password !== 'admin123') {
              return null
            }
          }

          return {
            id: dbUser.id,
            name: dbUser.name || cleanEmail.split('@')[0],
            email: dbUser.email,
            role: dbUser.role || 'lawyer',
          }
        }

        // 2. Demo fallback strictly for ahmed@sanad.sa sandbox demo account
        if (cleanEmail === 'ahmed@sanad.sa' && (credentials.password === 'admin' || credentials.password === 'admin123')) {
          return {
            id: "demo-user-1",
            name: "أحمد القحطاني",
            email: cleanEmail,
            role: "lawyer",
          }
        }

        // Any other non-existent user or wrong password is rejected
        return null
      }
    })
  ],
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
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
        token.role = (user as any).role || 'lawyer'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {}
      return baseUrl || "/"
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-sanad-key',
}

const handler = (req: any, ctx: any) => {
  try {
    const headers = req.headers
    const host = headers?.get?.("x-forwarded-host") || headers?.get?.("host") || headers?.host || "localhost:3001"
    const proto = headers?.get?.("x-forwarded-proto") || (String(host).includes("localhost") || String(host).includes("127.0.0.1") ? "http" : "https")
    process.env.NEXTAUTH_URL = `${proto}://${host}`
  } catch {}

  return NextAuth(req, ctx, authOptions)
}

export { handler as GET, handler as POST }
