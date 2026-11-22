/**
 * Saudi phone normalization & 1-click WhatsApp deep-link utilities for Maqar (مقر).
 */

export function normalizeSaudiPhone(rawPhone?: string | null): string | null {
  if (!rawPhone) return null
  const digits = rawPhone.replace(/\D/g, '')
  if (!digits) return null

  // 009665XXXXXXXX -> 9665XXXXXXXX
  if (digits.startsWith('00966') && digits.length === 14) {
    return digits.slice(2)
  }
  // 96605XXXXXXXX -> 9665XXXXXXXX
  if (digits.startsWith('96605') && digits.length === 13) {
    return `966${digits.slice(4)}`
  }
  // 9665XXXXXXXX (12 digits)
  if (digits.startsWith('966') && digits.length === 12) {
    return digits
  }
  // 05XXXXXXXX (10 digits)
  if (digits.startsWith('05') && digits.length === 10) {
    return `966${digits.slice(1)}`
  }
  // 5XXXXXXXX (9 digits)
  if (digits.startsWith('5') && digits.length === 9) {
    return `966${digits}`
  }
  // Other valid international E.164 digit strings (10 to 15 digits)
  if (digits.length >= 10 && digits.length <= 15) {
    return digits
  }
  return null
}

export function buildWhatsAppShareUrl(params: { phone?: string | null; text: string }): string {
  const normalized = normalizeSaudiPhone(params.phone)
  const encodedText = encodeURIComponent(params.text.trim())
  if (normalized) {
    return `https://wa.me/${normalized}?text=${encodedText}`
  }
  return `https://wa.me/?text=${encodedText}`
}

export function buildPortalWhatsAppMessage(params: {
  clientName: string
  workspaceName?: string | null
  caseTitle?: string | null
  portalUrl: string
  lang?: 'ar' | 'en'
}): string {
  const office = params.workspaceName?.trim() || (params.lang === 'en' ? 'our law office' : 'مكتب المحاماة')
  if (params.lang === 'en') {
    const caseLine = params.caseTitle ? `\nCase: ${params.caseTitle}` : ''
    return `Hello ${params.clientName},\n${office} has shared your encrypted client portal link to track case updates, upload documents, and view fee statements:${caseLine}\n${params.portalUrl}`
  }
  const caseLine = params.caseTitle ? `\n• الملف القضائي: ${params.caseTitle}` : ''
  return `مرحباً ${params.clientName}،\nيشاركك ${office} رابط بوابة الموكّل المشفّرة لمتابعة مستجدات ملفك ورفع المستندات والاطلاع على بيانات الأتعاب:${caseLine}\n${params.portalUrl}`
}

export function buildFeeStatementWhatsAppMessage(params: {
  clientName: string
  invoiceNumber: string
  totalFormatted: string
  dueDateLabel?: string | null
  caseTitle?: string | null
  lang?: 'ar' | 'en'
}): string {
  if (params.lang === 'en') {
    const casePart = params.caseTitle ? ` (${params.caseTitle})` : ''
    const duePart = params.dueDateLabel ? ` — Due: ${params.dueDateLabel}` : ''
    return `Hello ${params.clientName},\nFee statement ${params.invoiceNumber}${casePart} for ${params.totalFormatted} is ready${duePart}.`
  }
  const casePart = params.caseTitle ? ` (${params.caseTitle})` : ''
  const duePart = params.dueDateLabel ? ` • تاريخ الاستحقاق: ${params.dueDateLabel}` : ''
  return `مرحباً ${params.clientName}،\nتم إصدار بيان الأتعاب رقم ${params.invoiceNumber}${casePart} بمبلغ إجمالي ${params.totalFormatted}${duePart}.`
}
