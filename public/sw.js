// Sanad Service Worker — client-side caching strategy for daily-traffic home server.
// Strategy:
//  - App shell (HTML, JS, CSS, fonts): stale-while-revalidate (instant load)
//  - API GETs: network-first with cache fallback (fresh data when online)
//  - POST/PATCH/DELETE: pass through (no cache)
const CACHE_VERSION = 'sanad-v1'
const SHELL_CACHE = `${CACHE_VERSION}-shell`
const DATA_CACHE = `${CACHE_VERSION}-data`
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin
  if (url.origin !== self.location.origin) return

  // Skip Next.js internals / HMR
  if (url.pathname.startsWith('/_next/webpack-hmr')) return

  // Mutations — always network
  if (request.method !== 'GET') {
    event.respondWith(fetch(request))
    return
  }

  // API — network-first with cache fallback (fresh data when online, survive offline)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          if (fresh.ok) {
            const cache = await caches.open(DATA_CACHE)
            cache.put(request, fresh.clone())
          }
          return fresh
        } catch {
          const cached = await caches.match(request)
          if (cached) return cached
          return new Response(JSON.stringify({ offline: true }), {
            headers: { 'Content-Type': 'application/json' },
          })
        }
      })()
    )
    return
  }

  // App shell — stale-while-revalidate
  event.respondWith(
    (async () => {
      const cached = await caches.match(request)
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone()
            caches.open(SHELL_CACHE).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })()
  )
})
