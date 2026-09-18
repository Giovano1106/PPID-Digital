'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  getAllEmailTemplates,
  getEmailTemplateByKey,
  saveEmailTemplate,
  resetEmailTemplate,
} from '@/app/lib/email/template-store'
import {
  compileEmailHtml,
  DUMMY_PREVIEW_CONTEXT,
} from '@/app/lib/email/template-engine'
import { sendEmail, getAdminNotificationEmail } from '@/app/lib/email/mailer'
import { EmailTemplateData } from '@/app/lib/email/default-templates'

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
  } catch (error: any) {
    console.error('[getAdminEmailTemplates Error]', error)
    return {
      success: false,
      error: error?.message || 'Terjadi kesalahan saat memuat template email',
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
    const result = await saveEmailTemplate(templateKey, formData)
    revalidatePath('/admin/email-templates')
    return { success: true, storage: result.storage }
  } catch (error: any) {
    console.error('[updateAdminEmailTemplate Error]', error)
    return {
      success: false,
      error: error?.message || 'Gagal menyimpan perubahan template',
    }
  }
}

/**
 * Mengembalikan template spesifik ke teks standar bawaan dinas
 */
export async function resetAdminEmailTemplate(templateKey: string) {
  try {
    await checkIsAdmin()
    await resetEmailTemplate(templateKey)
    revalidatePath('/admin/email-templates')
    return { success: true }
  } catch (error: any) {
    console.error('[resetAdminEmailTemplate Error]', error)
    return {
      success: false,
      error: error?.message || 'Gagal mengembalikan template ke default',
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
    const current = await getEmailTemplateByKey(templateKey)
    const merged: EmailTemplateData = {
      ...current,
      ...overrides,
    }

    const compiled = compileEmailHtml(merged, DUMMY_PREVIEW_CONTEXT)
    return { success: true, subject: compiled.subject, html: compiled.html }
  } catch (error: any) {
    return { success: false, error: error?.message || 'Gagal merender pratinjau' }
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

    if (!targetEmail || !targetEmail.includes('@')) {
      return { success: false, error: 'Alamat email tujuan tidak valid.' }
    }

    const current = await getEmailTemplateByKey(templateKey)
    const merged: EmailTemplateData = {
      ...current,
      ...(overrides || {}),
    }

    const compiled = compileEmailHtml(merged, DUMMY_PREVIEW_CONTEXT)

    const sendRes = await sendEmail({
      to: targetEmail,
      subject: `[UJI COBA CMS] ${compiled.subject}`,
      html: compiled.html,
    })

    return {
      success: sendRes.success,
      mocked: sendRes.mocked,
      error: sendRes.error,
    }
  } catch (error: any) {
    console.error('[sendAdminTestEmail Error]', error)
    return {
      success: false,
      error: error?.message || 'Gagal mengirim email uji coba',
    }
  }
}
