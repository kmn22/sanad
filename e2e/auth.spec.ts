import { test, expect } from '@playwright/test'

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD
const LAWYER_EMAIL = process.env.E2E_LAWYER_EMAIL
const authed = OWNER_EMAIL && OWNER_PASSWORD

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.getByRole('button', { name: /تسجيل الدخول|دخول/ }).click()
  // Credentials sign-in is client-side; wait until the router pushes us off /login
  // so the session cookie is guaranteed to be set before further navigation.
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
}

test.describe('authenticated workspace experience', () => {
  test.skip(!authed, 'E2E_OWNER_EMAIL/E2E_OWNER_PASSWORD not set — run against staging with seed_e2e.ts fixtures')

  test('owner signs in and reaches an authenticated portal', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
    await expect(page.locator('body')).not.toContainText('بيانات الدخول غير صحيحة')
  })

  test('owner can open the firm portal', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    await page.goto('/firm')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toContainText('تسجيل الدخول')
  })

  test('owner can open the workflow center', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    await page.goto('/workflow')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toContainText('تسجيل الدخول')
  })

  test('authenticated API returns workspace SaaS status', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const { status, body } = await page.evaluate(async () => {
      const res = await fetch('/api/saas/status')
      return { status: res.status, body: await res.json() }
    })
    expect(status).toBe(200)
    expect(body).toHaveProperty('subscription')
    expect(body).toHaveProperty('usage')
  })

  test('ZATCA submission never reports clearance without a provider', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const result = await page.evaluate(async () => {
      const response = await fetch('/api/zatca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: 'e2e-not-a-real-invoice' }),
      })
      return { status: response.status, body: await response.json() }
    })
    expect(result.status).toBe(503)
    expect(result.body.code).toBe('ZATCA_PROVIDER_NOT_CONFIGURED')
  })

  test('invoice settlement requires finance roles and paid invoices cannot be deleted', async ({ page, browser }) => {
    test.skip(!LAWYER_EMAIL, 'E2E_LAWYER_EMAIL not set')
    const lawyer = await (await browser.newContext()).newPage()
    await login(lawyer, LAWYER_EMAIL!, OWNER_PASSWORD!)
    const lawyerInvoices = await lawyer.evaluate(async () => {
      const response = await fetch('/api/invoices')
      return response.json()
    })
    const draft = lawyerInvoices.items.find((invoice: { number: string }) => invoice.number === 'E2E-DRAFT-0001')
    expect(draft).toBeTruthy()
    const forbiddenSettlement = await lawyer.evaluate(async (invoiceId) => {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })
      return response.status
    }, draft.id)
    expect(forbiddenSettlement).toBe(403)
    await lawyer.context().close()

    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const ownerInvoices = await page.evaluate(async () => {
      const response = await fetch('/api/invoices')
      return response.json()
    })
    const paid = ownerInvoices.items.find((invoice: { number: string }) => invoice.number === 'E2E-PAID-0001')
    expect(paid).toBeTruthy()
    const rejectedDelete = await page.evaluate(async (invoiceId) => {
      const response = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      return { status: response.status, body: await response.json() }
    }, paid.id)
    expect(rejectedDelete.status).toBe(409)
    expect(rejectedDelete.body.code).toBe('PAID_INVOICE_IMMUTABLE')
    const rejectedCorrection = await page.evaluate(async (invoiceId) => {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: 999 }),
      })
      return { status: response.status, body: await response.json() }
    }, paid.id)
    expect(rejectedCorrection.status).toBe(409)
    expect(rejectedCorrection.body.code).toBe('PAID_INVOICE_IMMUTABLE')
  })

  test('wrong password is rejected with an inline error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-email').fill(OWNER_EMAIL!)
    await page.locator('#login-password').fill('definitely-wrong-password')
    await page.getByRole('button', { name: /تسجيل الدخول|دخول/ }).click()
    await expect(page.locator('body')).toContainText('بيانات الدخول غير صحيحة', { timeout: 10000 })
  })
})
