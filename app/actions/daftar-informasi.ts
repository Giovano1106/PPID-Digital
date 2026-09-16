'use server'

import { createClient } from '@/app/lib/supabase/server'
import { createClient as createPublicSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import {
  DAFTAR_INFORMASI_DEFAULT,
  DaftarInformasiTable,
  DaftarInformasiItem
} from '@/app/informasi/data/daftarInformasiDefault'

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
  } catch (err: any) {
    console.error('[Daftar Informasi Action Catch]', err)
    return {
      success: true,
      data: DAFTAR_INFORMASI_DEFAULT,
      isFallback: true,
      error: err?.message,
    }
  }
}

// ============================================================================
// SEED: Inisialisasi data default ke database Supabase (1-Klik)
// ============================================================================
export async function seedInitialDaftarInformasi() {
  try {
    const { supabase } = await checkIsAdmin()

    // 1. Cek apakah sudah ada data tabel
    const { count } = await supabase
      .from('daftar_informasi_tabel')
      .select('*', { count: 'exact', head: true })

    if (count && count > 0) {
      return {
        success: false,
        error: 'Tabel database sudah memiliki data. Inisialisasi awal dibatalkan agar tidak menimpa data yang ada.',
      }
    }

    // 2. Lakukan iterasi insert tabel beserta item-itemnya
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
  } catch (err: any) {
    console.error('[Seed Daftar Informasi Error]', err)
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan saat menginisialisasi data.',
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

    const { data: newTbl, error } = await supabase
      .from('daftar_informasi_tabel')
      .insert({
        judul: data.judul,
        deskripsi: data.deskripsi || 'Tahun 2022 - 2026',
        action_type: data.action_type || 'unduh',
        urutan: data.urutan ?? 0,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true, data: newTbl }
  } catch (err: any) {
    console.error('[Create Table Error]', err)
    return { success: false, error: err?.message || 'Gagal menambahkan tabel.' }
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

    const { error } = await supabase
      .from('daftar_informasi_tabel')
      .update({
        judul: data.judul,
        deskripsi: data.deskripsi,
        action_type: data.action_type,
        urutan: data.urutan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: any) {
    console.error('[Update Table Error]', err)
    return { success: false, error: err?.message || 'Gagal memperbarui tabel.' }
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
  } catch (err: any) {
    console.error('[Delete Table Error]', err)
    return { success: false, error: err?.message || 'Gagal menghapus tabel.' }
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

    const { data: newItem, error } = await supabase
      .from('daftar_informasi_item')
      .insert({
        tabel_id: data.tabel_id,
        nama: data.nama,
        links: data.links,
        urutan: data.urutan ?? 0,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true, data: newItem }
  } catch (err: any) {
    console.error('[Create Item Error]', err)
    return { success: false, error: err?.message || 'Gagal menambahkan baris data.' }
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

    const { error } = await supabase
      .from('daftar_informasi_item')
      .update({
        nama: data.nama,
        links: data.links,
        urutan: data.urutan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/daftar-informasi')
    revalidatePath('/informasi/[kategori]', 'page')
    return { success: true }
  } catch (err: any) {
    console.error('[Update Item Error]', err)
    return { success: false, error: err?.message || 'Gagal memperbarui baris data.' }
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
  } catch (err: any) {
    console.error('[Delete Item Error]', err)
    return { success: false, error: err?.message || 'Gagal menghapus baris data.' }
  }
}
