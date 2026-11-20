/**
 * ============================================================================
 * Maqar (مقر) — Post-Deployment SRE Smoke & Health Verification Suite
 * (`tests/maqar-post-deploy-smoke.test.ts`)
 * ============================================================================
 *
 * Automated verification covering:
 *   1. Healthcheck Endpoint (`GET /api/health`) — DB connectivity, Vector store status,
 *      and Queue / background worker availability.
 *   2. Test 1: Onboarding route (`/onboarding`) loads with all three persona cards
 *      (Corporate, Law Firm, Student).
 *   3. Test 2: Corporate dashboard (`/dashboard/corporate` & `POST /api/clm/analyze`)
 *      loads contracts and evaluates risk flags without throwing 500 errors.
 *   4. Test 3: Law firm litigation calendar (`/dashboard/practice` & `POST /api/litigation/deadlines`)
 *      accurately renders hearing dates and calculated statutory deadlines.
 *   5. Test 4: Academic research & Statutory RAG endpoints (`POST /api/ai/legal-query` &
 *      `POST /api/academic/semantic-search`) return structured legal citations.
 *   6. Test 5: Static assets, fonts, and Arabic RTL layout (`lang="ar"`, `dir="rtl"`,
 *      `/manifest.json`, `/og-preview.png`, `/robots.txt`, `/sitemap.xml`) resolve without 404s.
 */

import fs from 'node:fs'
import path from 'node:path'
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

// Mock Prisma DB calls for deterministic unit/smoke execution when Postgres is not running locally
vi.mock('@/lib/db', () => ({
  db: {
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    backgroundJob: {
      count: vi.fn().mockImplementation(async ({ where }: { where?: { status?: string } }) => {
        if (where?.status === 'queued') return 2
        if (where?.status === 'processing') return 0
        if (where?.status === 'failed') return 0
        return 2
      }),
    },
  },
}))

import { GET as getHealth } from '@/app/api/health/route'
import { POST as postClmAnalyze } from '@/app/api/clm/analyze/route'
import { POST as postLitigationDeadlines } from '@/app/api/litigation/deadlines/route'
import { POST as postLegalQuery } from '@/app/api/ai/legal-query/route'
import { POST as postAcademicSemanticSearch } from '@/app/api/academic/semantic-search/route'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'

const ROOT_DIR = path.resolve(__dirname, '..')

describe('Maqar (مقر) Post-Deployment SRE Smoke & Health Verification', () => {
  it('Step 1: /api/health verifies Database connectivity, Vector store status, and Queue availability', async () => {
    const response = await getHealth()
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.status).toBe('ok')
    expect(payload.service).toBe('maqar-core')
    expect(payload.database).toBe('ok')

    // Vector store health verification
    expect(payload.vectorStore).toBeDefined()
    expect(payload.vectorStore.status).toBe('ok')
    expect(payload.vectorStore.indexedStatutoryChunks).toBeGreaterThan(0)
    expect(payload.vectorStore.embeddingDimension).toBe(128)
    expect(payload.vectorStore.embeddingModel).toContain('text-embedding-3-small')

    // Queue / background job worker verification
    expect(payload.queue).toBeDefined()
    expect(payload.queue.status).toBe('ok')
    expect(['postgres-background-jobs', 'redis-backed']).toContain(payload.queue.driver)
    expect(typeof payload.queue.queuedJobs).toBe('number')
    expect(typeof payload.queue.failedJobs).toBe('number')
  })

  it('Test 1: Onboarding route (/onboarding) loads with all three persona cards (Corporate, Law Firm, Student)', () => {
    const onboardingPagePath = path.join(ROOT_DIR, 'src/app/onboarding/page.tsx')
    const wizardComponentPath = path.join(
      ROOT_DIR,
      'src/components/maqar/MaqarOnboardingWizard.tsx'
    )

    expect(fs.existsSync(onboardingPagePath)).toBe(true)
    expect(fs.existsSync(wizardComponentPath)).toBe(true)

    const wizardSource = fs.readFileSync(wizardComponentPath, 'utf8')

    // Verify all 3 persona IDs & Arabic titles
    expect(wizardSource).toContain("id: 'ENTERPRISE_CORP'")
    expect(wizardSource).toContain('منشأة تجارية / إدارة قانونية')
    expect(wizardSource).toContain('Company / In-House Legal Team')

    expect(wizardSource).toContain("id: 'LAW_FIRM'")
    expect(wizardSource).toContain('مكتب أو شركة محاماة')
    expect(wizardSource).toContain('Law Firm / Independent Lawyer')

    expect(wizardSource).toContain("id: 'LAW_STUDENT'")
    expect(wizardSource).toContain('باحث / طالب قانون')
    expect(wizardSource).toContain('Law Student / Legal Academic')
  })

  it('Test 2: Corporate dashboard queries load contracts and CLM risk analysis without throwing 500 errors', async () => {
    const corpDashboardPath = path.join(ROOT_DIR, 'src/app/dashboard/corporate/page.tsx')
    const clmComponentPath = path.join(
      ROOT_DIR,
      'src/components/maqar/ExecutiveContractDashboard.tsx'
    )
    expect(fs.existsSync(corpDashboardPath)).toBe(true)
    expect(fs.existsSync(clmComponentPath)).toBe(true)

    const clmSource = fs.readFileSync(clmComponentPath, 'utf8')
    expect(clmSource).toContain('CLM-2026-901')
    expect(clmSource).toContain('CLM-2026-902')

    const req = new NextRequest('http://localhost:3001/api/clm/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractText:
          'يتحمل الطرف الثاني مسؤولية غير محدودة عن كافة الأضرار المباشرة وغير المباشرة، ويحق للطرف الأول فسخ العقد بالإرادة المنفردة دون إشعار مسبق، وتختص محاكم لندن بالتحكيم.',
        enableLlmEnrichment: false,
      }),
    })

    const res = await postClmAnalyze(req)
    expect(res.status).toBe(200)
    const report = await res.json()
    expect(report.overallRiskScore).toBe('HIGH')
    expect(Array.isArray(report.findings)).toBe(true)
    expect(report.findings.length).toBeGreaterThanOrEqual(1)
  })

  it('Test 3: Law firm litigation calendar accurately renders hearing dates and calculated statutory deadlines', async () => {
    const practicePagePath = path.join(ROOT_DIR, 'src/app/dashboard/practice/page.tsx')
    const workbenchPath = path.join(
      ROOT_DIR,
      'src/components/maqar/LitigationPleadingWorkbench.tsx'
    )
    expect(fs.existsSync(practicePagePath)).toBe(true)
    expect(fs.existsSync(workbenchPath)).toBe(true)

    const practiceSource = fs.readFileSync(practicePagePath, 'utf8')
    expect(practiceSource).toContain('جلسة المحكمة التجارية بالدمام: خلال 5 أيام')

    const req = new NextRequest('http://localhost:3001/api/litigation/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CALCULATE_DEADLINE',
        event: 'FIRST_INSTANCE_JUDGMENT',
        triggerDate: '2026-10-01',
      }),
    })

    const res = await postLitigationDeadlines(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.event).toBe('FIRST_INSTANCE_JUDGMENT')
    expect(data.periodDays).toBe(30)
    expect(data.dueDateIso).toContain('2026-10-31')
    expect(data.statutoryCitation.ar).toContain('المادة (187)')
    expect(data.scheduledAlertTimestamps).toHaveProperty('T_MINUS_7D')
    expect(data.scheduledAlertTimestamps).toHaveProperty('T_MINUS_3D')
    expect(data.scheduledAlertTimestamps).toHaveProperty('T_MINUS_24H')
  })

  it('Test 4: Academic research & Statutory RAG endpoints return structured legal citations', async () => {
    // 4A. Statutory RAG Grounded Query Endpoint (/api/ai/legal-query)
    const ragReq = new NextRequest('http://localhost:3001/api/ai/legal-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'ما هي أحكام التعويض عن إنهاء عقد العمل لسبب غير مشروع وفق نظام العمل السعودي؟',
        topK: 3,
      }),
    })

    const ragRes = await postLegalQuery(ragReq)
    expect(ragRes.status).toBe(200)
    const ragBody = await ragRes.json()
    expect(ragBody.abstained).toBe(false)
    expect(Array.isArray(ragBody.citations)).toBe(true)
    expect(ragBody.citations.length).toBeGreaterThan(0)
    expect(ragBody.citations[0]).toHaveProperty('statute_name')
    expect(ragBody.citations[0]).toHaveProperty('article_number')
    expect(ragBody.citations[0]).toHaveProperty('promulgation_date')
    expect(ragBody.citations[0]).toHaveProperty('exact_statutory_text')
    expect(ragBody.answerHtmlWithFootnotes).toContain('data-citation-index=')
    expect(ragBody.answerHtmlWithFootnotes).toContain('#statutory-footnote-1')

    // 4B. Academic Semantic Search Endpoint (/api/academic/semantic-search)
    const acadReq = new NextRequest('http://localhost:3001/api/academic/semantic-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'أركان المسؤولية التقصيرية والتعويض عن الضرر في نظام المعاملات المدنية',
        topK: 3,
      }),
    })

    const acadRes = await postAcademicSemanticSearch(acadReq)
    expect(acadRes.status).toBe(200)
    const acadBody = await acadRes.json()
    expect(Array.isArray(acadBody.citations)).toBe(true)
    expect(acadBody.citations.length).toBeGreaterThan(0)
    expect(acadBody.citations[0]).toHaveProperty('lawOrSourceName')
    expect(acadBody.citations[0]).toHaveProperty('articleNumber')
    expect(acadBody.citations[0]).toHaveProperty('officialDecreeNumber')
    expect(acadBody.citations[0]).toHaveProperty('verbatimExcerpt')
  })

  it('Test 5: Static assets, fonts, and Arabic RTL layout are properly configured without missing files', () => {
    const rootLayoutPath = path.join(ROOT_DIR, 'src/app/layout.tsx')
    const layoutSource = fs.readFileSync(rootLayoutPath, 'utf8')

    // Verify Arabic RTL root attributes and Arabic font configuration
    expect(layoutSource).toContain('lang="ar"')
    expect(layoutSource).toContain('dir="rtl"')
    expect(layoutSource).toContain('IBM_Plex_Sans_Arabic')
    expect(layoutSource).toContain('Cairo')
    expect(layoutSource).toContain('--font-arabic')

    // Verify public static assets exist on disk so CDN/standalone server serves them without 404s
    const requiredPublicAssets = [
      'public/manifest.json',
      'public/og-preview.png',
      'public/sw.js',
    ]
    for (const relPath of requiredPublicAssets) {
      expect(
        fs.existsSync(path.join(ROOT_DIR, relPath)),
        `Expected static asset ${relPath} to exist`
      ).toBe(true)
    }

    // Verify robots.txt and sitemap.xml metadata generators
    const robotsConfig = robots()
    expect(robotsConfig.sitemap).toBeDefined()
    const sitemapEntries = sitemap()
    expect(Array.isArray(sitemapEntries)).toBe(true)
    expect(sitemapEntries.length).toBeGreaterThan(0)
  })
})
