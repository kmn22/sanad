import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        // Validate against ADMIN_PASSWORD env var (defaults blocked in production)
        const validPassword = process.env.ADMIN_PASSWORD
        if (!validPassword) {
          return null
        }
        if (credentials.password !== validPassword) {
          return null
        }
        return {
          id: "1",
          email: credentials.email,
          name: credentials.email.split("@")[0],
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
