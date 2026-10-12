import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const VERSION = 'v1'

function signatureKey() {
  const source = process.env.DOCUMENT_SIGNATURE_KEY || process.env.FILE_ENCRYPTION_KEY || process.env.BACKUP_ENCRYPTION_KEY
  if (!source) throw new Error('Document signature encryption is not configured')
  return createHash('sha256').update(`sanad-document-signature:${source}`).digest()
}

export type DocumentSignatureInput = {
  userId: string
  workspaceId: string
  documentId: string
  checksumSha256: string
  operation: 'download' | 'export' | 'print'
  issuedAt?: Date
}

/**
 * Creates a portable, authenticated encrypted receipt for a document output.
 * The payload is intentionally opaque so it does not disclose user identity
 * when copied with a downloaded file.
 */
export function createDocumentSignature(input: DocumentSignatureInput) {
  const issuedAt = input.issuedAt || new Date()
  const payload = JSON.stringify({
    version: VERSION,
    userId: input.userId,
    workspaceId: input.workspaceId,
    documentId: input.documentId,
    checksumSha256: input.checksumSha256,
    operation: input.operation,
    issuedAt: issuedAt.toISOString(),
  })
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', signatureKey(), iv)
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()])
  return `${VERSION}.${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`
}

export function verifyDocumentSignature(signature: string) {
  const [version, encodedIv, encodedTag, encodedPayload] = signature.split('.')
  if (version !== VERSION || !encodedIv || !encodedTag || !encodedPayload) return null
  try {
    const decipher = createDecipheriv('aes-256-gcm', signatureKey(), Buffer.from(encodedIv, 'base64url'))
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'))
    const payload = Buffer.concat([
      decipher.update(Buffer.from(encodedPayload, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
    const parsed: unknown = JSON.parse(payload)
    if (!parsed || typeof parsed !== 'object') return null
    const value = parsed as Record<string, unknown>
    if (
      value.version !== VERSION ||
      typeof value.userId !== 'string' ||
      typeof value.workspaceId !== 'string' ||
      typeof value.documentId !== 'string' ||
      typeof value.checksumSha256 !== 'string' ||
      !['download', 'export', 'print'].includes(String(value.operation)) ||
      typeof value.issuedAt !== 'string'
    ) return null
    return {
      version: VERSION,
      userId: value.userId,
      workspaceId: value.workspaceId,
      documentId: value.documentId,
      checksumSha256: value.checksumSha256,
      operation: value.operation as DocumentSignatureInput['operation'],
      issuedAt: value.issuedAt,
    }
  } catch {
    return null
  }
}

export function documentSignatureHeaders(signature: string) {
  return {
    'X-Sanad-Document-Signature': signature,
    'X-Sanad-Document-Signature-Version': VERSION,
  }
}

export function signatureVerificationResult(signature: string, expectedChecksum?: string) {
  const payload = verifyDocumentSignature(signature)
  if (!payload) return { valid: false as const, reason: 'INVALID_SIGNATURE' as const }
  if (expectedChecksum && payload.checksumSha256 !== expectedChecksum) {
    return { valid: false as const, reason: 'CHECKSUM_MISMATCH' as const, payload }
  }
  return { valid: true as const, payload }
}
