'use server'

import { createClient } from '@/app/lib/supabase/server'
import { createClient as createPublicSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import {
  DAFTAR_INFORMASI_DEFAULT,
  DaftarInformasiTable,
} from '@/app/informasi/data/daftarInformasiDefault'
import { isSafePublicUrl, sanitizeUserError } from '@/app/lib/security'

function validateLinksMap(links: Record<string, string>): string | null {
  for (const [tahun, url] of Object.entries(links || {})) {
    if (!isSafePublicUrl(url, { allowRelativePath: true, allowHashPlaceholder: true })) {
      return `Tautan untuk tahun "${tahun}" tidak valid. Gunakan URL http://, https://, path /, atau #. `
    }
  }
  return null
}

function validateYearLabel(year: string): string | null {
  const trimmed = year.trim()
  if (!trimmed || trimmed.length > 20 || !/^[a-zA-Z0-9\-\s]+$/.test(trimmed)) {
    return 'Label tahun harus terdiri dari 1 sampai 20 karakter huruf/angka.'
  }
  return null
}

function getPublicClient() {
  return createPublicSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Helper untuk proteksi aksi khusus admin
async function checkIsAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized: Sesi tidak ditemukan')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Akses hanya diperuntukkan bagi Administrator')
  }

  return { supabase, user }
}

// ============================================================================
// READ: Ambil seluruh tabel & baris data (dengan Safe Fallback)
// ============================================================================
export async function getDaftarInformasiTables(): Promise<{
  success: boolean
  data: DaftarInformasiTable[]
  isFallback: boolean
  error?: string
}> {
  try {
    const supabase = getPublicClient()

    // 1. Ambil seluruh tabel
    const { data: tablesData, error: tablesError } = await supabase
      .from('daftar_informasi_tabel')
      .select('*')
      .order('urutan', { ascending: true })
      .order('id', { ascending: true })

    // Jika tabel belum dibuat di database atau query error, gunakan fallback data
    if (tablesError || !tablesData || tablesData.length === 0) {
      return {
        success: true,
        data: DAFTAR_INFORMASI_DEFAULT,
        isFallback: true,
        error: tablesError?.message,
      }
    }

    // 2. Ambil seluruh baris item
    const { data: itemsData, error: itemsError } = await supabase
      .from('daftar_informasi_item')
      .select('*')
      .order('urutan', { ascending: true })
      .order('id', { ascending: true })

    if (itemsError) {
      console.warn('[Daftar Informasi] Gagal membaca item, fallback:', itemsError)
      return {
        success: true,
        data: DAFTAR_INFORMASI_DEFAULT,
        isFallback: true,
        error: itemsError.message,
      }
    }

    // Kelompokkan item ke dalam tabel induk masing-masing
    const fullTables: DaftarInformasiTable[] = tablesData.map((tbl) => {
      const items = (itemsData || [])
        .filter((it) => it.tabel_id === tbl.id)
        .map((it) => ({
          id: it.id,
          tabel_id: it.tabel_id,
          nama: it.nama,
          links: (it.links || {}) as Record<string, string>,
          urutan: it.urutan,
        }))

      return {
        id: tbl.id,
        judul: tbl.judul,
        deskripsi: tbl.deskripsi || 'Tahun 2022 - 2026',
        action_type: tbl.action_type || 'unduh',
        urutan: tbl.urutan || 0,
        items,
      }
    })

    return {
      success: true,
      data: fullTables,
      isFallback: false,
    }
  } catch (err: unknown) {
    console.error('[Daftar Informasi Action Catch]', err)
    return {
      success: true,
      data: DAFTAR_INFORMASI_DEFAULT,
      isFallback: true,
      error: 'Gagal memuat tabel dari database, menampilkan data standar.',
    }
  }
}

// ============================================================================
// SEED: Inisialisasi data default ke database Supabase (1-Klik)
// ============================================================================
export async function seedInitialDaftarInformasi() {
  try {
    const { supabase } = await checkIsAdmin()

    const { count } = await supabase
      .from('daftar_informasi_tabel')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      return {
        success: false,
        error: 'Tabel database sudah memiliki data. Inisialisasi awal dibatalkan agar tidak menimpa data yang ada.',
      }
    }

    for (const tbl of DAFTAR_INFORMASI_DEFAULT) {
      const { data: newTbl, error: tblErr } = await supabase
        .from('daftar_informasi_tabel')
        .insert({
          judul: tbl.judul,
          deskripsi: tbl.deskripsi,
          action_type: tbl.action_type,
          urutan: tbl.urutan,
        })
        .select('id')
        .single()

      if (tblErr) throw tblErr

      if (tbl.items && tbl.items.length > 0 && newTbl) {
        const itemsToInsert = tbl.items.map((item, idx) => ({
          tabel_id: newTbl.id,
          nama: item.nama,
          links: item.links,
          urutan: idx + 1,
        }))

        const { error: itemErr } = await supabase
          .from('daftar_informasi_item')
          .insert(itemsToInsert)

        if (itemErr) throw itemErr
      }
    }

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: unknown) {
    console.error('[Seed Daftar Informasi Error]', err)
    return {
      success: false,
      error: sanitizeUserError(err, 'Terjadi kesalahan saat menginisialisasi data.'),
    }
  }
}

// ============================================================================
// TABEL CRUD ACTIONS
// ============================================================================
export async function createDaftarInformasiTable(data: {
  judul: string
  deskripsi?: string
  action_type: 'unduh' | 'klik'
  urutan?: number
}) {
  try {
    const { supabase } = await checkIsAdmin()
    const cleanJudul = data.judul.trim()
    if (!cleanJudul) {
      return { success: false, error: 'Judul tabel tidak boleh kosong.' }
    }

    const { data: newTbl, error } = await supabase
      .from('daftar_informasi_tabel')
      .insert({
        judul: cleanJudul,
        deskripsi: data.deskripsi?.trim() || 'Tahun 2022 - 2026',
        action_type: data.action_type || 'unduh',
        urutan: data.urutan ?? 0,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true, data: newTbl }
  } catch (err: unknown) {
    console.error('[Create Table Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal menambahkan tabel.') }
  }
}

export async function updateDaftarInformasiTable(
  id: number | bigint,
  data: {
    judul: string
    deskripsi?: string
    action_type: 'unduh' | 'klik'
    urutan?: number
  }
) {
  try {
    const { supabase } = await checkIsAdmin()
    const cleanJudul = data.judul.trim()
    if (!cleanJudul) {
      return { success: false, error: 'Judul tabel tidak boleh kosong.' }
    }

    const { error } = await supabase
      .from('daftar_informasi_tabel')
      .update({
        judul: cleanJudul,
        deskripsi: data.deskripsi?.trim(),
        action_type: data.action_type,
        urutan: data.urutan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: unknown) {
    console.error('[Update Table Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal memperbarui tabel.') }
  }
}

export async function deleteDaftarInformasiTable(id: number | bigint) {
  try {
    const { supabase } = await checkIsAdmin()

    const { error } = await supabase
      .from('daftar_informasi_tabel')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: unknown) {
    console.error('[Delete Table Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal menghapus tabel.') }
  }
}

// ============================================================================
// ITEM / BARIS DATA CRUD ACTIONS
// ============================================================================
export async function createDaftarInformasiItem(data: {
  tabel_id: number | bigint
  nama: string
  links: Record<string, string>
  urutan?: number
}) {
  try {
    const { supabase } = await checkIsAdmin()
    const cleanNama = data.nama.trim()
    if (!cleanNama) {
      return { success: false, error: 'Nama data tidak boleh kosong.' }
    }
    const linkErr = validateLinksMap(data.links)
    if (linkErr) {
      return { success: false, error: linkErr }
    }

    const { data: newItem, error } = await supabase
      .from('daftar_informasi_item')
      .insert({
        tabel_id: data.tabel_id,
        nama: cleanNama,
        links: data.links,
        urutan: data.urutan ?? 0,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true, data: newItem }
  } catch (err: unknown) {
    console.error('[Create Item Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal menambahkan baris data.') }
  }
}

export async function updateDaftarInformasiItem(
  id: number | bigint,
  data: {
    nama: string
    links: Record<string, string>
    urutan?: number
  }
) {
  try {
    const { supabase } = await checkIsAdmin()
    const cleanNama = data.nama.trim()
    if (!cleanNama) {
      return { success: false, error: 'Nama data tidak boleh kosong.' }
    }
    const linkErr = validateLinksMap(data.links)
    if (linkErr) {
      return { success: false, error: linkErr }
    }

    const { error } = await supabase
      .from('daftar_informasi_item')
      .update({
        nama: cleanNama,
        links: data.links,
        urutan: data.urutan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: unknown) {
    console.error('[Update Item Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal memperbarui baris data.') }
  }
}

export async function deleteDaftarInformasiItem(id: number | bigint) {
  try {
    const { supabase } = await checkIsAdmin()

    const { error } = await supabase
      .from('daftar_informasi_item')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: unknown) {
    console.error('[Delete Item Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal menghapus baris data.') }
  }
}

// ============================================================================
// MANAJEMEN KOLOM TAHUN DINAMIS (TAMBAH / EDIT / HAPUS)
// ============================================================================

export async function addTahunToTable(
  tableId: number | bigint,
  newYear: string,
  applyToAllTables: boolean = false
) {
  try {
    const { supabase } = await checkIsAdmin()
    const trimmedYear = newYear.trim()
    const yearErr = validateYearLabel(trimmedYear)
    if (yearErr) {
      return { success: false, error: yearErr }
    }

    let query = supabase.from('daftar_informasi_item').select('id, tabel_id, links')
    if (!applyToAllTables) {
      query = query.eq('tabel_id', tableId)
    }

    const { data: items, error: fetchErr } = await query
    if (fetchErr) throw fetchErr

    if (!items || items.length === 0) {
      return {
        success: false,
        error:
          'Tabel belum memiliki baris data. Tambahkan minimal 1 baris data terlebih dahulu untuk menambah kolom tahun.',
      }
    }

    for (const item of items) {
      const links = (item.links || {}) as Record<string, string>
      if (!(trimmedYear in links)) {
        const updatedLinks = { ...links, [trimmedYear]: '#' }
        const { error: updErr } = await supabase
          .from('daftar_informasi_item')
          .update({
            links: updatedLinks,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
        if (updErr) throw updErr
      }
    }

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: unknown) {
    console.error('[addTahunToTable Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal menambahkan tahun.') }
  }
}

export async function editTahunInTable(
  tableId: number | bigint,
  oldYear: string,
  newYear: string,
  applyToAllTables: boolean = false
) {
  try {
    const { supabase } = await checkIsAdmin()
    const trimmedOld = oldYear.trim()
    const trimmedNew = newYear.trim()

    const yearErr = validateYearLabel(trimmedNew)
    if (yearErr) {
      return { success: false, error: yearErr }
    }
    if (trimmedOld === trimmedNew) {
      return { success: true }
    }

    let query = supabase.from('daftar_informasi_item').select('id, tabel_id, links')
    if (!applyToAllTables) {
      query = query.eq('tabel_id', tableId)
    }

    const { data: items, error: fetchErr } = await query
    if (fetchErr) throw fetchErr

    if (items && items.length > 0) {
      for (const item of items) {
        const links = (item.links || {}) as Record<string, string>
        if (trimmedOld in links) {
          const val = links[trimmedOld] || '#'
          const updatedLinks = { ...links, [trimmedNew]: val }
          delete updatedLinks[trimmedOld]
          const { error: updErr } = await supabase
            .from('daftar_informasi_item')
            .update({
              links: updatedLinks,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id)
          if (updErr) throw updErr
        }
      }
    }

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: unknown) {
    console.error('[editTahunInTable Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal mengubah tahun.') }
  }
}

export async function deleteTahunFromTable(
  tableId: number | bigint,
  yearToDelete: string,
  applyToAllTables: boolean = false
) {
  try {
    const { supabase } = await checkIsAdmin()
    const trimmedYear = yearToDelete.trim()

    if (!trimmedYear) {
      return { success: false, error: 'Tahun tidak boleh kosong.' }
    }

    let query = supabase.from('daftar_informasi_item').select('id, tabel_id, links')
    if (!applyToAllTables) {
      query = query.eq('tabel_id', tableId)
    }

    const { data: items, error: fetchErr } = await query
    if (fetchErr) throw fetchErr

    if (items && items.length > 0) {
      for (const item of items) {
        const links = (item.links || {}) as Record<string, string>
        if (trimmedYear in links) {
          const updatedLinks = { ...links }
          delete updatedLinks[trimmedYear]
          const { error: updErr } = await supabase
            .from('daftar_informasi_item')
            .update({
              links: updatedLinks,
              updated_at: new Date().toISOString(),
            })
            .eq('id', item.id)
          if (updErr) throw updErr
        }
      }
    }

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: unknown) {
    console.error('[deleteTahunFromTable Error]', err)
    return { success: false, error: sanitizeUserError(err, 'Gagal menghapus tahun.') }
  }
}
