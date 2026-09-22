import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth endpoints)
     * - portal (Public client portal: /portal/:token)
     * - login (Login page)
     * - _next/static (static assets)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt, public files (.svg, .png, etc.)
     */
    "/((?!api/auth|portal|login|_next/static|_next/image|favicon.ico|manifest.json|.*\\..*).*)",
  ],
}
