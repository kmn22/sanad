import { test, expect, type Page } from '@playwright/test'
import { writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD
const LAWYER_EMAIL = process.env.E2E_LAWYER_EMAIL
const authed = OWNER_EMAIL && OWNER_PASSWORD

async function api(page: Page, path: string, init?: RequestInit) {
  return page.evaluate(async ([p, i]) => {
    const res = await fetch(p, {
      ...i,
      headers: { 'Content-Type': 'application/json', ...(i?.headers || {}) },
    })
    return { status: res.status, body: await res.json().catch(() => null) }
  }, [path, init] as const)
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.getByRole('button', { name: /تسجيل الدخول|دخول/ }).click()
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
}

test.describe('deep workspace flows', () => {
  test.skip(!authed, 'E2E credentials not set — run against staging with seed_e2e.ts fixtures')

  test('owner invites a team member who registers and signs in', async ({ page, browser }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const inviteEmail = `e2e.invited.${Date.now()}@sanad.test`
    const res = await api(page, '/api/invitations', {
      method: 'POST',
      body: JSON.stringify({ email: inviteEmail, role: 'lawyer', sendEmail: false }),
    })
    expect(res.status).toBe(201)
    expect(res.body.url).toContain('/register?invite=')

    // The invitee uses a fresh, unauthenticated context.
    const invited = await (await browser.newContext()).newPage()
    await invited.goto(new URL(res.body.url).pathname + new URL(res.body.url).search)
    await invited.locator('#reg-name').fill('عضو مدعو للاختبار')
    await invited.locator('#reg-password').fill('Sanad-E2E-Passw0rd!')
    await invited.locator('#reg-privacy').check()
    await invited.locator('#register-submit').click()
    await expect(invited.locator('body')).toContainText(/تم إنشاء الحساب|تسجيل الدخول/, { timeout: 15000 })

    await login(invited, inviteEmail, 'Sanad-E2E-Passw0rd!')
    await expect(invited.locator('body')).not.toContainText('بيانات الدخول غير صحيحة')
    await invited.context().close()
  })

  test('owner issues a client portal link and the client uploads a file', async ({ page, browser }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const clients = await api(page, '/api/clients')
    expect(clients.status).toBe(200)
    const clientId = clients.body.items?.[0]?.id ?? clients.body[0]?.id
    expect(clientId).toBeTruthy()

    const link = await api(page, '/api/portal-links', {
      method: 'POST',
      body: JSON.stringify({ clientId, allowUpload: true, days: 1 }),
    })
    expect(link.status).toBe(201)
    expect(link.body.url).toContain('/portal/')

    const client = await (await browser.newContext()).newPage()
    await client.goto(new URL(link.body.url).pathname)
    await client.waitForLoadState('networkidle')
    await expect(client.locator('body')).toContainText('عميل اختبار آلي')

    const filePath = join(tmpdir(), 'e2e-upload.txt')
    writeFileSync(filePath, 'e2e staging upload — مرفق اختبار')
    await client.getByText('الرفع', { exact: false }).first().click()
    await client.locator('input[type="file"]').setInputFiles(filePath)
    await client.getByRole('button', { name: 'رفع الملف' }).click()
    await expect(client.locator('body')).toContainText('e2e-upload.txt', { timeout: 15000 })
    await client.context().close()
  })

  test('owner requests an approval and the lawyer approves it', async ({ page, browser }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const members = await api(page, '/api/memberships')
    const lawyer = members.body.find((m: { role: string }) => m.role === 'lawyer')
    expect(lawyer).toBeTruthy()

    const cases = await api(page, '/api/cases')
    const caseId = cases.body.items?.[0]?.id ?? cases.body[0]?.id
    expect(caseId).toBeTruthy()

    const created = await api(page, '/api/approvals', {
      method: 'POST',
      body: JSON.stringify({ title: 'اعتماد اختبار E2E', approverId: lawyer.userId, caseId }),
    })
    expect(created.status).toBe(201)
    const approvalId = created.body.id ?? created.body.approval?.id
    expect(approvalId).toBeTruthy()

    const lawyerPage = await (await browser.newContext()).newPage()
    await login(lawyerPage, LAWYER_EMAIL!, OWNER_PASSWORD!)
    const decided = await api(lawyerPage, `/api/approvals/${approvalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ decision: 'approved', decisionNote: 'تمت الموافقة عبر E2E' }),
    })
    expect(decided.status).toBe(200)

    const check = await api(page, `/api/approvals`)
    const item = check.body.find((a: { id: string }) => a.id === approvalId)
    expect(item.status).toBe('approved')
    await lawyerPage.context().close()
  })

  test('feature-flag administration requires MFA', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    // The seeded owner has no MFA enrolled — flag mutation must be refused.
    const res = await api(page, '/api/admin/feature-flags', {
      method: 'PUT',
      body: JSON.stringify({ key: 'ai_drafting', enabled: false }),
    })
    expect(res.status).toBe(403)
  })
})
