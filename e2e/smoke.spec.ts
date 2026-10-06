import { test, expect } from '@playwright/test'

test.describe('public surface', () => {
  test('landing page renders', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('body')).toContainText('سَنَد')
  })

  test('login page renders the sign-in form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('register page renders account options and the email step', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('body')).toContainText('اختر نوع حسابك')
    await page.getByText('طالب قانون').first().click()
    await page.getByRole('button', { name: /متابعة|التالي|إنشاء/ }).first().click()
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('pricing page renders', async ({ page }) => {
    const response = await page.goto('/pricing')
    expect(response?.ok()).toBeTruthy()
  })
})

test.describe('access control', () => {
  const protectedRoutes = ['/firm', '/lawyer', '/client', '/admin', '/workflow']

  for (const route of protectedRoutes) {
    test(`${route} redirects unauthenticated visitors to login`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/login/)
      expect(page.url()).toContain('/login')
    })
  }

  test('demo portal is disabled in this environment', async ({ page }) => {
    const response = await page.goto('/portal/demo')
    expect(response?.status()).toBe(404)
  })

  test('invalid portal token returns 404 API response', async ({ request }) => {
    const response = await request.get('/api/portal/invalidtoken')
    expect([400, 404]).toContain(response.status())
  })
})

test.describe('API surface', () => {
  test('health endpoint reports database connectivity', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(body.database).toBe('ok')
  })

  const guardedApis = ['/api/workflow', '/api/memberships', '/api/saas/status', '/api/approvals', '/api/admin/jobs']

  for (const api of guardedApis) {
    test(`${api} rejects unauthenticated requests`, async ({ request }) => {
      const response = await request.get(api)
      expect([401, 403]).toContain(response.status())
    })
  }

  test('cron endpoints reject missing secrets', async ({ request }) => {
    const response = await request.get('/api/cron/jobs')
    expect(response.status()).toBe(401)
  })
})
