import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXTAUTH_URL || 'https://maqar.sa').replace(/\/$/, '')
  const currentDate = new Date()

  const routes = [
    '',
    '/pricing',
    '/about',
    '/security',
    '/login',
    '/signup',
    '/register',
    '/privacy',
    '/terms',
    '/ai-disclosure',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/pricing' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/pricing' ? 0.9 : 0.5,
  }))
}
