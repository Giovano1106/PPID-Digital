'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
  }
}

export async function setPermohonanDiproses(id: number) {
  try {
    const { supabase } = await checkIsAdmin()

    const { error } = await supabase
      .from('permohonan')
      .update({ status: 'diproses' })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
  }
}

export async function setPermohonanJawab(id: number, jawaban: string) {
  try {
    const { supabase } = await checkIsAdmin()

    const { error } = await supabase
      .from('permohonan')
      .update({ 
        status: 'dijawab',
        jawaban_admin: jawaban
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
  }
}

export async function setPermohonanTolak(id: number, alasan: string) {
  try {
    const { supabase } = await checkIsAdmin()

    const { error } = await supabase
      .from('permohonan')
      .update({ 
        status: 'ditolak',
        jawaban_admin: alasan
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
  }
}

export async function setPermohonanPerpanjang(id: number, alasan: string, deadline_akhir: string) {
  try {
    const { supabase } = await checkIsAdmin()

    const { error } = await supabase
      .from('permohonan')
      .update({ 
        diperpanjang: true,
        alasan_perpanjangan: alasan,
        deadline_akhir: deadline_akhir
      })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
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
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
  }
}

export async function updateKontenKategori(id: number, judul: string, isi_teks: string) {
  try {
    const { supabase } = await checkIsAdmin()
    
    const { error } = await supabase
      .from('konten_landing')
      .update({ judul, isi_teks })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout') // Revalidate homepage and all its contents
    revalidatePath('/informasi/[kategori]', 'page') // Revalidate dynamic category pages
    return { success: true }
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
  }
}

export async function addDokumen(kategori_key: string, nama_dokumen: string, file_url: string) {
  try {
    const { supabase } = await checkIsAdmin()
    
    const { error } = await supabase
      .from('dokumen_publik')
      .insert({
        kategori_key,
        nama_dokumen,
        file_url
      })

    if (error) throw error
    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
  }
}

export async function updateDokumen(id: number | bigint, nama_dokumen: string, file_url: string) {
  try {
    const { supabase } = await checkIsAdmin()
    
    const { error } = await supabase
      .from('dokumen_publik')
      .update({ nama_dokumen, file_url })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
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
  } catch (error: any) {
    console.error('[Admin Action Error]', error)
    const msg = error?.message?.includes('Unauthorized') || error?.message?.includes('Forbidden') 
      ? error.message 
      : 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
    return { success: false, error: msg }
  }
}

// ------------------------------------------------------------------
// REPORTING ACTIONS
// ------------------------------------------------------------------

export async function getAllPermohonanForReport() {
  try {
    const { supabase } = await checkIsAdmin()

    // Fetch all requests ordered by date descending
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
      return { success: false, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (err: any) {
    console.error('[Admin Error] getAllPermohonanForReport catch:', err)
    return { success: false, data: [] }
  }
}
