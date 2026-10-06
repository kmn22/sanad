import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://sanad.sa'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/sandbox', '/login', '/register', '/privacy', '/terms', '/ai-disclosure'],
        disallow: ['/api/', '/dashboard/', '/settings/', '/admin/', '/workflow/', '/portal/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
