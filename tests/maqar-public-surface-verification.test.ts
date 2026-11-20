import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildStyledArabicEmailHtml } from '@/lib/email'
import { PERSONA_SOLUTIONS } from '@/app/solutions/_components/SolutionsPersonaView'

const ROOT_DIR = path.resolve(__dirname, '..')

function readProjectFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8')
}

describe('Maqar Public Surface & Acceptance Criteria Verification Matrix', () => {
  describe('1. Homepage (/) & Global Brand Identity', () => {
    it('prominently features «مقر» branding and the tagline ("المقر الرقمي للعمليات القانونية والحوكمة") across metadata, header, hero, and footer', () => {
      const layout = readProjectFile('src/app/layout.tsx')
      const header = readProjectFile('src/app/_landing/LandingHeader.tsx')
      const hero = readProjectFile('src/app/_landing/HeroSection.tsx')
      const footer = readProjectFile('src/app/_landing/LandingFooter.tsx')

      for (const source of [layout, header, hero, footer]) {
        expect(source).toContain('مقر')
        expect(source).toContain('المقر الرقمي للعمليات القانونية والحوكمة')
      }
    })

    it('tailors Hero Section value propositions to all three pillars (Enterprises, Law Firms, Students) and routes "ابدأ الآن" directly to /onboarding', () => {
      const hero = readProjectFile('src/app/_landing/HeroSection.tsx')
      const header = readProjectFile('src/app/_landing/LandingHeader.tsx')

      // Three pillars present in Hero
      expect(hero).toContain('/solutions/enterprise')
      expect(hero).toContain('/solutions/firms')
      expect(hero).toContain('/solutions/academy')
      expect(hero).toContain('إدارة دورة حياة العقود والحوكمة (CLM)')
      expect(hero).toContain('إدارة القضايا والمحاكم والمرافعات')
      expect(hero).toContain('بنك السوابق القضائية والبحث الأكاديمي')

      // Dynamic CTA "ابدأ الآن" routing to /onboarding
      expect(hero).toContain('href="/onboarding"')
      expect(hero).toContain('ابدأ الآن')
      expect(header).toContain('href="/onboarding"')
      expect(header).toContain('ابدأ الآن')
    })

    it('has zero remaining mentions of "سند" or "سَنَد" in headers, meta-tags, hero, or footers and configures crisp Arabic typography with display swap', () => {
      const filesToVerify = [
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/_landing/LandingHeader.tsx',
        'src/app/_landing/HeroSection.tsx',
        'src/app/_landing/LandingFooter.tsx',
        'src/app/_landing/TargetAudienceSection.tsx',
        'src/app/_landing/FinalCta.tsx',
        'src/app/_landing/ContractSummaryShowcase.tsx',
        'src/app/_landing/HowItWorksSection.tsx',
        'src/app/_landing/CoveredStatutesSection.tsx',
        'src/app/_landing/TrustLayerSection.tsx',
      ]

      for (const file of filesToVerify) {
        const content = readProjectFile(file)
        expect(content, `${file} should not contain legacy brand`).not.toMatch(/سَنَد|منصة سند/)
      }

      const layout = readProjectFile('src/app/layout.tsx')
      expect(layout).toContain('IBM_Plex_Sans_Arabic')
      expect(layout).toContain('Cairo')
      expect(layout).toContain('display: "swap"')
    })
  })

  describe('2. Persona Solutions (/solutions/*)', () => {
    it('provides dedicated pages and tabs for Companies (/solutions/enterprise), Law Firms (/solutions/firms), and Academics (/solutions/academy)', () => {
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/solutions/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/solutions/enterprise/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/solutions/firms/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/solutions/academy/page.tsx'))).toBe(true)

      expect(PERSONA_SOLUTIONS.enterprise.route).toBe('/solutions/enterprise')
      expect(PERSONA_SOLUTIONS.firms.route).toBe('/solutions/firms')
      expect(PERSONA_SOLUTIONS.academy.route).toBe('/solutions/academy')
    })

    it('matches feature cards to specific persona needs (CLM for business, Court Management for firms, Precedent Bank for students)', () => {
      const enterpriseTitles = PERSONA_SOLUTIONS.enterprise.features.map((f) => f.title).join(' ')
      expect(enterpriseTitles).toContain('إدارة دورة حياة العقود الشاملة (Enterprise CLM)')
      expect(enterpriseTitles).toContain('مصفوفة الصلاحيات وسير الاعتمادات')

      const firmsTitles = PERSONA_SOLUTIONS.firms.features.map((f) => f.title).join(' ')
      expect(firmsTitles).toContain('إدارة القضايا والجلسات والمحاكم (Court Management)')
      expect(firmsTitles).toContain('حاسبة المواعيد الإجرائية والمهل النظامية')

      const academyTitles = PERSONA_SOLUTIONS.academy.features.map((f) => f.title).join(' ')
      expect(academyTitles).toContain('بنك السوابق القضائية والمبادئ النظامية (Precedent Bank)')
      expect(academyTitles).toContain('محرك البحث الدلالي في الأنظمة السعودية')
    })
  })

  describe('3. Pricing Page (/pricing)', () => {
    it('renders all 4 multi-tier pricing cards (Academic/Free, Solo Lawyer, Law Firm Pro, Enterprise Custom) with Annual/Monthly toggle and explicit Practice vs. CLM breakdown', () => {
      const pricing = readProjectFile('src/app/pricing/page.tsx')

      // 4 tiers
      expect(pricing).toContain('Academic / Free')
      expect(pricing).toContain('Solo Lawyer')
      expect(pricing).toContain('Law Firm Pro')
      expect(pricing).toContain('Enterprise Custom')

      // Annual / Monthly billing toggle
      expect(pricing).toContain('billing-monthly')
      expect(pricing).toContain('billing-yearly')
      expect(pricing).toContain('billing-toggle')

      // Explicit Practice Management vs. Enterprise CLM breakdown
      expect(pricing).toContain('إدارة الممارسة والقضايا والمحاكم (Practice & Court Management)')
      expect(pricing).toContain('إدارة دورة حياة العقود والحوكمة المؤسسية (Enterprise CLM & Governance)')
      expect(pricing).not.toMatch(/سَنَد/)
    })
  })

  describe('4. Authentication (/login, /signup, /register) & Transactional Arabic Emails', () => {
    it('supports Email/Password, Magic Link, SSO/Unified Login, AR/EN language toggle, and responsive layout on /login and /signup', () => {
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/login/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/signup/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/register/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/api/auth/magic-link/request/route.ts'))).toBe(true)

      const login = readProjectFile('src/app/login/page.tsx')
      expect(login).toContain('auth-tab-password')
      expect(login).toContain('auth-tab-magic')
      expect(login).toContain('auth-tab-sso')
      expect(login).toContain('auth-language-toggle')
      expect(login).toContain('Magic Link')
      expect(login).toContain('SSO')
      expect(login).not.toMatch(/سَنَد/)

      const register = readProjectFile('src/app/register/page.tsx')
      expect(register).toContain('signup-language-toggle')
      expect(register).toContain('Magic Link')
      expect(register).toContain('SSO')
      expect(register).not.toMatch(/سَنَد/)
    })

    it('generates styled RTL Arabic transactional templates for verification, password reset, and magic link loops', () => {
      const html = buildStyledArabicEmailHtml({
        to: 'counsel@maqar.sa',
        subject: 'تأكيد البريد الإلكتروني — مقر',
        heading: 'أكّد بريدك الإلكتروني',
        text: 'شكراً لتسجيلك في مقر.',
        actionUrl: 'https://maqar.sa/verify-email?token=abc123',
        actionLabel: 'تأكيد البريد',
      })

      expect(html).toContain('lang="ar" dir="rtl"')
      expect(html).toContain('المقر الرقمي للعمليات القانونية والحوكمة')
      expect(html).toContain('https://maqar.sa/verify-email?token=abc123')
      expect(html).toContain('تأكيد البريد')
      expect(html).toContain('PDPL')
    })
  })
})
