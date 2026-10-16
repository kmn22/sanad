import { beforeEach, describe, expect, it } from 'vitest'
import { createDocumentSignature, documentSignatureHeaders, verifyDocumentSignature } from '@/lib/document-signature'

describe('document signatures', () => {
  beforeEach(() => {
    process.env.DOCUMENT_SIGNATURE_KEY = 'test-document-signature-key'
  })

  it('encrypts and verifies a signature for the exact user and output', () => {
    const signature = createDocumentSignature({
      userId: 'user-1',
      workspaceId: 'workspace-1',
      documentId: 'document-1',
      checksumSha256: 'abc123',
      operation: 'download',
    })

    expect(signature).not.toContain('user-1')
    expect(verifyDocumentSignature(signature)).toMatchObject({
      version: 'v1',
      userId: 'user-1',
      workspaceId: 'workspace-1',
      documentId: 'document-1',
      checksumSha256: 'abc123',
      operation: 'download',
    })
  })

  it('rejects tampered signatures and exposes the versioned response headers', () => {
    const signature = createDocumentSignature({
      userId: 'user-1',
      workspaceId: 'workspace-1',
      documentId: 'document-1',
      checksumSha256: 'abc123',
      operation: 'export',
    })
    // Tamper a character inside the ciphertext payload to guarantee decoded byte alteration
    const parts = signature.split('.')
    const tamperedPayload = (parts[3][0] === 'a' ? 'b' : 'a') + parts[3].slice(1)
    const tampered = `${parts[0]}.${parts[1]}.${parts[2]}.${tamperedPayload}`

    expect(verifyDocumentSignature(tampered)).toBeNull()
    expect(documentSignatureHeaders(signature)).toEqual({
      'X-Sanad-Document-Signature': signature,
      'X-Sanad-Document-Signature-Version': 'v1',
    })
  })
})
