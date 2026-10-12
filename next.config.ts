import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // file-storage.ts resolves upload paths from env at runtime, which makes
  // Turbopack trace the whole project into the standalone output. Exclude the
  // non-runtime directories explicitly to keep the deployed image lean.
  outputFileTracingExcludes: {
    "/*": [
      "./src/**",
      "./e2e/**",
      "./tests/**",
      "./scripts/**",
      "./backups/**",
      "./logs/**",
      "./download/**",
      "./db/**",
      "./ts-state/**",
      "./ts-config/**",
      "./docs/**",
      "./tool-results/**",
           "./uploads/**",
      "./upload/**",
      "./*.pdf",
      "./*.log",
      "./AGENTS.md",
      "./CLAUDE.md",
      "./PITCH.md",
      "./README.md",
      "./Dockerfile",
      "./docker-compose*.yml",
      "./docker-*.sh",
      "./tsconfig*",
      "./package-lock.json",
      "./eslint.config.mjs",
      "./playwright.config.ts",
      "./postcss.config.mjs",
      "./tailwind.config.ts",
      "./vitest.config.mts",
      "./components.json",
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // upgrade-insecure-requests and HSTS are applied conditionally in
          // src/proxy.ts for HTTPS requests only — on plain-HTTP origins
          // (localhost/LAN) they force http fetches to https and break the app.
          { key: 'Content-Security-Policy', value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; manifest-src 'self'" },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

export default nextConfig
