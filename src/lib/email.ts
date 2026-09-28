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

export async function sendTransactionalEmail(options: { to: string; subject: string; heading: string; text: string; actionUrl?: string; actionLabel?: string }) {
  const action = options.actionUrl && options.actionLabel
    ? `<p><a href="${escapeHtml(options.actionUrl)}" style="display:inline-block;padding:12px 20px;background:#047857;color:#fff;text-decoration:none;border-radius:6px">${escapeHtml(options.actionLabel)}</a></p>`
    : ''
  const smtp = client()
  try {
    await smtp.sendAsync({
      from: process.env.EMAIL_FROM as string,
      to: options.to,
      subject: options.subject,
      text: `${options.heading}\n\n${options.text}${options.actionUrl ? `\n\n${options.actionUrl}` : ''}`,
      attachment: [{ data: `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8"><h1>${escapeHtml(options.heading)}</h1><p>${escapeHtml(options.text)}</p>${action}<p style="color:#64748b">سند — Sanad</p></div>`, alternative: true, contentType: 'text/html' }],
    })
  } finally {
    smtp.smtp.close()
  }
}

export function publicAppUrl(path: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3001'
  return new URL(path, base).toString()
}
