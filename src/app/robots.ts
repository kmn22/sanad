import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXTAUTH_URL || 'https://sanad.sa').replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/sandbox', '/about', '/security', '/build', '/login', '/register', '/privacy', '/terms', '/ai-disclosure'],
        disallow: ['/api/', '/dashboard/', '/settings/', '/admin/', '/workflow/', '/portal/', '/firm/', '/lawyer/', '/student/', '/client/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
