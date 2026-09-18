import nodemailer from 'nodemailer'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
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
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{
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
    const from = process.env.SMTP_FROM || `"PPID Digital CIKASDA Sulteng" <${user}>`

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

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    })

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })

    console.log(`[PPID Email Service] Email terkirim ke: ${to} (Message ID: ${info.messageId})`)
    return { success: true }
  } catch (error: any) {
    console.error(`[PPID Email Service Error] Gagal mengirim email ke ${to}:`, error?.message || error)
    // Return graceful fail agar tidak menghentikan alur utama penyimpanan permohonan
    return { success: false, error: error?.message || 'Gagal mengirim email' }
  }
}
