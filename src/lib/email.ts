import { SMTPClient } from 'emailjs'

export function emailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.EMAIL_FROM)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] || char)
}

function client() {
  if (!emailConfigured()) throw new Error('Email delivery is not configured')
  return new SMTPClient({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    ssl: process.env.SMTP_SECURE === 'true',
    tls: process.env.SMTP_SECURE !== 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    timeout: 15_000,
  })
}

export interface TransactionalEmailOptions {
  to: string
  subject: string
  heading: string
  text: string
  actionUrl?: string
  actionLabel?: string
  badgeText?: string
  securityNote?: string
}

/**
 * Generates a styled Arabic RTL transactional HTML email template with
 * Maqar («مقر») institutional branding, PDPL notice, and accessible CTA button.
 */
export function buildStyledArabicEmailHtml(options: TransactionalEmailOptions): string {
  const badge = escapeHtml(options.badgeText || 'إشعار أمني رسمي • مقر')
  const securityNote = escapeHtml(
    options.securityNote ||
      'رسالة آلية مشفرة صادرة من منظومة «مقر» — المقر الرقمي للعمليات القانونية والحوكمة (متوافق مع نظام حماية البيانات الشخصية PDPL).',
  )

  const actionBlock =
    options.actionUrl && options.actionLabel
      ? `
      <div style="margin:28px 0;text-align:center;">
        <a href="${escapeHtml(options.actionUrl)}"
           style="display:inline-block;padding:14px 28px;background-color:#1F7A46;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:12px;">
          ${escapeHtml(options.actionLabel)}
        </a>
      </div>
      <div style="margin-top:16px;padding:12px 14px;background-color:#F5F7F5;border:1px solid #CCD8CE;border-radius:10px;font-size:12px;color:#4A5D50;word-break:break-all;">
        إذا لم يعمل الزر أعلاه، انسخ الرابط التالي والصقه في المتصفح:<br/>
        <a href="${escapeHtml(options.actionUrl)}" style="color:#1F7A46;font-family:monospace;">${escapeHtml(options.actionUrl)}</a>
      </div>`
      : ''

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(options.subject)}</title>
</head>
<body dir="rtl" style="margin:0;padding:24px 12px;background-color:#F5F7F5;font-family:'IBM Plex Sans Arabic','Cairo',Tahoma,Arial,sans-serif;color:#1B281F;line-height:1.8;">
  <div style="max-width:600px;margin:0 auto;background-color:#FFFFFF;border:1px solid #CCD8CE;border-radius:20px;overflow:hidden;">
    <div style="background-color:#E8EFE9;border-bottom:1px solid #CCD8CE;padding:20px 28px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:22px;font-weight:900;color:#1B281F;">مقر <span style="font-size:11px;font-family:monospace;background-color:#FFFFFF;color:#1F7A46;padding:2px 8px;border-radius:6px;border:1px solid #CCD8CE;">MAQAR</span></div>
        <div style="font-size:12px;color:#4A5D50;margin-top:2px;">المقر الرقمي للعمليات القانونية والحوكمة</div>
      </div>
    </div>
    <div style="padding:28px;">
      <div style="display:inline-block;padding:4px 12px;border-radius:999px;background-color:#E8EFE9;border:1px solid #CCD8CE;color:#1F7A46;font-size:11px;font-weight:700;margin-bottom:14px;">
        ${badge}
      </div>
      <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:800;color:#1B281F;">${escapeHtml(options.heading)}</h1>
      <p style="margin:0 0 16px 0;font-size:14px;color:#4A5D50;line-height:1.8;">${escapeHtml(options.text)}</p>
      ${actionBlock}
    </div>
    <div style="background-color:#F5F7F5;border-top:1px solid #CCD8CE;padding:16px 28px;font-size:11px;color:#566A5C;">
      <div>${securityNote}</div>
      <div style="margin-top:6px;color:#1B281F;font-weight:600;">مقر للتقنيات القانونية والحوكمة • الرياض، المملكة العربية السعودية</div>
    </div>
  </div>
</body>
</html>`
}

export async function sendTransactionalEmail(options: TransactionalEmailOptions) {
  const html = buildStyledArabicEmailHtml(options)
  const smtp = client()
  try {
    await smtp.sendAsync({
      from: process.env.EMAIL_FROM as string,
      to: options.to,
      subject: options.subject,
      text: `${options.heading}\n\n${options.text}${options.actionUrl ? `\n\n${options.actionUrl}` : ''}\n\nمقر — المقر الرقمي للعمليات القانونية والحوكمة`,
      attachment: [{ data: html, alternative: true, contentType: 'text/html' }],
    })
  } finally {
    smtp.smtp.close()
  }
}

export function publicAppUrl(path: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3001'
  return new URL(path, base).toString()
}
