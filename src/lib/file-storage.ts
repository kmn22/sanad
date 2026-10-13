import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.doc', '.docx', '.xls', '.xlsx'])

const EXECUTABLE_SIGNATURES = [
  Buffer.from('MZ'),
  Buffer.from([0x7f, 0x45, 0x4c, 0x46]),
  Buffer.from('#!'),
  Buffer.from([0xfe, 0xed, 0xfa, 0xce]),
  Buffer.from([0xfe, 0xed, 0xfa, 0xcf]),
  Buffer.from([0xcf, 0xfa, 0xed, 0xfe]),
  Buffer.from([0xca, 0xfe, 0xba, 0xbe]),
]

/**
 * Magic bytes that must appear at the start of a file for each allowed
 * binary extension, so a renamed executable or script cannot masquerade
 * as a document by its file name alone.
 */
const MAGIC_SIGNATURES: Record<string, Buffer[]> = {
  '.pdf': [Buffer.from('%PDF-')],
  '.jpg': [Buffer.from([0xff, 0xd8, 0xff])],
  '.jpeg': [Buffer.from([0xff, 0xd8, 0xff])],
  '.png': [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
  '.docx': [Buffer.from([0x50, 0x4b, 0x03, 0x04])],
  '.xlsx': [Buffer.from([0x50, 0x4b, 0x03, 0x04])],
  '.doc': [Buffer.from([0xd0, 0xcf, 0x11, 0xe0])],
  '.xls': [Buffer.from([0xd0, 0xcf, 0x11, 0xe0])],
}

/** UTF-16 text starts with a byte-order mark and legitimately contains NUL bytes. */
function looksUtf16(bytes: Buffer) {
  return (bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff)
}

function uploadRoot() {
  if (process.env.UPLOAD_ROOT) return process.env.UPLOAD_ROOT
  return process.env.NODE_ENV === 'production' ? '/app/uploads' : '/tmp/sanad-uploads'
}

function encryptionKey() {
  const source = process.env.FILE_ENCRYPTION_KEY || process.env.BACKUP_ENCRYPTION_KEY
  if (!source) throw new Error('File encryption is not configured')
  return createHash('sha256').update(`sanad-file-storage:${source}`).digest()
}

export function sanitizeFilename(name: string) {
  const base = path.basename(name).replace(/[\x00-\x1f<>:"/\\|?*]+/g, '-').trim()
  return base.slice(0, 160) || 'document'
}

export function validateUpload(name: string, mimeType: string, bytes: Buffer) {
  const extension = path.extname(sanitizeFilename(name)).toLowerCase()
  if (!bytes.length) return 'Empty files are not allowed'
  if (bytes.length > MAX_UPLOAD_BYTES) return 'File exceeds the 10 MB limit'
  if (!ALLOWED_EXTENSIONS.has(extension)) return 'File extension is not allowed'
  if (mimeType && !ALLOWED_TYPES.has(mimeType)) return 'File type is not allowed'
  if (EXECUTABLE_SIGNATURES.some((signature) => bytes.subarray(0, signature.length).equals(signature))) {
    return 'Executable files are not allowed'
  }
  const expected = MAGIC_SIGNATURES[extension]
  if (expected && !expected.some((signature) => bytes.subarray(0, signature.length).equals(signature))) {
    return 'File content does not match its extension'
  }
  if (extension === '.txt' && !looksUtf16(bytes) && bytes.includes(0)) {
    return 'Text files may not contain binary content'
  }
  return null
}

export function checksum(data: Buffer) {
  return createHash('sha256').update(data).digest('hex')
}

export async function storeEncryptedFile(key: string, data: Buffer) {
  const relative = key.split('/').filter((part) => /^[a-zA-Z0-9_.-]+$/.test(part)).join('/')
  if (!relative || relative !== key) throw new Error('Invalid file key')
  const fullPath = path.join(uploadRoot(), relative)
  await mkdir(path.dirname(fullPath), { recursive: true })
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final(), cipher.getAuthTag()])
  await writeFile(fullPath, encrypted, { mode: 0o600 })
}

export async function readEncryptedFile(key: string) {
  const relative = key.split('/').filter((part) => /^[a-zA-Z0-9_.-]+$/.test(part)).join('/')
  if (!relative || relative !== key) throw new Error('Invalid file key')
  const fullPath = path.join(uploadRoot(), relative)
  if (!fullPath.startsWith(path.resolve(uploadRoot()))) throw new Error('Invalid file path')
  const data = await readFile(fullPath)
  if (data.length < 29) throw new Error('Invalid stored file')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), data.subarray(0, 12))
  decipher.setAuthTag(data.subarray(data.length - 16))
  return Buffer.concat([decipher.update(data.subarray(12, data.length - 16)), decipher.final()])
}

export async function deleteEncryptedFile(key: string) {
  const relative = key.split('/').filter((part) => /^[a-zA-Z0-9_.-]+$/.test(part)).join('/')
  if (!relative || relative !== key) throw new Error('Invalid file key')
  const fullPath = path.join(uploadRoot(), relative)
  if (!fullPath.startsWith(path.resolve(uploadRoot()))) throw new Error('Invalid file path')
  await rm(fullPath, { force: true })
}
