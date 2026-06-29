import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email", placeholder: "admin@sanad.sa" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        // Demo/Hackathon mock auth
        if (credentials?.email && credentials?.password === 'admin') {
          return { id: "1", name: "أحمد (محامٍ)", email: credentials.email }
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
  secret: process.env.NEXTAUTH_SECRET || 'super-secret-sanad-key',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
