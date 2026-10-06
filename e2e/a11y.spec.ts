import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD

async function scan(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  return results.violations
}

test.describe('accessibility (WCAG 2.1 A/AA)', () => {
  test('landing page has no serious violations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const violations = await scan(page)
    const serious = violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))
    expect(serious, JSON.stringify(serious.map((v) => [v.id, v.impact, v.nodes.length]))).toEqual([])
  })

  test('login page has no serious violations', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const violations = await scan(page)
    const serious = violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))
    expect(serious, JSON.stringify(serious.map((v) => [v.id, v.impact, v.nodes.length]))).toEqual([])
  })

  test('firm portal has no serious violations', async ({ page }) => {
    test.skip(!OWNER_EMAIL || !OWNER_PASSWORD, 'E2E credentials not set')
    await page.goto('/login')
    await page.locator('#login-email').fill(OWNER_EMAIL!)
    await page.locator('#login-password').fill(OWNER_PASSWORD!)
    await page.getByRole('button', { name: /تسجيل الدخول|دخول/ }).click()
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
    await page.goto('/firm')
    await page.waitForLoadState('networkidle')
    const violations = await scan(page)
    const serious = violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))
    expect(serious, JSON.stringify(serious.map((v) => [v.id, v.impact, v.nodes.length]))).toEqual([])
  })
})
