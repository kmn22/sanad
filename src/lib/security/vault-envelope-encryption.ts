/**
 * ============================================================================
 * Maqar (مقر) Security Hardening — Envelope Encryption for Legal Vaults
 * (`src/lib/security/vault-envelope-encryption.ts`)
 * ============================================================================
 *
 * Implements NCA CCC-2:2024 & Saudi PDPL Art. 19 Envelope Encryption for
 * highly sensitive litigation files and trade-secret CLM contract attachments
 * stored in S3 / Object Storage:
 *
 *   1. Generates a unique 256-bit Data Encryption Key (DEK) per attachment.
 *   2. Encrypts the document payload with `AES-256-GCM` + Additional Authenticated
 *      Data (AAD) binding the ciphertext to `{ orgId, workspaceId, documentId, classification }`.
 *   3. Wraps (encrypts) the DEK using a tenant-isolated Key Encryption Key (KEK)
 *      derived via `HKDF-SHA256` from the Master Root Key + `orgId`.
 *   4. Prevents cross-tenant S3 blob substitution or ciphertext tampering.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  hkdfSync,
  randomBytes,
} from 'node:crypto'

export type LegalDataClassification =
  | 'CONFIDENTIAL_CASE_FILE'
  | 'STRICT_TRADE_SECRET_CLM'
  | 'PDPL_SENSITIVE_PERSONAL_DATA'

export interface VaultEncryptionContext {
  orgId: string
  workspaceId: string
  documentId: string
  classification: LegalDataClassification
  keyVersion?: string
}

export interface EncryptedVaultEnvelope {
  envelopeVersion: 'maqar-vault-v1'
  keyVersion: string
  algorithm: 'AES-256-GCM'
  kdf: 'HKDF-SHA256'
  classification: LegalDataClassification
  orgId: string
  workspaceId: string
  documentId: string
  plaintextSha256: string
  /** Base64-encoded wrapped Data Encryption Key (IV + WrappedDEK + AuthTag) */
  wrappedDekBase64: string
  /** Base64-encoded payload Initialization Vector (12 bytes) */
  payloadIvBase64: string
  /** Base64-encoded payload GCM Authentication Tag (16 bytes) */
  payloadAuthTagBase64: string
  /** Base64-encoded encrypted attachment ciphertext (ready for S3 / Object Storage) */
  ciphertextBase64: string
  encryptedAtIso: string
}

function getMasterKmsSecret(): Buffer {
  const raw =
    process.env.VAULT_MASTER_KMS_KEY ||
    process.env.FILE_ENCRYPTION_KEY ||
    process.env.BACKUP_ENCRYPTION_KEY
  if (!raw) {
    if (process.env.NODE_ENV === 'test') {
      return createHash('sha256').update('maqar-kms-root:test-only').digest()
    }
    throw new Error('VAULT_MASTER_KMS_KEY (or FILE_ENCRYPTION_KEY / BACKUP_ENCRYPTION_KEY) must be set')
  }
  return createHash('sha256').update(`maqar-kms-root:${raw}`).digest()
}

/**
 * Derives a tenant-isolated 256-bit Key Encryption Key (KEK) using HKDF-SHA256
 * so Tenant A's KEK is cryptographically distinct from Tenant B's KEK.
 */
function deriveTenantKek(orgId: string, keyVersion: string): Buffer {
  const masterKey = getMasterKmsSecret()
  const salt = Buffer.from(`maqar-kek-salt:${keyVersion}`, 'utf8')
  const info = Buffer.from(`maqar-tenant-kek:${orgId}`, 'utf8')
  return Buffer.from(hkdfSync('sha256', masterKey, salt, info, 32))
}

function buildCanonicalAad(ctx: VaultEncryptionContext, keyVersion: string): Buffer {
  const canonical = JSON.stringify({
    v: 'maqar-vault-v1',
    kv: keyVersion,
    orgId: ctx.orgId,
    workspaceId: ctx.workspaceId,
    documentId: ctx.documentId,
    classification: ctx.classification,
  })
  return Buffer.from(canonical, 'utf8')
}

/**
 * Encrypts a sensitive legal file or trade-secret contract attachment using
 * per-document AES-256-GCM Envelope Encryption before S3/Object Storage upload.
 */
export function encryptLegalVaultPayload(
  plaintext: Buffer | string,
  ctx: VaultEncryptionContext
): EncryptedVaultEnvelope {
  if (!ctx.orgId || !ctx.workspaceId || !ctx.documentId) {
    throw new Error('Vault encryption requires non-empty orgId, workspaceId, and documentId.')
  }

  const payloadBuffer =
    typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf8') : plaintext
  const keyVersion = ctx.keyVersion || 'kv-2026-01'
  const aad = buildCanonicalAad(ctx, keyVersion)

  // 1. Generate ephemeral 256-bit Data Encryption Key (DEK) & 96-bit IV
  const dek = randomBytes(32)
  const payloadIv = randomBytes(12)

  // 2. Encrypt payload with DEK + AAD
  const payloadCipher = createCipheriv('aes-256-gcm', dek, payloadIv)
  payloadCipher.setAAD(aad)
  const ciphertext = Buffer.concat([
    payloadCipher.update(payloadBuffer),
    payloadCipher.final(),
  ])
  const payloadAuthTag = payloadCipher.getAuthTag()

  // 3. Wrap (encrypt) the DEK using the Tenant's HKDF-derived KEK
  const tenantKek = deriveTenantKek(ctx.orgId, keyVersion)
  const dekIv = randomBytes(12)
  const dekCipher = createCipheriv('aes-256-gcm', tenantKek, dekIv)
  dekCipher.setAAD(aad)
  const wrappedDekBody = Buffer.concat([dekCipher.update(dek), dekCipher.final()])
  const dekAuthTag = dekCipher.getAuthTag()
  const wrappedDekPacket = Buffer.concat([dekIv, wrappedDekBody, dekAuthTag])

  // Zeroize raw DEK in memory immediately after wrapping
  dek.fill(0)

  const plaintextSha256 = createHash('sha256')
    .update(payloadBuffer)
    .digest('hex')

  return {
    envelopeVersion: 'maqar-vault-v1',
    keyVersion,
    algorithm: 'AES-256-GCM',
    kdf: 'HKDF-SHA256',
    classification: ctx.classification,
    orgId: ctx.orgId,
    workspaceId: ctx.workspaceId,
    documentId: ctx.documentId,
    plaintextSha256,
    wrappedDekBase64: wrappedDekPacket.toString('base64'),
    payloadIvBase64: payloadIv.toString('base64'),
    payloadAuthTagBase64: payloadAuthTag.toString('base64'),
    ciphertextBase64: ciphertext.toString('base64'),
    encryptedAtIso: new Date().toISOString(),
  }
}

/**
 * Decrypts an envelope-encrypted S3/Object Storage payload only if the caller's
 * `VaultEncryptionContext` (`orgId`, `workspaceId`, `documentId`, `classification`)
 * matches the authenticated GCM AAD and tenant KEK.
 */
export function decryptLegalVaultPayload(
  envelope: EncryptedVaultEnvelope,
  callerContext: VaultEncryptionContext
): Buffer {
  if (
    envelope.orgId !== callerContext.orgId ||
    envelope.workspaceId !== callerContext.workspaceId ||
    envelope.documentId !== callerContext.documentId
  ) {
    throw new Error(
      'VAULT_ACCESS_DENIED: Caller tenant context does not match encrypted envelope metadata.'
    )
  }

  const aad = buildCanonicalAad(callerContext, envelope.keyVersion)
  const tenantKek = deriveTenantKek(callerContext.orgId, envelope.keyVersion)

  // 1. Unwrap DEK
  const wrappedPacket = Buffer.from(envelope.wrappedDekBase64, 'base64')
  if (wrappedPacket.length < 28) {
    throw new Error('VAULT_INTEGRITY_ERROR: Malformed wrapped DEK packet.')
  }
  const dekIv = wrappedPacket.subarray(0, 12)
  const dekAuthTag = wrappedPacket.subarray(wrappedPacket.length - 16)
  const wrappedDekBody = wrappedPacket.subarray(12, wrappedPacket.length - 16)

  let dek: Buffer
  try {
    const dekDecipher = createDecipheriv('aes-256-gcm', tenantKek, dekIv)
    dekDecipher.setAAD(aad)
    dekDecipher.setAuthTag(dekAuthTag)
    dek = Buffer.concat([dekDecipher.update(wrappedDekBody), dekDecipher.final()])
  } catch {
    throw new Error(
      'VAULT_CRYPTO_FAILURE: Unable to unwrap Data Encryption Key (tampered envelope or unauthorized tenant KEK).'
    )
  }

  // 2. Decrypt Payload & verify SHA-256 integrity
  try {
    const payloadIv = Buffer.from(envelope.payloadIvBase64, 'base64')
    const payloadAuthTag = Buffer.from(envelope.payloadAuthTagBase64, 'base64')
    const ciphertext = Buffer.from(envelope.ciphertextBase64, 'base64')

    const payloadDecipher = createDecipheriv('aes-256-gcm', dek, payloadIv)
    payloadDecipher.setAAD(aad)
    payloadDecipher.setAuthTag(payloadAuthTag)
    const decrypted = Buffer.concat([
      payloadDecipher.update(ciphertext),
      payloadDecipher.final(),
    ])

    const actualSha256 = createHash('sha256').update(decrypted).digest('hex')
    if (actualSha256 !== envelope.plaintextSha256) {
      throw new Error('VAULT_CHECKSUM_MISMATCH')
    }

    return decrypted
  } finally {
    dek.fill(0)
  }
}

