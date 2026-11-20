import { test, expect, type Page } from '@playwright/test'

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD
const hasOwnerCredentials = Boolean(OWNER_EMAIL && OWNER_PASSWORD)

const publicRoutes = [
  '/',
  '/about',
  '/api-docs',
  '/ai-disclosure',
  '/build',
  '/forgot-password',
  '/login',
  '/onboarding',
  '/pricing',
  '/privacy',
  '/privacy/request',
  '/register',
  '/reset-password',
  '/security',
  '/terms',
  '/verify-email',
]

const protectedPages = [
  '/admin',
  '/client',
  '/dashboard',
  '/dashboard/academy',
  '/dashboard/corporate',
  '/dashboard/practice',
  '/firm',
  '/firm/assignments',
  '/firm/onboarding',
  '/firm/settings',
  '/firm/team',
  '/firm/workflow',
  '/lawyer',
  '/lawyer/workflow',
  '/settings/security',
  '/student',
  '/workflow',
]

const protectedApiRoutes = [
  '/api/admin/audit-logs',
  '/api/admin/jobs',
  '/api/admin/system/status',
  '/api/approvals',
  '/api/cases',
  '/api/clients',
  '/api/communications',
  '/api/compliance',
  '/api/dashboard',
  '/api/documents',
  '/api/invoices',
  '/api/memberships',
  '/api/notifications',
  '/api/research',
  '/api/saas/status',
  '/api/tasks',
  '/api/team',
  '/api/time-entries',
  '/api/workflow',
]

const authenticatedReadRoutes = [
  ...protectedApiRoutes,
  '/api/feature-flags',
  '/api/notification-preferences',
  '/api/student/dashboard',
  '/api/workflow-templates',
]

let ipSeq = 0

async function login(page: Page) {
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.240.6.${(++ipSeq % 250) + 1}` })
  await page.goto('/login')
  await page.locator('#login-email').fill(OWNER_EMAIL!)
  await page.locator('#login-password').fill(OWNER_PASSWORD!)
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 })

  if (new URL(page.url()).pathname === '/privacy/accept') {
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'حفظ ومتابعة' }).click()
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    await login(page)
  }
}

async function jsonResponse(page: Page, route: string, init?: RequestInit) {
  return page.evaluate(async ([url, requestInit]) => {
    const response = await fetch(url, {
      ...requestInit,
      headers: { Accept: 'application/json', ...(requestInit?.headers || {}) },
    })
    return {
      status: response.status,
      body: await response.json().catch(() => null),
    }
  }, [route, init] as const)
}

test.describe('Maqar complete post-deployment smoke gate', () => {
  test('public pages render without server errors or browser errors', async ({ page }) => {
    const serverErrors: string[] = []
    const browserErrors: string[] = []

    page.on('response', (response) => {
      if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`)
    })
    page.on('pageerror', (error) => browserErrors.push(error.message))

    for (const route of publicRoutes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${route} response`).toBeLessThan(500)
      await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    }

    expect(serverErrors, 'server-side 5xx responses').toEqual([])
    expect(browserErrors, 'uncaught browser errors').toEqual([])
  })

  test('public APIs and static assets are available', async ({ request }) => {
    const health = await request.get('/api/health')
    expect(health.status()).toBe(200)
    const healthBody = await health.json()
    expect(healthBody).toMatchObject({
      status: 'ok',
      database: 'ok',
      vectorStore: { status: 'ok' },
      queue: { status: 'ok' },
    })

    for (const route of ['/manifest.json', '/og-preview.png', '/robots.txt', '/sitemap.xml', '/sw.js']) {
      const response = await request.get(route)
      expect(response.status(), route).toBe(200)
    }

    for (const route of ['/api/auth/session', '/api/auth/providers']) {
      const response = await request.get(route)
      expect(response.status(), route).toBe(200)
    }
  })

  test('protected pages redirect unauthenticated visitors to login', async ({ page }) => {
    for (const route of protectedPages) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${route} response`).toBeLessThan(500)
      await expect(page).toHaveURL(/\/login\?callbackUrl=/)
    }
  })

  test('protected APIs reject unauthenticated visitors', async ({ request }) => {
    for (const route of protectedApiRoutes) {
      const response = await request.get(route)
      expect([401, 403], `${route} must reject anonymous access`).toContain(response.status())
    }
  })

  test('owner can load every protected page without 5xx responses', async ({ page }) => {
    test.skip(!hasOwnerCredentials, 'E2E_OWNER_EMAIL/E2E_OWNER_PASSWORD not set')
    const serverErrors: string[] = []
    const browserErrors: string[] = []

    page.on('response', (response) => {
      if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`)
    })
    page.on('pageerror', (error) => browserErrors.push(error.message))

    await login(page)
    for (const route of protectedPages) {
      await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.240.6.${(++ipSeq % 250) + 1}` })
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${route} response`).toBeLessThan(500)
      await expect(page).not.toHaveURL(/\/login/)
      await expect(page.locator('body')).not.toContainText('Application error')
    }

    expect(serverErrors, 'authenticated server-side 5xx responses').toEqual([])
    expect(browserErrors, 'authenticated uncaught browser errors').toEqual([])
  })

  test('owner can read every protected API surface', async ({ page }) => {
    test.skip(!hasOwnerCredentials, 'E2E_OWNER_EMAIL/E2E_OWNER_PASSWORD not set')
    await login(page)

    for (const route of authenticatedReadRoutes) {
      const response = await jsonResponse(page, route)
      expect(response.status, `${route} response`).toBeLessThan(500)
      expect(response.status, `${route} unexpectedly lost authentication`).not.toBe(401)
      if (route.startsWith('/api/admin/') || route === '/api/student/dashboard') {
        expect([200, 403], `${route} authorization boundary`).toContain(response.status)
      } else {
        expect(response.status, `${route} response`).toBe(200)
      }
    }
  })

  test('core business APIs return valid responses without mutating data', async ({ page }) => {
    test.skip(!hasOwnerCredentials, 'E2E_OWNER_EMAIL/E2E_OWNER_PASSWORD not set')
    await login(page)

    const clm = await jsonResponse(page, '/api/clm/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractText: 'يتحمل الطرف الثاني مسؤولية غير محدودة عن الأضرار ويحق للطرف الأول إنهاء العقد دون إشعار.',
        enableLlmEnrichment: false,
      }),
    })
    expect(clm.status).toBe(200)
    expect(clm.body).toHaveProperty('overallRiskScore')

    const deadline = await jsonResponse(page, '/api/litigation/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CALCULATE_DEADLINE',
        event: 'FIRST_INSTANCE_JUDGMENT',
        triggerDate: '2026-10-01',
      }),
    })
    expect(deadline.status).toBe(200)
    expect(deadline.body).toMatchObject({ event: 'FIRST_INSTANCE_JUDGMENT', periodDays: 30 })

    const legalQuery = await jsonResponse(page, '/api/ai/legal-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'ما هي أحكام التعويض عن إنهاء عقد العمل؟', topK: 3 }),
    })
    expect(legalQuery.status).toBe(200)
    expect(legalQuery.body.citations).toBeInstanceOf(Array)

    const semanticSearch = await jsonResponse(page, '/api/academic/semantic-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'المسؤولية التقصيرية والتعويض عن الضرر', topK: 3 }),
    })
    expect(semanticSearch.status).toBe(200)
    expect(semanticSearch.body.citations).toBeInstanceOf(Array)
  })
})
