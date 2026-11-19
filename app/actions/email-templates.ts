'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  getAllEmailTemplates,
  getEmailTemplateByKey,
  saveEmailTemplate,
  resetEmailTemplate,
  isValidTemplateKey,
} from '@/app/lib/email/template-store'
import {
  compileEmailHtml,
  DUMMY_PREVIEW_CONTEXT,
} from '@/app/lib/email/template-engine'
import { sendEmail, getAdminNotificationEmail } from '@/app/lib/email/mailer'
import { EmailTemplateData } from '@/app/lib/email/default-templates'
import { sanitizeUserError } from '@/app/lib/security'

async function checkIsAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized: No user session found')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return { supabase, user }
}

/**
 * Mengambil semua template email untuk halaman CMS Admin
 */
export async function getAdminEmailTemplates() {
  try {
    await checkIsAdmin()
    const { templates, isUsingDatabase } = await getAllEmailTemplates()
    return {
      success: true,
      templates,
      isUsingDatabase,
      defaultAdminEmail: getAdminNotificationEmail(),
    }
  } catch (error: unknown) {
    console.error('[getAdminEmailTemplates Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan saat memuat template email.'),
    }
  }
}

/**
 * Menyimpan pembaruan teks template oleh Admin
 */
export async function updateAdminEmailTemplate(
  templateKey: string,
  formData: {
    subjek: string
    badge_label: string
    judul_heading: string
    pesan_pembuka: string
    pesan_penutup: string
    cta_label: string
  }
) {
  try {
    await checkIsAdmin()
    if (!isValidTemplateKey(templateKey)) {
      return { success: false, error: 'Kunci template tidak valid.' }
    }
    if (!formData.subjek?.trim() || !formData.judul_heading?.trim() || !formData.pesan_pembuka?.trim()) {
      return {
        success: false,
        error: 'Subjek, judul heading, dan pesan pembuka tidak boleh kosong.',
      }
    }

    const result = await saveEmailTemplate(templateKey, {
      subjek: formData.subjek.trim(),
      badge_label: formData.badge_label.trim() || 'Pemberitahuan Resmi',
      judul_heading: formData.judul_heading.trim(),
      pesan_pembuka: formData.pesan_pembuka.trim(),
      pesan_penutup: formData.pesan_penutup.trim(),
      cta_label: formData.cta_label.trim() || 'Buka Portal',
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Gagal menyimpan perubahan template.',
      }
    }

    revalidatePath('/admin/email-templates')
    return { success: true, storage: result.storage }
  } catch (error: unknown) {
    console.error('[updateAdminEmailTemplate Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Gagal menyimpan perubahan template.'),
    }
  }
}

/**
 * Mengembalikan template spesifik ke teks standar bawaan dinas
 */
export async function resetAdminEmailTemplate(templateKey: string) {
  try {
    await checkIsAdmin()
    if (!isValidTemplateKey(templateKey)) {
      return { success: false, error: 'Kunci template tidak valid.' }
    }
    await resetEmailTemplate(templateKey)
    revalidatePath('/admin/email-templates')
    return { success: true }
  } catch (error: unknown) {
    console.error('[resetAdminEmailTemplate Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Gagal mengembalikan template ke default.'),
    }
  }
}

/**
 * Merender pratinjau visual HTML berdasarkan nilai formulir yang sedang diketik
 */
export async function renderLivePreviewHtml(
  templateKey: string,
  overrides: {
    subjek: string
    badge_label: string
    judul_heading: string
    pesan_pembuka: string
    pesan_penutup: string
    cta_label: string
  }
) {
  try {
    await checkIsAdmin()
    if (!isValidTemplateKey(templateKey)) {
      return { success: false, error: 'Kunci template tidak valid.' }
    }
    const current = await getEmailTemplateByKey(templateKey)
    const merged: EmailTemplateData = {
      ...current,
      ...overrides,
    }

    const compiled = compileEmailHtml(merged, DUMMY_PREVIEW_CONTEXT)
    return { success: true, subject: compiled.subject, html: compiled.html }
  } catch (error: unknown) {
    return {
      success: false,
      error: sanitizeUserError(error, 'Gagal merender pratinjau.'),
    }
  }
}

/**
 * Mengirim email uji coba (test email) langsung ke inbox yang ditentukan admin
 */
export async function sendAdminTestEmail(
  templateKey: string,
  targetEmail: string,
  overrides?: {
    subjek: string
    badge_label: string
    judul_heading: string
    pesan_pembuka: string
    pesan_penutup: string
    cta_label: string
  }
) {
  try {
    await checkIsAdmin()
    if (!isValidTemplateKey(templateKey)) {
      return { success: false, error: 'Kunci template tidak valid.' }
    }

    const cleanTargetEmail = targetEmail.trim()
    if (!cleanTargetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanTargetEmail)) {
      return { success: false, error: 'Alamat email tujuan tidak valid.' }
    }

    const current = await getEmailTemplateByKey(templateKey)
    const merged: EmailTemplateData = {
      ...current,
      ...(overrides || {}),
    }

    const compiled = compileEmailHtml(merged, DUMMY_PREVIEW_CONTEXT)

    const sendRes = await sendEmail({
      to: cleanTargetEmail,
      subject: `[UJI COBA CMS] ${compiled.subject}`,
      html: compiled.html,
    })

    return {
      success: sendRes.success,
      mocked: sendRes.mocked,
      error: sendRes.error ? 'Gagal mengirim email uji coba. Periksa konfigurasi SMTP.' : undefined,
    }
  } catch (error: unknown) {
    console.error('[sendAdminTestEmail Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Gagal mengirim email uji coba.'),
    }
  }
}
