import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildStyledArabicEmailHtml } from '@/lib/email'

const ROOT_DIR = path.resolve(__dirname, '..')

function readProjectFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8')
}

describe('Maqar Public Surface & Scope Verification Matrix', () => {
  describe('1. Homepage (/) & Solo/Small-Office Brand Identity', () => {
    it('prominently features «مقر» solo lawyer and small office positioning across metadata, header, hero, and footer', () => {
      const layout = readProjectFile('src/app/layout.tsx')
      const header = readProjectFile('src/app/_landing/LandingHeader.tsx')
      const hero = readProjectFile('src/app/_landing/HeroSection.tsx')
      const footer = readProjectFile('src/app/_landing/LandingFooter.tsx')

      for (const source of [layout, header, hero, footer]) {
        expect(source).toContain('مقر')
      }
      expect(hero).toContain('١–١٠ مقاعد')
      expect(hero).toContain('href="/register"')
      expect(header).toContain('href="/register"')
    })

    it('removes dead cut routes and leftover Sanad brand strings from public landing components', () => {
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
        'src/app/_landing/TrustLayerSection.tsx',
        'src/app/_landing/UnderConstructionSection.tsx',
      ]

      for (const file of filesToVerify) {
        const content = readProjectFile(file)
        expect(content, `${file} should not contain legacy brand`).not.toMatch(/سَنَد|منصة سند/)
        expect(content, `${file} should not link to cut routes`).not.toMatch(/\/(solutions|onboarding|sandbox|build|student)/)
      }

      const layout = readProjectFile('src/app/layout.tsx')
      expect(layout).toContain('IBM_Plex_Sans_Arabic')
      expect(layout).toContain('Cairo')
      expect(layout).toContain('display: "swap"')
    })
  })

  describe('2. Pricing Page (/pricing)', () => {
    it('renders the 2 Saudi tiers (Solo Lawyer 199 SAR, Small Office 449 SAR) with Annual/Monthly toggle and honest fee-statement disclosure', () => {
      const pricing = readProjectFile('src/app/pricing/page.tsx')

      expect(pricing).toContain('pricing-tier-solo')
      expect(pricing).toContain('pricing-tier-office')
      expect(pricing).toContain('199')
      expect(pricing).toContain('449')
      expect(pricing).toContain('billing-monthly')
      expect(pricing).toContain('billing-yearly')
      expect(pricing).toContain('billing-toggle')
      expect(pricing).not.toMatch(/سَنَد/)
      expect(pricing).not.toContain('Enterprise Custom')
      expect(pricing).not.toContain('Academic / Free')
    })
  })

  describe('3. Authentication (/login, /signup, /register) & Transactional Arabic Emails', () => {
    it('supports Email/Password + TOTP MFA on /login and Solo Lawyer / Law Firm signup on /register without stub tabs', () => {
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/login/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/signup/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/register/page.tsx'))).toBe(true)
      expect(fs.existsSync(path.join(ROOT_DIR, 'src/app/api/auth/magic-link/request/route.ts'))).toBe(false)

      const login = readProjectFile('src/app/login/page.tsx')
      expect(login).toContain('auth-language-toggle')
      expect(login).toContain('login-otp')
      expect(login).not.toContain('auth-tab-magic')
      expect(login).not.toContain('auth-tab-sso')
      expect(login).not.toMatch(/سَنَد/)

      const register = readProjectFile('src/app/register/page.tsx')
      expect(register).toContain('signup-language-toggle')
      expect(register).toContain("'lawyer'")
      expect(register).toContain("'firm'")
      expect(register).not.toContain("'student'")
      expect(register).not.toContain('Magic Link')
      expect(register).not.toMatch(/سَنَد/)
    })

    it('generates styled RTL Arabic transactional templates', () => {
      const html = buildStyledArabicEmailHtml({
        to: 'counsel@maqar.sa',
        subject: 'تأكيد البريد الإلكتروني — مقر',
        heading: 'أكّد بريدك الإلكتروني',
        text: 'شكراً لتسجيلك في مقر.',
        actionUrl: 'https://maqar.sa/verify-email?token=abc123',
        actionLabel: 'تأكيد البريد',
      })

      expect(html).toContain('lang="ar" dir="rtl"')
      expect(html).toContain('https://maqar.sa/verify-email?token=abc123')
      expect(html).toContain('تأكيد البريد')
      expect(html).toContain('PDPL')
    })
  })
})
