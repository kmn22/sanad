import { default as nextAuthMiddleware } from "next-auth/middleware"

export default nextAuthMiddleware

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|logo.svg).*)"],
}
