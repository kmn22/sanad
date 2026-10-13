import { test, expect, type Page, type BrowserContext } from '@playwright/test'
import { generateSync } from 'otplib'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const ADMIN_MFA_SECRET = process.env.E2E_ADMIN_MFA_SECRET
const authed = ADMIN_EMAIL && ADMIN_PASSWORD && ADMIN_MFA_SECRET

async function loginWithMfa(page: Page, email: string, password: string, secret: string) {
  await page.goto('/login')
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.locator('#login-otp').fill(generateSync({ secret }))
  await page.getByRole('button', { name: /تسجيل الدخول|دخول/ }).click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
}

async function api(page: Page, path: string, init?: RequestInit) {
  return page.evaluate(async ([p, i]) => {
    const res = await fetch(p, {
      ...i,
      headers: { 'Content-Type': 'application/json', ...(i?.headers || {}) },
    })
    return { status: res.status, body: await res.json().catch(() => null) }
  }, [path, init] as const)
}

// Serial + single login: credentials auth is rate-limited to 5 attempts per
// 15 minutes per email, so each test must not log in separately.
test.describe.configure({ mode: 'serial' })

test.describe('admin console (MFA-enrolled owner)', () => {
  test.skip(!authed, 'E2E_ADMIN_* not set — run seed_e2e.ts to provision the MFA fixture')

  let context: BrowserContext
  let page: Page

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ locale: 'ar-SA' })
    page = await context.newPage()
    await loginWithMfa(page, ADMIN_EMAIL!, ADMIN_PASSWORD!, ADMIN_MFA_SECRET!)
    await expect(page.locator('body')).not.toContainText('بيانات الدخول غير صحيحة')
  })

  test.afterAll(async () => {
    await context.close()
  })

  test('MFA-enabled owner signs in through the OTP flow', async () => {
    expect(page.url()).not.toContain('/login')
  })

  test('admin console page loads', async () => {
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    expect(page.url()).not.toContain('/login')
  })

  test('admin read APIs return data past the MFA boundary', async () => {
    const users = await api(page, '/api/admin/users')
    expect(users.status).toBe(200)
    const emails = JSON.stringify(users.body)
    expect(emails).toContain('e2e.owner@sanad.test')
    expect(emails).toContain('e2e.lawyer@sanad.test')

    const auditLogs = await api(page, '/api/admin/audit-logs')
    expect(auditLogs.status).toBe(200)

    const privacyRequests = await api(page, '/api/admin/privacy/requests')
    expect(privacyRequests.status).toBe(200)

    const flags = await api(page, '/api/admin/feature-flags')
    expect(flags.status).toBe(200)
    expect(flags.body.flags).toHaveProperty('email_notifications')
  })

  test('feature flag toggle persists and restores', async () => {
    const before = await api(page, '/api/admin/feature-flags')
    const original = Boolean(before.body.flags.email_notifications)

    const toggled = await api(page, '/api/admin/feature-flags', {
      method: 'PUT',
      body: JSON.stringify({ key: 'email_notifications', enabled: !original }),
    })
    expect(toggled.status).toBe(200)
    expect(toggled.body.enabled).toBe(!original)

    const verify = await api(page, '/api/admin/feature-flags')
    expect(verify.body.flags.email_notifications).toBe(!original)

    const restored = await api(page, '/api/admin/feature-flags', {
      method: 'PUT',
      body: JSON.stringify({ key: 'email_notifications', enabled: original }),
    })
    expect(restored.status).toBe(200)
    expect(restored.body.enabled).toBe(original)
  })

  test('admin cannot assign the platform admin role', async () => {
    const users = await api(page, '/api/admin/users')
    const lawyer = (users.body as Array<{ id: string; email: string }>).find(
      (u) => u.email === 'e2e.lawyer@sanad.test',
    )
    expect(lawyer).toBeTruthy()
    const res = await api(page, `/api/admin/users/${lawyer!.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role: 'admin' }),
    })
    expect(res.status).toBe(400)
  })
})
