import { defineConfig } from '@playwright/test'

const localLibDir = '/home/khaled/.local/lib'
const ldLibraryPath = process.env.LD_LIBRARY_PATH
  ? `${localLibDir}:${process.env.LD_LIBRARY_PATH}`
  : localLibDir

export default defineConfig({
  testDir: './e2e',
  outputDir: '/tmp/maqar-playwright-results',
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
    launchOptions: {
      env: {
        ...process.env,
        LD_LIBRARY_PATH: ldLibraryPath,
      },
    },
  },
})
