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
    const clientId = clients.body.items?.find((client: { name: string }) => client.name === 'عميل اختبار آلي')?.id
    expect(clientId).toBeTruthy()

    const link = await api(page, '/api/portal-links', {
      method: 'POST',
      body: JSON.stringify({ clientId, allowUpload: true, days: 1 }),
    })
    expect(link.status).toBe(201)
    expect(link.body.url).toContain('/portal/')

    const portalPath = new URL(link.body.url).pathname
    const portalApiPath = `/api${portalPath}`
    for (const [action, code] of [
      ['pay_invoice', 'PAYMENT_PROVIDER_NOT_CONFIGURED'],
      ['sign_document', 'SIGNATURE_PROVIDER_NOT_CONFIGURED'],
      ['request_otp', 'OTP_PROVIDER_NOT_CONFIGURED'],
      ['verify_otp', 'OTP_PROVIDER_NOT_CONFIGURED'],
    ]) {
      const response = await api(page, portalApiPath, {
        method: 'POST',
        body: JSON.stringify({ action, invoiceId: 'missing', documentId: 'missing', code: '123456' }),
      })
      expect(response.status).toBe(503)
      expect(response.body.code).toBe(code)
    }

    const client = await (await browser.newContext()).newPage()
    await client.goto(portalPath)
    await client.waitForLoadState('networkidle')
    await expect(client.locator('body')).toContainText('مكتب الاختبار الآلي')

    const filePath = join(tmpdir(), 'e2e-upload.txt')
    writeFileSync(filePath, 'e2e staging upload — مرفق اختبار')
    await client.getByRole('button', { name: 'مراسلة المكتب' }).click()
    const uploadResponse = client.waitForResponse((response) => response.url().includes(portalApiPath) && response.request().method() === 'POST')
    await client.locator('input[type="file"]').setInputFiles(filePath)
    expect((await uploadResponse).status()).toBe(201)
    await client.context().close()
  })

  test('owner requests an approval and the lawyer approves it', async ({ page, browser }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const members = await api(page, '/api/memberships')
    const lawyer = members.body.find((m: { role: string }) => m.role === 'lawyer')
    expect(lawyer).toBeTruthy()

    const cases = await api(page, '/api/cases')
    // Only a non-confidential matter is safe to attach here — confidential
    // cases are invisible to members without a case assignment.
    const caseId = cases.body.items?.find((c: { confidential?: boolean }) => !c.confidential)?.id ?? cases.body.find((c: { confidential?: boolean }) => !c.confidential)?.id
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

  test('rejected case saves keep the form and entered data visible', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    await page.goto('/firm/cases')
    await page.getByRole('button', { name: /قضية جديدة|New case/ }).click()
    await page.locator('#case-title').fill('Unsaved case regression')
    await page.locator('#case-client').click()
    await page.getByRole('option', { name: 'عميل اختبار آلي', exact: true }).click()
    await page.route('**/api/cases', async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      await route.fulfill({ status: 403, json: { error: 'Case creation is unavailable for this plan' } })
    })
    await page.getByRole('button', { name: /إنشاء قضية|Create case/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.locator('#case-title')).toHaveValue('Unsaved case regression')
    await expect(page.locator('p[role="alert"]')).toContainText('Case creation is unavailable for this plan')
  })

  test('onboarding completion is rejected server-side without MFA', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const res = await api(page, '/api/saas/onboarding', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('MFA_REQUIRED')
  })

  test('onboarding recovers from a failed initial load', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    await page.route('**/api/saas/status', (route) => route.fulfill({ status: 503, json: { error: 'Unavailable' } }))
    await page.goto('/firm/onboarding')
    await expect(page.locator('p[role="alert"]')).toBeVisible()
    await page.unroute('**/api/saas/status')
    await page.getByRole('button', { name: 'إعادة المحاولة' }).click()
    await expect(page.locator('p[role="alert"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'الانتقال إلى إعداد الأمان' })).toBeVisible()
  })

  test('owner creates a client and confidential hearing matter and assigns a lawyer through the UI', async ({ page }) => {
    test.setTimeout(90_000)
    test.skip(!LAWYER_EMAIL, 'Lawyer fixture required')
    const suffix = Date.now()
    const clientName = `UI Client ${suffix}`
    const caseTitle = `UI Hearing ${suffix}`
    let clientId = ''
    let caseId = ''
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    try {
      await page.goto('/firm/clients')
      await page.getByRole('button', { name: /إضافة عميل|Add client/ }).click()
      await page.locator('#c-name').fill(clientName)
      const clientResponse = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/clients' && response.request().method() === 'POST')
      await page.getByRole('dialog').getByRole('button', { name: /إضافة عميل|Add client/ }).click()
      const clientResult = await clientResponse
      expect(clientResult.ok()).toBe(true)
      clientId = (await clientResult.json()).id
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(page.getByText(clientName, { exact: true })).toBeVisible()

      await page.goto('/firm/cases')
      await page.getByRole('button', { name: /قضية جديدة|New case/ }).click()
      await page.locator('#case-title').fill(caseTitle)
      await page.locator('#case-client').click()
      await page.getByRole('option', { name: clientName, exact: true }).click()
      await page.locator('#case-stage').click()
      await page.getByRole('option', { name: /جلسات|Hearings/, exact: true }).click()
      await page.getByRole('checkbox', { name: /قضية سرية|Confidential matter/ }).check()
      const caseResponse = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/cases' && response.request().method() === 'POST')
      await page.getByRole('button', { name: /إنشاء قضية|Create case/ }).click()
      const caseResult = await caseResponse
      expect(caseResult.ok()).toBe(true)
      const created = await caseResult.json()
      caseId = created.id
      expect(created.clientId).toBe(clientId)
      expect(created.confidential).toBe(true)
      expect(created.stage).toBe('hearing')
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(page.getByText(caseTitle, { exact: true })).toBeVisible()
      await page.reload()
      await expect(page.getByText(caseTitle, { exact: true })).toBeVisible()

      const team = await api(page, '/api/team')
      const lawyer = team.body.find((member: { email: string }) => member.email === LAWYER_EMAIL)
      expect(lawyer?.id).toBeTruthy()
      await page.goto('/firm/assignments')
      const row = page.locator('li').filter({ hasText: caseTitle })
      const assigned = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/workflow' && response.request().method() === 'POST')
      await row.getByRole('combobox').selectOption(lawyer.id)
      expect((await assigned).ok()).toBe(true)
      await expect(row.getByText(lawyer.name, { exact: false })).toBeVisible()
      await page.reload()
      await expect(page.locator('li').filter({ hasText: caseTitle }).getByText(lawyer.name, { exact: false })).toBeVisible()
    } finally {
      if (caseId) expect((await api(page, `/api/cases/${caseId}`, { method: 'DELETE' })).status).toBe(200)
      if (clientId) expect((await api(page, `/api/clients/${clientId}`, { method: 'DELETE' })).status).toBe(200)
    }
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

  test('financial operations: invoice status transitions and paid immutability', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const invoices = await api(page, '/api/invoices')
    expect(invoices.status).toBe(200)

    const paidInvoice = invoices.body.items.find((inv: { number: string }) => inv.number === 'E2E-PAID-0001')
    expect(paidInvoice).toBeTruthy()

    // Attempting to modify a paid invoice must be rejected (409 PAID_INVOICE_IMMUTABLE)
    const immutableAttempt = await api(page, `/api/invoices/${paidInvoice.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'draft' }),
    })
    expect(immutableAttempt.status).toBe(409)

    // Updating a draft invoice to sent status must succeed
    const draftInvoice = invoices.body.items.find((inv: { number: string }) => inv.number === 'E2E-DRAFT-0001')
    expect(draftInvoice).toBeTruthy()

    const sentAttempt = await api(page, `/api/invoices/${draftInvoice.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'sent' }),
    })
    expect(sentAttempt.status).toBe(200)

    // Unconfigured ZATCA Phase 2 integration must fail explicitly (503, not a silent no-op)
    const zatcaAttempt = await api(page, '/api/zatca', {
      method: 'POST',
      body: JSON.stringify({ invoiceId: draftInvoice.id }),
    })
    expect(zatcaAttempt.status).toBe(503)
  })

  test('administration: PDPPL privacy requests, data export, and audit log', async ({ page }) => {
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)

    // 1. Submit a privacy request (unique email avoids the 5/day per-email cap)
    const privacySubmit = await api(page, '/api/privacy/requests', {
      method: 'POST',
      body: JSON.stringify({
        email: `e2e-privacy-${Date.now()}@sanad.test`,
        requestType: 'access',
        details: 'E2E automated PDPPL access request test',
      }),
    })
    expect(privacySubmit.status).toBe(201)
    const requestId = privacySubmit.body.request.id
    expect(requestId).toBeTruthy()

    // 2. Admin privacy paths require an MFA-enrolled manager; the seeded owner
    // has no MFA, so these must return 403 (the boundary is the feature).
    const adminRequests = await api(page, '/api/admin/privacy/requests')
    expect(adminRequests.status).toBe(403)

    const patchRequest = await api(page, `/api/admin/privacy/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        identityVerified: true,
        status: 'completed',
        responseNotes: 'Identity verified and fulfilled in E2E suite',
      }),
    })
    expect(patchRequest.status).toBe(403)

    // 4. Self-service export works for any authenticated user, but the
    // workspace-wide sections are only included for MFA-enrolled managers.
    const exportResponse = await api(page, '/api/privacy/export', { method: 'POST' })
    expect(exportResponse.status).toBe(200)
    expect(exportResponse.body.controller).toBe('Sanad')
    expect(exportResponse.body.user).toBeTruthy()
    expect(exportResponse.body.workspace).toBeUndefined()

    // 5. Audit log listing is also behind the MFA-admin boundary.
    const auditLogs = await api(page, '/api/admin/audit-logs')
    expect(auditLogs.status).toBe(403)
  })
})
