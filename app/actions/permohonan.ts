'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addWorkingDaysWita, sanitizeUserError } from '@/app/lib/security'
import { dispatchNewPermohonanNotification } from '@/app/lib/email/notifications'

const ALLOWED_JENIS_INFORMASI = new Set([
  'Dokumen Program dan Kegiatan',
  'Surat Keputusan (SK) & Kebijakan',
  'SOP dan Standar Pelayanan Minimal',
  'Informasi Berkala (Laporan Kinerja & Keuangan)',
  'Informasi Serta Merta',
  'Informasi Setiap Saat',
  'Data Teknis Sumber Daya Air & Cipta Karya',
  'Informasi Publik Lainnya',
])

const ALLOWED_CARA_MEMPEROLEH = new Set([
  'Melihat / Membaca / Mendengarkan',
  'Salinan Elektronik (Softcopy / Digital)',
  'Salinan Cetak (Hardcopy)',
])

export interface SubmitPermohonanInput {
  jenis_informasi: string
  deskripsi: string
  cara_memperoleh: string
}

/**
 * Mengajukan permohonan informasi publik baru secara aman di sisi server.
 */
export async function submitPermohonanInformasi(input: SubmitPermohonanInput): Promise<{
  success: boolean
  id?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Sesi Anda telah berakhir. Silakan login kembali.',
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('nama, nik, telepon')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.nama?.trim() || !profile?.nik?.trim() || !profile?.telepon?.trim()) {
      return {
        success: false,
        error: 'Harap lengkapi data diri (Nama, NIK, dan Nomor Telepon) sebelum mengajukan permohonan.',
      }
    }

    const jenisInformasi = input.jenis_informasi?.trim() || ''
    const caraMemperoleh = input.cara_memperoleh?.trim() || ''
    const cleanDeskripsi = input.deskripsi?.trim() || ''

    if (!ALLOWED_JENIS_INFORMASI.has(jenisInformasi)) {
      return {
        success: false,
        error: 'Kategori jenis informasi publik tidak valid.',
      }
    }

    if (!ALLOWED_CARA_MEMPEROLEH.has(caraMemperoleh)) {
      return {
        success: false,
        error: 'Pilihan bentuk salinan / cara memperoleh tidak valid.',
      }
    }

    if (cleanDeskripsi.length < 10 || cleanDeskripsi.length > 4000) {
      return {
        success: false,
        error: 'Deskripsi rincian kebutuhan informasi harus terdiri dari 10 sampai 4000 karakter.',
      }
    }

    const deadlineAwal = addWorkingDaysWita(null, 10)

    const { data: insertedData, error: insertError } = await supabase
      .from('permohonan')
      .insert({
        user_id: user.id,
        jenis_informasi: jenisInformasi,
        deskripsi: cleanDeskripsi,
        cara_memperoleh: caraMemperoleh,
        status: 'diajukan',
        deadline_awal: deadlineAwal,
      })
      .select('id')
      .single()

    if (insertError || !insertedData) {
      console.error('[submitPermohonanInformasi Error]', insertError)
      return {
        success: false,
        error: 'Gagal mengirim permohonan. Terjadi kesalahan sistem, silakan coba beberapa saat lagi.',
      }
    }

    dispatchNewPermohonanNotification(insertedData.id).catch((err) => {
      console.error('[Email Notification Error] dispatchNewPermohonanNotification:', err)
    })

    revalidatePath('/permohonan-saya')
    revalidatePath('/admin')

    return {
      success: true,
      id: insertedData.id,
    }
  } catch (error: unknown) {
    console.error('[submitPermohonanInformasi Exception]', error)
    return {
      success: false,
      error: sanitizeUserError(
        error,
        'Gagal mengirim permohonan. Silakan coba beberapa saat lagi.'
      ),
    }
  }
}
