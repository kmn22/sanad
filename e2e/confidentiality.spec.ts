import { test, expect, type Page } from '@playwright/test'

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

test.describe('confidential matter isolation', () => {
  test.skip(!authed, 'E2E credentials not set — run against staging with seed_e2e.ts fixtures')

  test('unassigned members cannot see a confidential matter until they are assigned to it', async ({ page, browser }) => {
    test.setTimeout(90_000)

    // Owner creates a confidential case plus an approval tied to it.
    await login(page, OWNER_EMAIL!, OWNER_PASSWORD!)
    const created = await api(page, '/api/cases', {
      method: 'POST',
      body: JSON.stringify({
        title: `قضية سرية E2E ${Date.now()}`,
        clientName: 'عميل اختبار آلي',
        confidential: true,
      }),
    })
    expect([200, 201]).toContain(created.status)
    const caseId = created.body.id
    expect(caseId).toBeTruthy()

    const members = await api(page, '/api/team')
    const lawyerMember = members.body?.find?.((member: { email?: string }) => member.email === LAWYER_EMAIL)
    expect(lawyerMember?.id).toBeTruthy()
    const lawyerId = lawyerMember!.id

    const approval = await api(page, '/api/approvals', {
      method: 'POST',
      body: JSON.stringify({
        title: `اعتماد قضية سرية ${Date.now()}`,
        caseId,
        approverId: lawyerId,
      }),
    })
    expect(approval.status).toBe(201)
    const approvalId = approval.body.id

    let lawyerCtx: Awaited<ReturnType<typeof browser.newContext>> | null = null
    try {
      // An unassigned lawyer must not see the case, its detail, the workflow feed, or the approval.
      lawyerCtx = await browser.newContext()
      const lawyer = await lawyerCtx.newPage()
      await login(lawyer, LAWYER_EMAIL!, OWNER_PASSWORD!)

      const cases = await api(lawyer, '/api/cases')
      expect(cases.status).toBe(200)
      const visibleIds: string[] = (cases.body.items ?? []).map((item: { id: string }) => item.id)
      expect(visibleIds).not.toContain(caseId)

      const detail = await api(lawyer, `/api/cases/${caseId}/detail`)
      expect(detail.status).toBe(404)

      const workflow = await api(lawyer, '/api/workflow')
      expect(workflow.status).toBe(200)
      const workflowCaseIds: string[] = (workflow.body.cases ?? []).map((item: { id: string }) => item.id)
      expect(workflowCaseIds).not.toContain(caseId)

      const approvals = await api(lawyer, '/api/approvals')
      expect(approvals.status).toBe(200)
      const approvalIds: string[] = (approvals.body ?? approvals.body?.items ?? []).map((item: { id: string }) => item.id)
      expect(approvalIds).not.toContain(approvalId)

      const stageChange = await api(lawyer, '/api/workflow', {
        method: 'POST',
        body: JSON.stringify({ action: 'stage', caseId, stage: 'filed' }),
      })
      expect([403, 404]).toContain(stageChange.status)

      // Assigning the lawyer to the matter grants access.
      const assign = await api(page, '/api/workflow', {
        method: 'POST',
        body: JSON.stringify({ action: 'assign', caseId, userId: lawyerId, role: 'assignee' }),
      })
      expect(assign.status).toBe(200)

      const afterCases = await api(lawyer, '/api/cases')
      const afterIds: string[] = (afterCases.body.items ?? []).map((item: { id: string }) => item.id)
      expect(afterIds).toContain(caseId)

      const afterDetail = await api(lawyer, `/api/cases/${caseId}/detail`)
      expect(afterDetail.status).toBe(200)
    } finally {
      // Always leave staging tidy, even when an assertion fails mid-flow.
      if (lawyerCtx) await lawyerCtx.close()
      await api(page, `/api/approvals/${approvalId}`, { method: 'PATCH', body: JSON.stringify({ action: 'cancel' }) })
      await api(page, `/api/cases/${caseId}`, { method: 'DELETE' })
    }
  })
})
