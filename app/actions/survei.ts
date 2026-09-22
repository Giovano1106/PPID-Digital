'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface InputSurveiKepuasan {
  permohonanId: number
  skorKeseluruhan: number
  kecepatanLayanan: number
  kesesuaianInformasi: number
  kemudahanProsedur: number
  kritikSaran?: string
}

export interface MutuPelayanan {
  nilai: 'A' | 'B' | 'C' | 'D' | '-'
  kategori: 'Sangat Baik' | 'Baik' | 'Kurang Baik' | 'Tidak Baik' | 'Belum Ada Data'
  badgeColor: string
}

export interface SurveiKepuasanRow {
  id: number
  permohonan_id: number
  user_id: string
  skor_keseluruhan: number
  kecepatan_layanan: number
  kesesuaian_informasi: number
  kemudahan_prosedur: number
  kritik_saran: string | null
  created_at: string
  permohonan?: {
    id: number
    nomor_registrasi: string
    deskripsi: string
  } | null
  profiles?: {
    nama: string
    email: string
  } | null
}

export interface StatistikIKM {
  totalResponden: number
  rataRataKeseluruhan: number
  rataRataKecepatan: number
  rataRataKesesuaian: number
  rataRataKemudahan: number
  indeksIKM: number
  ikmKonversi: number
  mutu: MutuPelayanan
  distribusiSkor: { [key: number]: number }
  reviews: SurveiKepuasanRow[]
  isTableMissing?: boolean
}

/**
 * Menghitung Mutu Pelayanan & Kategori Kinerja berdasarkan standar PermenPAN-RB No. 14 Tahun 2017:
 * - 88.31 s.d. 100.00 : Mutu A (Sangat Baik)
 * - 76.61 s.d. 88.30  : Mutu B (Baik)
 * - 65.00 s.d. 76.60  : Mutu C (Kurang Baik)
 * - 25.00 s.d. 64.99  : Mutu D (Tidak Baik)
 */
export function hitungMutuPelayanan(ikmKonversi: number, totalResponden: number): MutuPelayanan {
  if (totalResponden === 0 || isNaN(ikmKonversi) || ikmKonversi <= 0) {
    return {
      nilai: '-',
      kategori: 'Belum Ada Data',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  if (ikmKonversi >= 88.31) {
    return {
      nilai: 'A',
      kategori: 'Sangat Baik',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  } else if (ikmKonversi >= 76.61) {
    return {
      nilai: 'B',
      kategori: 'Baik',
      badgeColor: 'bg-blue-50 text-[#0e4891] border-blue-200'
    }
  } else if (ikmKonversi >= 65.00) {
    return {
      nilai: 'C',
      kategori: 'Kurang Baik',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    }
  } else {
    return {
      nilai: 'D',
      kategori: 'Tidak Baik',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  }
}

/**
 * Submit Penilaian Survei Kepuasan Masyarakat oleh Pemohon
 */
export async function submitSurveiKepuasan(payload: InputSurveiKepuasan) {
  try {
    const supabase = await createClient()

    // 1. Validasi Autentikasi Pengguna
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi Anda telah berakhir. Silakan masuk kembali.' }
    }

    // 2. Validasi Nilai Skor (1 s.d. 5)
    const scores = [
      payload.skorKeseluruhan,
      payload.kecepatanLayanan,
      payload.kesesuaianInformasi,
      payload.kemudahanProsedur,
    ]

    for (const s of scores) {
      if (typeof s !== 'number' || s < 1 || s > 5 || !Number.isInteger(s)) {
        return { success: false, error: 'Semua unsur penilaian wajib diisi dengan skala 1 sampai 5.' }
      }
    }

    if (!payload.permohonanId) {
      return { success: false, error: 'ID Permohonan tidak valid.' }
    }

    // 3. Validasi Kepemilikan & Status Permohonan
    const { data: permohonan, error: permError } = await supabase
      .from('permohonan')
      .select('id, user_id, status')
      .eq('id', payload.permohonanId)
      .single()

    if (permError || !permohonan) {
      return { success: false, error: 'Data permohonan informasi tidak ditemukan.' }
    }

    if (permohonan.user_id !== user.id) {
      return { success: false, error: 'Anda tidak memiliki hak akses untuk memberikan survei pada permohonan ini.' }
    }

    if (permohonan.status !== 'dijawab') {
      return {
        success: false,
        error: 'Survei kepuasan hanya dapat diisi apabila permohonan informasi telah dijawab secara resmi oleh admin PPID.',
      }
    }

    // 4. Masukkan Data ke Tabel survei_kepuasan
    const { error: insertError } = await supabase
      .from('survei_kepuasan')
      .insert({
        permohonan_id: payload.permohonanId,
        user_id: user.id,
        skor_keseluruhan: payload.skorKeseluruhan,
        kecepatan_layanan: payload.kecepatanLayanan,
        kesesuaian_informasi: payload.kesesuaianInformasi,
        kemudahan_prosedur: payload.kemudahanProsedur,
        kritik_saran: payload.kritikSaran?.trim() || null,
      })

    if (insertError) {
      // Kode PostgreSQL 23505: unique_violation
      if (insertError.code === '23505') {
        return { success: false, error: 'Anda sudah pernah mengisi survei kepuasan untuk permohonan ini.' }
      }
      // Kode PostgreSQL 42P01: undefined_table
      if (insertError.code === '42P01') {
        return {
          success: false,
          error: 'Tabel survei belum diterapkan di database Supabase. Silakan jalankan file migrasi 0004_survei_kepuasan.sql.',
        }
      }
      throw insertError
    }

    // Revalidasi Halaman
    revalidatePath(`/permohonan-saya/${payload.permohonanId}`)
    revalidatePath('/admin/survei')

    return {
      success: true,
      message: 'Terima kasih atas partisipasi Anda dalam survei kepuasan masyarakat PPID CIKASDA.',
    }
  } catch (error: any) {
    console.error('[submitSurveiKepuasan Error]', error)
    return {
      success: false,
      error: error?.message || 'Terjadi gangguan saat menyimpan hasil survei. Silakan coba kembali.',
    }
  }
}

/**
 * Cek Apakah Permohonan Tertentu Sudah Pernah Diisi Surveinya
 */
export async function getSurveiByPermohonanId(permohonanId: number) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized', data: null }
    }

    const { data, error } = await supabase
      .from('survei_kepuasan')
      .select('*')
      .eq('permohonan_id', permohonanId)
      .maybeSingle()

    if (error) {
      if (error.code === '42P01') {
        return { success: true, data: null }
      }
      throw error
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('[getSurveiByPermohonanId Error]', error)
    return { success: false, error: error?.message || 'Gagal memuat data survei', data: null }
  }
}

/**
 * Mengambil Statistik & Rekapitulasi IKM untuk Dashboard Admin PPID
 */
export async function getStatistikIKMAdmin(filters?: { startDate?: string; endDate?: string }): Promise<{
  success: boolean
  data: StatistikIKM | null
  error?: string
}> {
  try {
    const supabase = await createClient()

    // 1. Verifikasi Hak Akses Admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized: Sesi login tidak ditemukan')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      throw new Error('Forbidden: Akses hanya diperuntukkan bagi Administrator PPID')
    }

    // 2. Query Data Survei beserta relasi permohonan & profile
    let query = supabase
      .from('survei_kepuasan')
      .select(`
        id,
        permohonan_id,
        user_id,
        skor_keseluruhan,
        kecepatan_layanan,
        kesesuaian_informasi,
        kemudahan_prosedur,
        kritik_saran,
        created_at,
        permohonan (
          id,
          nomor_registrasi,
          deskripsi
        ),
        profiles (
          nama,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          data: {
            totalResponden: 0,
            rataRataKeseluruhan: 0,
            rataRataKecepatan: 0,
            rataRataKesesuaian: 0,
            rataRataKemudahan: 0,
            indeksIKM: 0,
            ikmKonversi: 0,
            mutu: hitungMutuPelayanan(0, 0),
            distribusiSkor: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            reviews: [],
            isTableMissing: true,
          },
        }
      }
      throw error
    }

    const rows = (data || []) as unknown as SurveiKepuasanRow[]
    const totalResponden = rows.length

    if (totalResponden === 0) {
      return {
        success: true,
        data: {
          totalResponden: 0,
          rataRataKeseluruhan: 0,
          rataRataKecepatan: 0,
          rataRataKesesuaian: 0,
          rataRataKemudahan: 0,
          indeksIKM: 0,
          ikmKonversi: 0,
          mutu: hitungMutuPelayanan(0, 0),
          distribusiSkor: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          reviews: [],
        },
      }
    }

    // 3. Kalkulasi Rata-rata Tiap Aspek Layanan
    const sumKeseluruhan = rows.reduce((acc, r) => acc + r.skor_keseluruhan, 0)
    const sumKecepatan = rows.reduce((acc, r) => acc + r.kecepatan_layanan, 0)
    const sumKesesuaian = rows.reduce((acc, r) => acc + r.kesesuaian_informasi, 0)
    const sumKemudahan = rows.reduce((acc, r) => acc + r.kemudahan_prosedur, 0)

    const rataRataKeseluruhan = Number((sumKeseluruhan / totalResponden).toFixed(2))
    const rataRataKecepatan = Number((sumKecepatan / totalResponden).toFixed(2))
    const rataRataKesesuaian = Number((sumKesesuaian / totalResponden).toFixed(2))
    const rataRataKemudahan = Number((sumKemudahan / totalResponden).toFixed(2))

    // Indeks Rata-rata 4 Unsur Layanan (Skala 1 - 5)
    const indeksIKM = Number(
      ((rataRataKeseluruhan + rataRataKecepatan + rataRataKesesuaian + rataRataKemudahan) / 4).toFixed(2)
    )

    // Konversi Skala 25 - 100 sesuai PermenPAN-RB No. 14/2017
    const ikmKonversi = Number((indeksIKM * 20).toFixed(2))

    // Distribusi Peringkat Bintang Skor Keseluruhan
    const distribusiSkor: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const r of rows) {
      if (distribusiSkor[r.skor_keseluruhan] !== undefined) {
        distribusiSkor[r.skor_keseluruhan]++
      }
    }

    const mutu = hitungMutuPelayanan(ikmKonversi, totalResponden)

    return {
      success: true,
      data: {
        totalResponden,
        rataRataKeseluruhan,
        rataRataKecepatan,
        rataRataKesesuaian,
        rataRataKemudahan,
        indeksIKM,
        ikmKonversi,
        mutu,
        distribusiSkor,
        reviews: rows,
      },
    }
  } catch (error: any) {
    console.error('[getStatistikIKMAdmin Error]', error)
    return {
      success: false,
      error: error?.message || 'Gagal memuat rekapitulasi data survei kepuasan',
      data: null,
    }
  }
}
