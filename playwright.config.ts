import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: 4,
  reporter: 'list',
  use: {
    // Defaults to staging — the E2E suite mutates data and must never
    // silently run against production. Pass E2E_BASE_URL to override.
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3101',
    locale: 'ar-SA',
    trace: 'retain-on-failure',
  },
})
