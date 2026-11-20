import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { MAQAR_ENV_SPECS, auditMaqarEnvironment } from '@/lib/env-audit'

const ROOT_DIR = path.resolve(__dirname, '..')

function parseEnvExampleKeys(filePath: string): Set<string> {
  const raw = fs.readFileSync(filePath, 'utf8')
  const keys = new Set<string>()
  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*#?\s*([A-Z0-9_]+)=/)
    if (match) {
      keys.add(match[1])
    }
  }
  return keys
}

function collectCodebaseEnvUsages(dir: string, out = new Set<string>()): Set<string> {
  let entries: fs.Dirent[] = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }

  for (const entry of entries) {
    if (
      [
        '.next',
        'node_modules',
        '.git',
        'graphify-out',
        'coverage',
        'ts-state',
        'ts-config',
        'backups',
        'uploads',
      ].includes(entry.name)
    ) {
      continue
    }
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectCodebaseEnvUsages(full, out)
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8')
      const regex = /process\.env\.([A-Z0-9_]+)|process\.env\[['"]([A-Z0-9_]+)['"]\]/g
      let m: RegExpExecArray | null
      while ((m = regex.exec(content)) !== null) {
        out.add(m[1] || m[2])
      }
    }
  }
  return out
}

describe('Maqar Build Integrity, Environment Validation & Cache Purge Protocol', () => {
  it('documents every single Maqar module environment variable in .env.example', () => {
    const envExamplePath = path.join(ROOT_DIR, '.env.example')
    expect(fs.existsSync(envExamplePath)).toBe(true)

    const documentedKeys = parseEnvExampleKeys(envExamplePath)
    for (const spec of MAQAR_ENV_SPECS) {
      expect(
        documentedKeys.has(spec.key),
        `Expected ${spec.key} (${spec.category}) to be documented in .env.example`
      ).toBe(true)
    }
  })

  it('covers 100% of application process.env usages in src/ and scripts/ within .env.example', () => {
    const documentedKeys = parseEnvExampleKeys(path.join(ROOT_DIR, '.env.example'))
    const runtimeKeys = new Set<string>()
    collectCodebaseEnvUsages(path.join(ROOT_DIR, 'src'), runtimeKeys)
    collectCodebaseEnvUsages(path.join(ROOT_DIR, 'scripts'), runtimeKeys)

    // Framework-injected built-in runtime constant
    const frameworkBuiltins = new Set(['NEXT_RUNTIME', 'CI'])

    for (const key of runtimeKeys) {
      if (frameworkBuiltins.has(key)) continue
      expect(
        documentedKeys.has(key),
        `Runtime process.env.${key} is referenced in code but missing from .env.example`
      ).toBe(true)
    }
  })

  it('validates production environment variables and catches missing or placeholder secrets', () => {
    const insecureResult = auditMaqarEnvironment(
      {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://maqar:pass@localhost:5432/maqar',
        NEXTAUTH_SECRET: 'generate-a-secure-random-32-byte-secret',
        NEXTAUTH_URL: 'https://your-domain.com',
      },
      { enforceProductionSecrets: true }
    )

    expect(insecureResult.valid).toBe(false)
    expect(insecureResult.invalidFormatted).toContain('NEXTAUTH_SECRET')
    expect(insecureResult.invalidFormatted).toContain('NEXTAUTH_URL')
    expect(insecureResult.missingRequired).toContain('VAULT_MASTER_KMS_KEY')
    expect(insecureResult.missingRequired).toContain('AUDIT_LOG_HMAC_SECRET')

    const validProdResult = auditMaqarEnvironment(
      {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://maqar:strongpass@db:5432/maqar',
        VECTOR_DATABASE_URL: 'postgresql://maqar:strongpass@db:5432/maqar',
        NEXTAUTH_SECRET: 'f8d9a7b6c5e4123490abcdef1234567890abcdef12345678',
        NEXTAUTH_URL: 'https://maqar.sa',
        BACKUP_ENCRYPTION_KEY: 'prod-backup-encryption-secret-key-2026',
        MFA_ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        FILE_ENCRYPTION_KEY: 'prod-file-encryption-secret-key-2026',
        DOCUMENT_SIGNATURE_KEY: 'prod-document-signature-secret-key-2026',
        VAULT_MASTER_KMS_KEY: 'prod-vault-master-kms-secret-key-2026',
        AUDIT_LOG_HMAC_SECRET: 'prod-audit-log-hmac-secret-key-2026',
        CRON_SECRET: 'prod-cron-worker-bearer-secret-2026',
        ESIGNATURE_SIGNING_SECRET: 'prod-esignature-hmac-signing-secret-2026',
        ZATCA_ENVIRONMENT: 'production',
        ZATCA_SELLER_VAT_NUMBER: '310122393500003',
        MAQAR_USE_OPENAI_EMBEDDINGS: 'true',
        MAQAR_ENABLE_LIVE_LLM: 'false',
      },
      { enforceProductionSecrets: true }
    )

    expect(validProdResult.valid).toBe(true)
    expect(validProdResult.missingRequired).toHaveLength(0)
    expect(validProdResult.invalidFormatted).toHaveLength(0)
  })

  it('provides an executable server cache purge & rebuild script with all required protocol steps', () => {
    const scriptPath = path.join(ROOT_DIR, 'scripts', 'maqar-cache-purge-rebuild.sh')
    expect(fs.existsSync(scriptPath)).toBe(true)

    const content = fs.readFileSync(scriptPath, 'utf8')
    expect(content).toContain('.next')
    expect(content).toContain('tsconfig.tsbuildinfo')
    expect(content).toContain('npm ci')
    expect(content).toContain('npx prisma generate')
    expect(content).toContain('npx prisma migrate deploy')
    expect(content).toContain('npm run build')
    expect(content).toContain('--no-cache')
  })
})

