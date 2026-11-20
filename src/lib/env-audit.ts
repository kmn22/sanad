/**
 * ============================================================================
 * Maqar (مقر) — Runtime Environment Audit & Startup Validation
 * (`src/lib/env-audit.ts`)
 * ============================================================================
 */

export type EnvModuleCategory =
  | 'DATABASE'
  | 'AUTH_AND_TENANT_ISOLATION'
  | 'CRYPTO_AND_PDPL_VAULT'
  | 'AI_OPTIONAL'
  | 'NOTIFICATIONS_AND_CRON'
  | 'EMAIL_AND_OBSERVABILITY'

export interface EnvVarSpec {
  key: string
  category: EnvModuleCategory
  requiredInProduction: boolean
  description: string
  formatValidator?: (val: string) => boolean
  formatHint?: string
}

const isUrl = (v: string): boolean => {
  try {
    const u = new URL(v)
    return (
      (u.protocol === 'http:' || u.protocol === 'https:') &&
      !u.hostname.includes('your-domain.com')
    )
  } catch {
    return false
  }
}

const isPostgresUrl = (v: string): boolean =>
  /^postgres(ql)?:\/\/.+/i.test(v)

const isStrongSecret = (v: string): boolean =>
  v.trim().length >= 16 &&
  !v.includes('generate-a-') &&
  !v.includes('your-domain.com')

export const MAQAR_ENV_SPECS: readonly EnvVarSpec[] = [
  // 1. Database
  {
    key: 'DATABASE_URL',
    category: 'DATABASE',
    requiredInProduction: true,
    description: 'Primary PostgreSQL connection string for multi-tenant practice data',
    formatValidator: isPostgresUrl,
    formatHint: 'postgresql://user:pass@host:5432/db',
  },

  // 2. Authentication & Session
  {
    key: 'NEXTAUTH_SECRET',
    category: 'AUTH_AND_TENANT_ISOLATION',
    requiredInProduction: true,
    description: 'High-entropy NextAuth JWT/session signing key (min 32 bytes)',
    formatValidator: isStrongSecret,
    formatHint: 'hex or base64 random secret (>= 16 chars)',
  },
  {
    key: 'NEXTAUTH_URL',
    category: 'AUTH_AND_TENANT_ISOLATION',
    requiredInProduction: true,
    description: 'Canonical public application URL for NextAuth callbacks & CORS',
    formatValidator: isUrl,
    formatHint: 'https://maqar.sa',
  },
  {
    key: 'PLATFORM_ADMIN_EMAILS',
    category: 'AUTH_AND_TENANT_ISOLATION',
    requiredInProduction: false,
    description: 'Comma-separated list of platform operator admin emails',
  },

  // 3. Encryption & Audit Keys
  {
    key: 'BACKUP_ENCRYPTION_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'AES-256 backup archive encryption key',
    formatValidator: isStrongSecret,
  },
  {
    key: 'MFA_ENCRYPTION_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: '32-byte hex/base64 encryption key for user TOTP MFA secrets',
    formatValidator: (v) => v.trim().length >= 32 && !v.includes('generate-a-'),
    formatHint: '64 hex chars (32 bytes)',
  },
  {
    key: 'FILE_ENCRYPTION_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'Encryption key for uploaded files and case attachments',
    formatValidator: isStrongSecret,
  },
  {
    key: 'DOCUMENT_SIGNATURE_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'HMAC-SHA256 integrity key for document checksum verification',
    formatValidator: isStrongSecret,
  },
  {
    key: 'VAULT_MASTER_KMS_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'Master root secret for HKDF tenant Key Encryption Keys (KEK) in Legal Vaults',
    formatValidator: isStrongSecret,
  },
  {
    key: 'AUDIT_LOG_HMAC_SECRET',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'HMAC-SHA256 key chaining Immutable Audit Log records',
    formatValidator: isStrongSecret,
  },
  {
    key: 'UPLOAD_ROOT',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: false,
    description: 'Filesystem path for encrypted uploads storage',
  },

  // 4. Optional Workspace AI (Ollama)
  {
    key: 'OLLAMA_URL',
    category: 'AI_OPTIONAL',
    requiredInProduction: false,
    description: 'Self-hosted Ollama server endpoint URL for authenticated draft assistance',
    formatValidator: isUrl,
  },
  {
    key: 'OLLAMA_MODEL',
    category: 'AI_OPTIONAL',
    requiredInProduction: false,
    description: 'Ollama model identifier for workspace drafting and analysis',
  },

  // 5. Notifications, Cache & Scheduled Jobs
  {
    key: 'CRON_SECRET',
    category: 'NOTIFICATIONS_AND_CRON',
    requiredInProduction: true,
    description: 'Bearer / X-Cron-Secret authentication key protecting /api/cron/* endpoints',
    formatValidator: isStrongSecret,
  },
  {
    key: 'REDIS_URL',
    category: 'NOTIFICATIONS_AND_CRON',
    requiredInProduction: false,
    description: 'Optional Redis URL for distributed rate limiting',
  },
  {
    key: 'WHATSAPP_BUSINESS_API_URL',
    category: 'NOTIFICATIONS_AND_CRON',
    requiredInProduction: false,
    description: 'Meta WhatsApp Cloud API endpoint URL (optional)',
    formatValidator: isUrl,
  },
  {
    key: 'WHATSAPP_ACCESS_TOKEN',
    category: 'NOTIFICATIONS_AND_CRON',
    requiredInProduction: false,
    description: 'Meta WhatsApp Business API access token (optional)',
  },

  // 6. Email, Observability & Beta Controls
  {
    key: 'SMTP_HOST',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'SMTP relay hostname',
  },
  {
    key: 'SMTP_PORT',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'SMTP relay port (e.g. 587 or 465)',
    formatValidator: (v) => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= 65535,
  },
  {
    key: 'SMTP_SECURE',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'Use TLS for SMTP connection (true/false)',
  },
  {
    key: 'SMTP_USER',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'SMTP authentication username',
  },
  {
    key: 'SMTP_PASSWORD',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'SMTP authentication password',
  },
  {
    key: 'EMAIL_FROM',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'RFC 5322 sender address for transactional emails',
  },
  {
    key: 'SENTRY_DSN',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'Sentry error reporting DSN',
  },
  {
    key: 'BETA_MAX_WORKSPACES',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'Maximum active workspaces allowed during beta (0 = unlimited)',
  },
  {
    key: 'BETA_AI_DAILY_LIMIT',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'Daily per-workspace AI request cap (0 = plan default)',
  },
  {
    key: 'ENABLE_DEMO_PORTAL',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'Enable demo portal token outside production (true/false)',
  },
  {
    key: 'MAQAR_ALLOW_DESTRUCTIVE_SEED',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'Explicit opt-in required to run scripts/seed.ts locally (1)',
  },
  {
    key: 'SEED_WORKSPACE_ID',
    category: 'EMAIL_AND_OBSERVABILITY',
    requiredInProduction: false,
    description: 'Target workspace ID for scripts/seed_clients.ts',
  },
] as const

export interface EnvAuditIssue {
  key: string
  category: EnvModuleCategory
  severity: 'ERROR' | 'WARNING'
  reason: string
}

export interface EnvAuditResult {
  valid: boolean
  checkedCount: number
  missingRequired: string[]
  invalidFormatted: string[]
  issues: EnvAuditIssue[]
}

/**
 * Validates an environment dictionary (defaults to `process.env`) against
 * `MAQAR_ENV_SPECS`.
 */
export function auditMaqarEnvironment(
  env: Record<string, string | undefined> = process.env,
  options: { enforceProductionSecrets?: boolean } = {}
): EnvAuditResult {
  const enforceProd = options.enforceProductionSecrets ?? env.NODE_ENV === 'production'
  const missingRequired: string[] = []
  const invalidFormatted: string[] = []
  const issues: EnvAuditIssue[] = []

  for (const spec of MAQAR_ENV_SPECS) {
    const rawVal = env[spec.key]?.trim()

    if (!rawVal) {
      if (spec.requiredInProduction) {
        missingRequired.push(spec.key)
        issues.push({
          key: spec.key,
          category: spec.category,
          severity: enforceProd ? 'ERROR' : 'WARNING',
          reason: `Missing required production environment variable: ${spec.description}`,
        })
      }
      continue
    }

    if (spec.formatValidator && !spec.formatValidator(rawVal)) {
      invalidFormatted.push(spec.key)
      issues.push({
        key: spec.key,
        category: spec.category,
        severity: enforceProd && spec.requiredInProduction ? 'ERROR' : 'WARNING',
        reason: `Invalid format or placeholder value for ${spec.key}${
          spec.formatHint ? ` (expected ${spec.formatHint})` : ''
        }`,
      })
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'ERROR')
  return {
    valid: !hasErrors,
    checkedCount: MAQAR_ENV_SPECS.length,
    missingRequired,
    invalidFormatted,
    issues,
  }
}
