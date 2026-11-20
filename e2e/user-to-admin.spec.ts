import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { generateSync } from 'otplib'

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD
const LAWYER_EMAIL = process.env.E2E_LAWYER_EMAIL
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const ADMIN_MFA_SECRET = process.env.E2E_ADMIN_MFA_SECRET

const hasOwner = Boolean(OWNER_EMAIL && OWNER_PASSWORD)
const hasLawyer = Boolean(LAWYER_EMAIL && OWNER_PASSWORD)
const hasAdmin = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD && ADMIN_MFA_SECRET)

let ipSeq = 0

async function login(page: Page, email: string, password: string, otpSecret?: string) {
  await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.240.7.${(++ipSeq % 250) + 1}` })
  await page.goto('/login')
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  if (otpSecret) await page.locator('#login-otp').fill(generateSync({ secret: otpSecret }))
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 })
}

async function api(page: Page, path: string, init?: RequestInit) {
  return page.evaluate(async ([url, requestInit]) => {
    const response = await fetch(url, {
      ...requestInit,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(requestInit?.headers || {}) },
    })
    return { status: response.status, body: await response.json().catch(() => null) }
  }, [path, init] as const)
}

test.describe.configure({ mode: 'serial' })

test.describe('complete journey: typical user to administrator', () => {
  test('anonymous visitor can discover the product and is denied protected APIs', async ({ page }) => {
    await page.context().setExtraHTTPHeaders({ 'x-forwarded-for': `10.240.7.${(++ipSeq % 250) + 1}` })
    await page.goto('/')
    await expect(page.locator('body')).toContainText(/مقر|مَقَرّ/)
    await page.goto('/register')
    await expect(page.locator('body')).toContainText('اختر نوع حسابك')

    for (const route of ['/api/cases', '/api/clients', '/api/tasks', '/api/admin/users']) {
      const response = await page.request.get(route)
      expect([401, 403], `${route} must reject anonymous access`).toContain(response.status())
    }
  })

  test('workspace owner completes a client, case, and task lifecycle', async ({ page }) => {
    test.skip(!hasOwner, 'E2E_OWNER_EMAIL/E2E_OWNER_PASSWORD not set')
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)

    for (const route of ['/firm', '/firm/team', '/firm/workflow', '/workflow', '/settings/security']) {
      const response = await page.goto(route)
      expect(response?.status(), route).toBeLessThan(500)
      await expect(page).not.toHaveURL(/\/login/)
    }

    const marker = Date.now()
    let clientId: string | undefined
    let caseId: string | undefined
    let taskId: string | undefined
    try {
      const client = await api(page, '/api/clients', {
        method: 'POST',
        body: JSON.stringify({ name: `E2E journey client ${marker}`, type: 'individual', phone: '+966500000099' }),
      })
      expect(client.status).toBe(200)
      clientId = client.body.id

      const legalCase = await api(page, '/api/cases', {
        method: 'POST',
        body: JSON.stringify({
          title: `E2E journey case ${marker}`,
          clientId,
          clientName: client.body.name,
          caseType: 'litigation',
          stage: 'intake',
          priority: 'normal',
        }),
      })
      expect(legalCase.status).toBe(200)
      caseId = legalCase.body.id

      const task = await api(page, '/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: `E2E journey task ${marker}`, caseId, status: 'todo', priority: 'normal' }),
      })
      expect(task.status).toBe(200)
      taskId = task.body.id

      const updatedTask = await api(page, `/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'in_progress' }),
      })
      expect(updatedTask.status).toBe(200)
      expect(updatedTask.body.status).toBe('in_progress')

      const detail = await api(page, `/api/clients/${clientId}`)
      expect(detail.status).toBe(200)
      expect(detail.body.cases.some((item: { id: string }) => item.id === caseId)).toBeTruthy()
    } finally {
      if (taskId) expect((await api(page, `/api/tasks/${taskId}`, { method: 'DELETE' })).status).toBe(200)
      if (caseId) expect((await api(page, `/api/cases/${caseId}`, { method: 'DELETE' })).status).toBe(200)
      if (clientId) expect((await api(page, `/api/clients/${clientId}`, { method: 'DELETE' })).status).toBe(200)
    }
  })

  test('lawyer can read workspace data but cannot use admin controls', async ({ browser }) => {
    test.skip(!hasOwner || !hasLawyer, 'E2E_OWNER_* and E2E_LAWYER_EMAIL are required')
    const context = await browser.newContext({ locale: 'ar-SA' })
    const page = await context.newPage()
    try {
      await login(page, LAWYER_EMAIL!, OWNER_PASSWORD!)
      expect((await api(page, '/api/cases')).status).toBe(200)
      expect((await api(page, '/api/team')).status).toBe(200)
      expect((await api(page, '/api/admin/users')).status).toBe(403)
      expect((await api(page, '/api/admin/feature-flags')).status).toBe(403)
    } finally {
      await context.close()
    }
  })

  test('MFA administrator can inspect users and safely restore a feature flag', async ({ browser }) => {
    test.skip(!hasAdmin, 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD/E2E_ADMIN_MFA_SECRET are required')
    const context: BrowserContext = await browser.newContext({ locale: 'ar-SA' })
    const page = await context.newPage()
    try {
      await login(page, ADMIN_EMAIL!, ADMIN_PASSWORD!, ADMIN_MFA_SECRET!)
      await page.goto('/admin')
      await expect(page).not.toHaveURL(/\/login/)

      const users = await api(page, '/api/admin/users')
      expect(users.status).toBe(200)
      expect(JSON.stringify(users.body)).toContain(ADMIN_EMAIL)

      const before = await api(page, '/api/admin/feature-flags')
      expect(before.status).toBe(200)
      const original = Boolean(before.body.flags.email_notifications)
      try {
        const changed = await api(page, '/api/admin/feature-flags', {
          method: 'PUT',
          body: JSON.stringify({ key: 'email_notifications', enabled: !original }),
        })
        expect(changed.status).toBe(200)
        expect(changed.body.enabled).toBe(!original)
      } finally {
        const restored = await api(page, '/api/admin/feature-flags', {
          method: 'PUT',
          body: JSON.stringify({ key: 'email_notifications', enabled: original }),
        })
        expect(restored.status).toBe(200)
        expect(restored.body.enabled).toBe(original)
      }

      const target = (users.body as Array<{ id: string; email: string }>).find((user) => user.email === LAWYER_EMAIL)
      if (target) {
        const roleChange = await api(page, `/api/admin/users/${target.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ role: 'admin' }),
        })
        expect(roleChange.status).toBe(400)
      }
    } finally {
      await context.close()
    }
  })
})
