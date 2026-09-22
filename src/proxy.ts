import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
    },
  },
})

export const config = {
  matcher: [
    "/((?!api/auth|portal|login|_next/static|_next/image|favicon.ico|manifest.json|.*\\..*).*)",
  ],
}
