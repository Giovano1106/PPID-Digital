import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<\/(p|div|tr|h1|h2|h3|h4|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&copy;/gi, '(c)')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeFromAddress(rawFrom: string | undefined, fallbackUser: string): string {
  const trimmed = (rawFrom || '').trim()
  if (!trimmed) {
    return `"PPID Digital CIKASDA Sulteng" <${fallbackUser}>`
  }
  // Jika seluruh string `"Nama <email>"` terbungkus tanda kutip luar, rapikan ke format RFC `"Nama" <email>`
  const wrappedMatch = trimmed.match(/^"([^"]+)"$/)
  if (wrappedMatch) {
    const inner = wrappedMatch[1]
    const parts = inner.match(/^(.*)<([^<>]+)>$/)
    if (parts) {
      const displayName = parts[1].trim().replace(/"/g, '')
      const addr = parts[2].trim()
      return displayName ? `"${displayName}" <${addr}>` : addr
    }
  }
  return trimmed
}

export function getAdminNotificationEmail(): string {
  return process.env.ADMIN_NOTIFICATION_EMAIL || 'sipardig2026@gmail.com'
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  )
}

/**
 * Mengirim email notifikasi secara asynchronous.
 * Memiliki fitur graceful fallback: Jika kredensial SMTP belum diatur di .env.local,
 * sistem akan mencatat ringkasan email ke log server tanpa menyebabkan aplikasi error.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{
  success: boolean
  mocked?: boolean
  error?: string
}> {
  try {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com'
    const port = Number(process.env.SMTP_PORT) || 465
    const secure = port === 465 || process.env.SMTP_SECURE === 'true'
    const user = process.env.SMTP_USER || 'sipardig2026@gmail.com'
    const pass = process.env.SMTP_PASS?.trim()
    const from = normalizeFromAddress(process.env.SMTP_FROM, user)

    // Jika sandi aplikasi (app password) belum diset, gunakan mode simulasi (mock)
    if (!pass) {
      console.log('---------------------------------------------------------')
      console.log('[PPID Email Service - Mock / Belum Ada SMTP_PASS]')
      console.log(`Kepada  : ${to}`)
      console.log(`Subjek  : ${subject}`)
      console.log('Status  : Email siap dikirim. Masukkan SMTP_PASS (16 digit Gmail App Password) di .env.local untuk pengiriman nyata.')
      console.log('---------------------------------------------------------')
      return { success: true, mocked: true }
    }

    const safeTo = to.replace(/[\r\n]+/g, '').trim()
    const safeSubject = subject.replace(/[\r\n]+/g, ' ').trim()

    if (!safeTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeTo)) {
      return { success: false, error: 'Alamat email tujuan tidak valid' }
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    })

    const plainText = text?.trim() || htmlToPlainText(html)

    const info = await transporter.sendMail({
      from,
      replyTo: user,
      to: safeTo,
      subject: safeSubject,
      text: plainText,
      html,
    })

    console.log(`[PPID Email Service] Email terkirim ke: ${safeTo} (Message ID: ${info.messageId})`)
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Gagal mengirim email'
    console.error(`[PPID Email Service Error] Gagal mengirim email ke ${to}:`, msg)
    // Return graceful fail agar tidak menghentikan alur utama penyimpanan permohonan
    return { success: false, error: msg }
  }
}
