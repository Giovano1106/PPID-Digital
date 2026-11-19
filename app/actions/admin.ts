'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { dispatchStatusUpdateNotification } from '@/app/lib/email/notifications'
import {
  addWorkingDaysWita,
  isSafePublicUrl,
  sanitizeUserError,
} from '@/app/lib/security'

// Helper function to check admin role
async function checkIsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

// ==========================================
// Admin Permohonan Actions
// ==========================================

export async function getAdminPermohonan() {
  try {
    const { supabase } = await checkIsAdmin()
    
    const { data, error } = await supabase
      .from('permohonan')
      .select(`
        *,
        profiles (
          nama,
          nik,
          email,
          telepon
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

export async function setPermohonanDiproses(id: number) {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: 'ID permohonan tidak valid.' }
    }
    const { supabase } = await checkIsAdmin()

    const { data: current } = await supabase
      .from('permohonan')
      .select('status')
      .eq('id', id)
      .single()

    if (!current) {
      return { success: false, error: 'Permohonan tidak ditemukan.' }
    }
    if (current.status === 'dijawab' || current.status === 'ditolak') {
      return { success: false, error: 'Permohonan yang sudah selesai tidak dapat diubah ke diproses.' }
    }

    const { error } = await supabase
      .from('permohonan')
      .update({ status: 'diproses', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')

    dispatchStatusUpdateNotification(id, 'diproses').catch((err) => {
      console.error('[Email Notification Error] setPermohonanDiproses:', err)
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

export async function setPermohonanJawab(id: number, jawaban: string) {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: 'ID permohonan tidak valid.' }
    }
    const cleanJawaban = jawaban?.trim() || ''
    if (!cleanJawaban || cleanJawaban.length > 8000) {
      return { success: false, error: 'Jawaban resmi wajib diisi (maksimal 8000 karakter).' }
    }

    const { supabase } = await checkIsAdmin()

    const { error } = await supabase
      .from('permohonan')
      .update({
        status: 'dijawab',
        jawaban_admin: cleanJawaban,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')

    dispatchStatusUpdateNotification(id, 'dijawab', { jawabanAdmin: cleanJawaban }).catch((err) => {
      console.error('[Email Notification Error] setPermohonanJawab:', err)
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

export async function setPermohonanTolak(id: number, alasan: string) {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: 'ID permohonan tidak valid.' }
    }
    const cleanAlasan = alasan?.trim().replace(/^\[DITOLAK\]\s*Alasan:\s*/i, '').trim() || ''
    if (!cleanAlasan || cleanAlasan.length > 4000) {
      return { success: false, error: 'Alasan penolakan wajib diisi (maksimal 4000 karakter).' }
    }

    const { supabase } = await checkIsAdmin()

    const { data: current } = await supabase
      .from('permohonan')
      .select('status')
      .eq('id', id)
      .single()

    if (!current) {
      return { success: false, error: 'Permohonan tidak ditemukan.' }
    }
    if (current.status === 'dijawab' || current.status === 'ditolak') {
      return { success: false, error: 'Permohonan yang sudah selesai tidak dapat ditolak.' }
    }

    const { error } = await supabase
      .from('permohonan')
      .update({
        status: 'ditolak',
        jawaban_admin: cleanAlasan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')

    dispatchStatusUpdateNotification(id, 'tolak', { alasan: cleanAlasan }).catch((err) => {
      console.error('[Email Notification Error] setPermohonanTolak:', err)
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

export async function setPermohonanPerpanjang(
  id: number,
  alasan: string,
  _ignoredDeadline?: string
) {
  void _ignoredDeadline
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return { success: false, error: 'ID permohonan tidak valid.' }
    }
    const cleanAlasan = alasan?.trim() || ''
    if (!cleanAlasan || cleanAlasan.length > 2000) {
      return { success: false, error: 'Alasan perpanjangan wajib diisi (maksimal 2000 karakter).' }
    }

    const { supabase } = await checkIsAdmin()

    const { data: current } = await supabase
      .from('permohonan')
      .select('status, diperpanjang, deadline_awal, created_at')
      .eq('id', id)
      .single()

    if (!current) {
      return { success: false, error: 'Permohonan tidak ditemukan.' }
    }
    if (current.diperpanjang) {
      return { success: false, error: 'Batas waktu SLA permohonan ini sudah pernah diperpanjang.' }
    }
    if (current.status === 'dijawab' || current.status === 'ditolak') {
      return { success: false, error: 'Permohonan yang sudah selesai tidak dapat diperpanjang.' }
    }

    const serverDeadlineAkhir = addWorkingDaysWita(
      current.deadline_awal || current.created_at,
      7
    )

    const { error } = await supabase
      .from('permohonan')
      .update({
        diperpanjang: true,
        alasan_perpanjangan: cleanAlasan,
        deadline_akhir: serverDeadlineAkhir,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')

    dispatchStatusUpdateNotification(id, 'perpanjang', {
      alasan: cleanAlasan,
      deadlineAkhir: serverDeadlineAkhir,
    }).catch((err) => {
      console.error('[Email Notification Error] setPermohonanPerpanjang:', err)
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

// ==========================================
// Admin Konten & Dokumen Actions
// ==========================================

export async function getAdminKonten() {
  try {
    const { supabase } = await checkIsAdmin()
    
    const [kontenRes, dokumenRes] = await Promise.all([
      supabase.from('konten_landing').select('id, section_key, judul, isi_teks').order('id', { ascending: true }),
      supabase.from('dokumen_publik').select('*').order('created_at', { ascending: true })
    ])

    if (kontenRes.error) throw kontenRes.error
    if (dokumenRes.error) throw dokumenRes.error

    return { 
      success: true, 
      data: {
        konten: kontenRes.data,
        dokumen: dokumenRes.data
      }
    }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

export async function updateKontenKategori(id: number, judul: string, isi_teks: string) {
  try {
    const { supabase } = await checkIsAdmin()
    const cleanJudul = judul.trim()
    const cleanIsi = isi_teks.trim()
    if (!cleanJudul) {
      return { success: false, error: 'Judul kategori tidak boleh kosong.' }
    }

    const { error } = await supabase
      .from('konten_landing')
      .update({ judul: cleanJudul, isi_teks: cleanIsi })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

export async function addKontenKategori(judul: string, isi_teks: string, customKey?: string) {
  try {
    const { supabase, user } = await checkIsAdmin()
    const cleanJudul = judul.trim()
    const cleanIsi = isi_teks.trim()

    if (!cleanJudul) {
      return { success: false, error: 'Judul kategori tidak boleh kosong.' }
    }

    let sectionKey = customKey?.trim()
      ? customKey.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w\-]+/g, '')
      : cleanJudul.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\-]+/g, '')

    if (!sectionKey) {
      sectionKey = `kategori_${Date.now()}`
    }

    const { data: existing } = await supabase
      .from('konten_landing')
      .select('id')
      .eq('section_key', sectionKey)
      .maybeSingle()

    if (existing) {
      sectionKey = `${sectionKey}_${Date.now().toString().slice(-4)}`
    }

    const { data, error } = await supabase
      .from('konten_landing')
      .insert({
        section_key: sectionKey,
        judul: cleanJudul,
        isi_teks: cleanIsi || `Kumpulan dokumen dan informasi publik terkait ${cleanJudul}.`,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true, data }
  } catch (error: unknown) {
    console.error('[Admin Action Error: addKontenKategori]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Gagal menambahkan kategori baru.'),
    }
  }
}

export async function deleteKontenKategori(id: number, section_key: string) {
  try {
    const { supabase } = await checkIsAdmin()

    if (section_key === 'daftar_informasi_publik') {
      return {
        success: false,
        error: 'Kategori "Daftar Informasi Publik" adalah kategori inti sistem matriks dan tidak dapat dihapus.',
      }
    }

    // Bersihkan semua dokumen terkait kategori ini terlebih dahulu dan verifikasi hasilnya
    const { error: docDelErr } = await supabase
      .from('dokumen_publik')
      .delete()
      .eq('kategori_key', section_key)

    if (docDelErr) throw docDelErr

    const { error } = await supabase
      .from('konten_landing')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error: deleteKontenKategori]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Gagal menghapus kategori.'),
    }
  }
}

export async function addDokumen(kategori_key: string, nama_dokumen: string, file_url: string) {
  try {
    const { supabase, user } = await checkIsAdmin()
    const cleanNama = nama_dokumen.trim()
    const cleanUrl = file_url.trim()

    if (!cleanNama) {
      return { success: false, error: 'Nama dokumen tidak boleh kosong.' }
    }
    if (!isSafePublicUrl(cleanUrl)) {
      return { success: false, error: 'URL dokumen tidak valid. Gunakan tautan http:// atau https://.' }
    }

    const { error } = await supabase
      .from('dokumen_publik')
      .insert({
        kategori_key: kategori_key.trim(),
        nama_dokumen: cleanNama,
        file_url: cleanUrl,
        uploaded_by: user.id,
      })

    if (error) throw error
    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

export async function updateDokumen(id: number | bigint, nama_dokumen: string, file_url: string) {
  try {
    const { supabase } = await checkIsAdmin()
    const cleanNama = nama_dokumen.trim()
    const cleanUrl = file_url.trim()

    if (!cleanNama) {
      return { success: false, error: 'Nama dokumen tidak boleh kosong.' }
    }
    if (!isSafePublicUrl(cleanUrl)) {
      return { success: false, error: 'URL dokumen tidak valid. Gunakan tautan http:// atau https://.' }
    }

    const { error } = await supabase
      .from('dokumen_publik')
      .update({ nama_dokumen: cleanNama, file_url: cleanUrl })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

export async function deleteDokumen(id: number | bigint) {
  try {
    const { supabase } = await checkIsAdmin()

    const { error } = await supabase
      .from('dokumen_publik')
      .delete()
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (error: unknown) {
    console.error('[Admin Action Error]', error)
    return {
      success: false,
      error: sanitizeUserError(error, 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'),
    }
  }
}

// ------------------------------------------------------------------
// REPORTING ACTIONS
// ------------------------------------------------------------------

export async function getAllPermohonanForReport() {
  try {
    const { supabase } = await checkIsAdmin()

    const { data, error } = await supabase
      .from('permohonan')
      .select(`
        *,
        profiles (
          nama,
          nik,
          email,
          telepon
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin Error] getAllPermohonanForReport:', error)
      return {
        success: false as const,
        data: [],
        error: 'Gagal memuat laporan permohonan.',
      }
    }

    return { success: true as const, data: data || [] }
  } catch (err: unknown) {
    console.error('[Admin Error] getAllPermohonanForReport catch:', err)
    return {
      success: false as const,
      data: [],
      error: sanitizeUserError(err, 'Gagal memuat laporan permohonan.'),
    }
  }
}
