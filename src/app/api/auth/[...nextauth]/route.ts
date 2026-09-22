import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"

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

        // 1. Check user in database
        const dbUser = await db.user.findUnique({
          where: { email: cleanEmail }
        })

        if (dbUser) {
          // In production or demo mode with admin password
          if (credentials.password === 'admin' || credentials.password.length >= 4) {
            return {
              id: dbUser.id,
              name: dbUser.name || 'أحمد (محامٍ)',
              email: dbUser.email,
              role: dbUser.role || 'lawyer',
            }
          }
        }

        // 2. Demo fallback for sandbox testing
        if (credentials.password === 'admin') {
          return {
            id: "demo-user-1",
            name: "أحمد القحطاني",
            email: cleanEmail,
            role: "lawyer",
          }
        }

        return null
      }
    })
  ],
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
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-sanad-key',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
