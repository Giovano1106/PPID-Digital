import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@/app/lib/supabase/server'
import { DEFAULT_EMAIL_TEMPLATES, EmailTemplateData } from './default-templates'

const LOCAL_STORAGE_PATH = path.join(process.cwd(), 'app', 'lib', 'email', 'custom_templates.json')

/**
 * Membaca data custom dari file lokal jika database Supabase belum dimigrasi
 */
async function getLocalCustomTemplates(): Promise<Record<string, Partial<EmailTemplateData>>> {
  try {
    const raw = await fs.readFile(LOCAL_STORAGE_PATH, 'utf-8')
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

/**
 * Menyimpan data custom ke file lokal sebagai fallback
 */
async function saveLocalCustomTemplates(data: Record<string, Partial<EmailTemplateData>>) {
  try {
    await fs.writeFile(LOCAL_STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('[TemplateStore] Gagal menyimpan ke fallback lokal:', err)
  }
}

/**
 * Mengambil seluruh daftar template email:
 * 1. Prioritas 1: Supabase tabel `email_templates`
 * 2. Prioritas 2 (Fallback jika belum migrasi): File lokal `custom_templates.json`
 * 3. Default: `DEFAULT_EMAIL_TEMPLATES`
 */
export async function getAllEmailTemplates(): Promise<{
  templates: Record<string, EmailTemplateData>
  isUsingDatabase: boolean
}> {
  const result: Record<string, EmailTemplateData> = JSON.parse(JSON.stringify(DEFAULT_EMAIL_TEMPLATES))
  let isUsingDatabase = false

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('email_templates').select('*')

    if (!error && data && data.length > 0) {
      isUsingDatabase = true
      data.forEach((row: any) => {
        if (result[row.template_key]) {
          result[row.template_key] = {
            ...result[row.template_key],
            subjek: row.subjek || result[row.template_key].subjek,
            badge_label: row.badge_label || result[row.template_key].badge_label,
            judul_heading: row.judul_heading || result[row.template_key].judul_heading,
            pesan_pembuka: row.pesan_pembuka || result[row.template_key].pesan_pembuka,
            pesan_penutup: row.pesan_penutup !== undefined ? row.pesan_penutup : result[row.template_key].pesan_penutup,
            cta_label: row.cta_label || result[row.template_key].cta_label,
            updated_at: row.updated_at,
          }
        }
      })
      return { templates: result, isUsingDatabase }
    }
  } catch (err) {
    // Supabase table mungkin belum dibuat / belum dimigrasi
  }

  // Gunakan fallback lokal
  const localData = await getLocalCustomTemplates()
  Object.keys(localData).forEach((key) => {
    if (result[key]) {
      result[key] = {
        ...result[key],
        ...localData[key],
      }
    }
  })

  return { templates: result, isUsingDatabase: false }
}

/**
 * Mengambil satu template spesifik berdasarkan kunci
 */
export async function getEmailTemplateByKey(templateKey: string): Promise<EmailTemplateData> {
  const { templates } = await getAllEmailTemplates()
  return templates[templateKey] || DEFAULT_EMAIL_TEMPLATES[templateKey]
}

/**
 * Memperbarui template email:
 * Jika tabel Supabase ada, simpan ke Supabase.
 * Jika tabel Supabase belum ada (belum dimigrasi), simpan ke file lokal.
 */
export async function saveEmailTemplate(
  templateKey: string,
  updates: {
    subjek: string
    badge_label: string
    judul_heading: string
    pesan_pembuka: string
    pesan_penutup: string
    cta_label: string
  }
): Promise<{ success: boolean; storage: 'database' | 'local'; error?: string }> {
  try {
    const supabase = await createClient()

    // Coba simpan ke Supabase
    const { error } = await supabase.from('email_templates').upsert(
      {
        template_key: templateKey,
        nama_template: DEFAULT_EMAIL_TEMPLATES[templateKey]?.nama_template || templateKey,
        target_penerima: DEFAULT_EMAIL_TEMPLATES[templateKey]?.target_penerima || 'pemohon',
        subjek: updates.subjek,
        badge_label: updates.badge_label,
        judul_heading: updates.judul_heading,
        pesan_pembuka: updates.pesan_pembuka,
        pesan_penutup: updates.pesan_penutup,
        cta_label: updates.cta_label,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'template_key' }
    )

    if (!error) {
      return { success: true, storage: 'database' }
    }
  } catch {
    // Abaikan error Supabase, beralih ke penyimpanan fallback lokal
  }

  // Simpan ke fallback lokal
  try {
    const local = await getLocalCustomTemplates()
    local[templateKey] = {
      ...local[templateKey],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    await saveLocalCustomTemplates(local)
    return { success: true, storage: 'local' }
  } catch (err: any) {
    return { success: false, storage: 'local', error: err?.message || 'Gagal menyimpan template' }
  }
}

/**
 * Mengembalikan template ke pengaturan awal (bawaan dinas)
 */
export async function resetEmailTemplate(templateKey: string): Promise<{ success: boolean }> {
  const defaultTpl = DEFAULT_EMAIL_TEMPLATES[templateKey]
  if (!defaultTpl) return { success: false }

  try {
    const supabase = await createClient()
    await supabase.from('email_templates').delete().eq('template_key', templateKey)
  } catch {
    // Abaikan jika tabel tidak ada
  }

  try {
    const local = await getLocalCustomTemplates()
    delete local[templateKey]
    await saveLocalCustomTemplates(local)
  } catch {
    // Abaikan
  }

  return { success: true }
}
