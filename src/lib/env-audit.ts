/**
 * ============================================================================
 * Maqar (مقر) — Runtime Environment Variable Schema & Release Validator
 * (`src/lib/env-audit.ts`)
 * ============================================================================
 *
 * Centralizes validation of all Maqar server environment variables across:
 *   1. Database & Vector Store (`DATABASE_URL`, `VECTOR_DATABASE_URL`)
 *   2. Authentication & Multi-Tenant Governance (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `PLATFORM_ADMIN_EMAILS`)
 *   3. Sovereign Cryptographic Vault & WORM Audit Log (`BACKUP_ENCRYPTION_KEY`, `MFA_ENCRYPTION_KEY`,
 *      `FILE_ENCRYPTION_KEY`, `DOCUMENT_SIGNATURE_KEY`, `VAULT_MASTER_KMS_KEY`, `AUDIT_LOG_HMAC_SECRET`)
 *   4. AI & Statutory RAG (`OPENAI_API_KEY`, `OPENAI_EMBEDDING_MODEL`, `MAQAR_USE_OPENAI_EMBEDDINGS`,
 *      `MAQAR_ENABLE_LIVE_LLM`, `OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_HOST_URL`)
 *   5. Automated Procedural Notifications & Webhooks (`CRON_SECRET`, `WHATSAPP_BUSINESS_API_URL`,
 *      `WHATSAPP_ACCESS_TOKEN`, `SMS_PROVIDER_API_URL`, `SMS_PROVIDER_API_KEY`, `SMS_SENDER_ID`,
 *      `TRANSACTIONAL_EMAIL_WEBHOOK_URL`, `TRANSACTIONAL_EMAIL_API_KEY`, `MAQAR_MESSAGING_WEBHOOK_URL`,
 *      `NAJIZ_WEBHOOK_SECRET`)
 *   6. E-Signature Service (`ESIGNATURE_SIGNING_SECRET`, `NAFATH_SIGN_API_URL`, `NAFATH_CLIENT_ID`,
 *      `DOCUSIGN_BASE_URL`, `DOCUSIGN_INTEGRATION_KEY`)
 *   7. ZATCA Fatoora Phase-2 & Billing (`ZATCA_ENVIRONMENT`, `ZATCA_API_BASE_URL`,
 *      `ZATCA_SELLER_VAT_NUMBER`, `ZATCA_CSID_PUBLIC_KEY`, `ZATCA_CSID_PRIVATE_KEY`,
 *      `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
 */

export type EnvModuleCategory =
  | 'DATABASE_AND_VECTOR'
  | 'AUTH_AND_TENANT_ISOLATION'
  | 'CRYPTO_AND_PDPL_VAULT'
  | 'AI_AND_STATUTORY_RAG'
  | 'PROCEDURAL_NOTIFICATIONS'
  | 'ESIGNATURE'
  | 'ZATCA_AND_BILLING'
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

const isZatcaVat = (v: string): boolean => /^3\d{13}3$/.test(v.trim())

export const MAQAR_ENV_SPECS: readonly EnvVarSpec[] = [
  // 1. Database & Vector Store
  {
    key: 'DATABASE_URL',
    category: 'DATABASE_AND_VECTOR',
    requiredInProduction: true,
    description: 'Primary PostgreSQL connection string for Prisma ORM',
    formatValidator: isPostgresUrl,
    formatHint: 'postgresql://user:pass@host:5432/dbname',
  },
  {
    key: 'VECTOR_DATABASE_URL',
    category: 'DATABASE_AND_VECTOR',
    requiredInProduction: false,
    description: 'PostgreSQL pgvector / Supabase Vector connection string for Statutory RAG',
    formatValidator: isPostgresUrl,
    formatHint: 'postgresql://user:pass@host:5432/dbname',
  },

  // 2. Authentication & Multi-Tenant Governance
  {
    key: 'NEXTAUTH_SECRET',
    category: 'AUTH_AND_TENANT_ISOLATION',
    requiredInProduction: true,
    description: 'NextAuth JWT encryption & signing secret (minimum 32 bytes recommended)',
    formatValidator: isStrongSecret,
    formatHint: '32+ character high-entropy random secret',
  },
  {
    key: 'NEXTAUTH_URL',
    category: 'AUTH_AND_TENANT_ISOLATION',
    requiredInProduction: true,
    description: 'Canonical public origin URL of the Maqar deployment',
    formatValidator: isUrl,
    formatHint: 'https://maqar.sa',
  },
  {
    key: 'PLATFORM_ADMIN_EMAILS',
    category: 'AUTH_AND_TENANT_ISOLATION',
    requiredInProduction: false,
    description: 'Comma-separated allowlist of platform operator emails allowed cross-tenant inspection',
  },

  // 3. Cryptographic Keys & Sovereign Legal Vault Security (PDPL / CCC-2)
  {
    key: 'BACKUP_ENCRYPTION_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'AES-256 encryption passphrase for PostgreSQL automated backups',
    formatValidator: isStrongSecret,
  },
  {
    key: 'MFA_ENCRYPTION_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'AES-256-GCM key for encrypting user TOTP secrets at rest',
    formatValidator: isStrongSecret,
  },
  {
    key: 'FILE_ENCRYPTION_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'Key for encrypting uploaded workspace documents at rest',
    formatValidator: isStrongSecret,
  },
  {
    key: 'DOCUMENT_SIGNATURE_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'HMAC signing secret for document integrity and version verification',
    formatValidator: isStrongSecret,
  },
  {
    key: 'VAULT_MASTER_KMS_KEY',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'Master root key for HKDF-SHA256 per-tenant KEK derivation in Legal Vault envelope encryption',
    formatValidator: isStrongSecret,
  },
  {
    key: 'AUDIT_LOG_HMAC_SECRET',
    category: 'CRYPTO_AND_PDPL_VAULT',
    requiredInProduction: true,
    description: 'HMAC-SHA256 secret for immutable WORM digital audit log chain verification',
    formatValidator: isStrongSecret,
  },

  // 4. AI & Statutory RAG Engine
  {
    key: 'OLLAMA_URL',
    category: 'AI_AND_STATUTORY_RAG',
    requiredInProduction: false,
    description: 'Internal Ollama inference endpoint URL',
    formatValidator: isUrl,
  },
  {
    key: 'OLLAMA_MODEL',
    category: 'AI_AND_STATUTORY_RAG',
    requiredInProduction: false,
    description: 'Default Arabic legal reasoning LLM model tag for Ollama',
  },
  {
    key: 'OLLAMA_HOST_URL',
    category: 'AI_AND_STATUTORY_RAG',
    requiredInProduction: false,
    description: 'Host-side Ollama URL used by scripts/warm-ai.sh',
    formatValidator: isUrl,
  },
  {
    key: 'OPENAI_API_KEY',
    category: 'AI_AND_STATUTORY_RAG',
    requiredInProduction: false,
    description: 'OpenAI API key for text-embedding-3-small statutory vector indexing',
  },
  {
    key: 'OPENAI_EMBEDDING_MODEL',
    category: 'AI_AND_STATUTORY_RAG',
    requiredInProduction: false,
    description: 'Embedding model identifier (defaults to text-embedding-3-small)',
  },
  {
    key: 'MAQAR_USE_OPENAI_EMBEDDINGS',
    category: 'AI_AND_STATUTORY_RAG',
    requiredInProduction: false,
    description: 'Boolean toggle ("true"/"false") to enable live OpenAI embeddings over local deterministic fallback',
    formatValidator: (v) => v === 'true' || v === 'false',
  },
  {
    key: 'MAQAR_ENABLE_LIVE_LLM',
    category: 'AI_AND_STATUTORY_RAG',
    requiredInProduction: false,
    description: 'Boolean toggle ("true"/"false") to invoke live LLM synthesis in /api/ai/legal-query',
    formatValidator: (v) => v === 'true' || v === 'false',
  },

  // 5. Automated Multi-Channel Procedural Notifications & Webhooks
  {
    key: 'CRON_SECRET',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: true,
    description: 'Bearer secret authenticating /api/cron/* procedural alert and reminder workers',
    formatValidator: isStrongSecret,
  },
  {
    key: 'WHATSAPP_BUSINESS_API_URL',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'Meta WhatsApp Cloud API messages endpoint URL',
    formatValidator: isUrl,
  },
  {
    key: 'WHATSAPP_ACCESS_TOKEN',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'WhatsApp Business API permanent system-user bearer token',
  },
  {
    key: 'SMS_PROVIDER_API_URL',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'CITC-compliant Saudi SMS gateway endpoint (e.g., Unifonic / Taqnyat)',
    formatValidator: isUrl,
  },
  {
    key: 'SMS_PROVIDER_API_KEY',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'API key for Saudi SMS gateway dispatch',
  },
  {
    key: 'SMS_SENDER_ID',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'Registered CITC alphanumeric SMS sender ID (e.g., MAQAR)',
  },
  {
    key: 'TRANSACTIONAL_EMAIL_WEBHOOK_URL',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'Transactional email HTTP webhook endpoint for procedural alerts',
    formatValidator: isUrl,
  },
  {
    key: 'TRANSACTIONAL_EMAIL_API_KEY',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'Transactional email HTTP webhook bearer API key',
  },
  {
    key: 'MAQAR_MESSAGING_WEBHOOK_URL',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'Unified webhook URL for litigation deadline escalation notifications',
    formatValidator: isUrl,
  },
  {
    key: 'NAJIZ_WEBHOOK_SECRET',
    category: 'PROCEDURAL_NOTIFICATIONS',
    requiredInProduction: false,
    description: 'HMAC shared secret for authenticating inbound Najiz court sync webhooks',
  },

  // 6. E-Signature Dispatch
  {
    key: 'ESIGNATURE_SIGNING_SECRET',
    category: 'ESIGNATURE',
    requiredInProduction: true,
    description: 'HMAC-SHA256 secret for signing E-Signature envelopes and audit trail certificates',
    formatValidator: isStrongSecret,
  },
  {
    key: 'NAFATH_SIGN_API_URL',
    category: 'ESIGNATURE',
    requiredInProduction: false,
    description: 'Saudi National Single Sign-On (Nafath) digital signature gateway URL',
    formatValidator: isUrl,
  },
  {
    key: 'NAFATH_CLIENT_ID',
    category: 'ESIGNATURE',
    requiredInProduction: false,
    description: 'Nafath relying-party client identifier',
  },
  {
    key: 'DOCUSIGN_BASE_URL',
    category: 'ESIGNATURE',
    requiredInProduction: false,
    description: 'DocuSign eSignature REST API base URL',
    formatValidator: isUrl,
  },
  {
    key: 'DOCUSIGN_INTEGRATION_KEY',
    category: 'ESIGNATURE',
    requiredInProduction: false,
    description: 'DocuSign OAuth integration key',
  },

  // 7. ZATCA Fatoora Phase-2 & Stripe Billing
  {
    key: 'ZATCA_ENVIRONMENT',
    category: 'ZATCA_AND_BILLING',
    requiredInProduction: false,
    description: 'ZATCA Fatoora environment mode ("sandbox" | "simulation" | "production")',
    formatValidator: (v) => ['sandbox', 'simulation', 'production'].includes(v),
  },
  {
    key: 'ZATCA_API_BASE_URL',
    category: 'ZATCA_AND_BILLING',
    requiredInProduction: false,
    description: 'ZATCA Fatoora Phase-2 clearance & reporting gateway base URL',
    formatValidator: isUrl,
  },
  {
    key: 'ZATCA_SELLER_VAT_NUMBER',
    category: 'ZATCA_AND_BILLING',
    requiredInProduction: false,
    description: '15-digit Saudi VAT registration number starting and ending with 3',
    formatValidator: isZatcaVat,
    formatHint: '3XXXXXXXXXXXXX3 (15 digits)',
  },
  {
    key: 'ZATCA_CSID_PUBLIC_KEY',
    category: 'ZATCA_AND_BILLING',
    requiredInProduction: false,
    description: 'ZATCA Cryptographic Stamp Identifier (CSID) ECDSA public key / certificate',
  },
  {
    key: 'ZATCA_CSID_PRIVATE_KEY',
    category: 'ZATCA_AND_BILLING',
    requiredInProduction: false,
    description: 'ZATCA Cryptographic Stamp Identifier (CSID) ECDSA secp256k1 private key',
  },
  {
    key: 'STRIPE_SECRET_KEY',
    category: 'ZATCA_AND_BILLING',
    requiredInProduction: false,
    description: 'Stripe secret API key for SaaS subscription checkout',
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    category: 'ZATCA_AND_BILLING',
    requiredInProduction: false,
    description: 'Stripe webhook signing secret (`whsec_...`)',
  },

  // 8. Email & Observability
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
