'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CompleteProfileInput {
  nama: string
  nik: string
  telepon: string
}

/**
 * Menyimpan kelengkapan data diri pemohon baru (NIK & Telepon) setelah registrasi via Google
 */
export async function completeUserProfile(input: CompleteProfileInput) {
  try {
    const supabase = await createClient()

    // 1. Verifikasi Sesi Login
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login Anda telah berakhir. Silakan masuk kembali.' }
    }

    // 2. Validasi Nama Lengkap
    const cleanNama = input.nama.trim()
    if (cleanNama.length < 3) {
      return { success: false, error: 'Nama lengkap minimal terdiri dari 3 karakter.' }
    }

    const nameRegex = /^[a-zA-Z\s'\.]+$/
    if (!nameRegex.test(cleanNama)) {
      return {
        success: false,
        error: "Nama lengkap hanya boleh berisi huruf, spasi, titik (.), dan tanda petik (').",
      }
    }

    // 3. Validasi NIK (Wajib tepat 16 digit angka)
    const cleanNik = input.nik.trim().replace(/\D/g, '')
    if (!/^\d{16}$/.test(cleanNik)) {
      return { success: false, error: 'NIK wajib terdiri dari tepat 16 digit angka.' }
    }

    // 4. Validasi Nomor Telepon / WA (Format Indonesia)
    const cleanTelepon = input.telepon.trim().replace(/\s+/g, '')
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/
    if (!phoneRegex.test(cleanTelepon)) {
      return {
        success: false,
        error: 'Nomor telepon/WA tidak valid. Masukkan nomor yang diawali 08... atau 628... (10-14 digit).',
      }
    }

    // 5. Cek apakah NIK sudah digunakan oleh akun lain (via RPC security definer)
    const { data: isDuplicate, error: checkError } = await supabase.rpc('is_nik_registered', {
      p_nik: cleanNik,
      p_exclude_user_id: user.id,
    })

    if (checkError) {
      console.warn('[RPC is_nik_registered fallback]', checkError)
      // Fallback query jika RPC belum dimigrasikan
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('nik', cleanNik)
        .neq('id', user.id)
        .maybeSingle()

      if (existingProfile) {
        return {
          success: false,
          error: 'NIK ini sudah terdaftar pada akun pemohon lain. Silakan periksa kembali NIK Anda.',
        }
      }
    } else if (isDuplicate) {
      return {
        success: false,
        error: 'NIK ini sudah terdaftar pada akun pemohon lain. Silakan periksa kembali NIK Anda.',
      }
    }

    // 6. Simpan / Perbarui Data Diri di Tabel profiles
    const { data: existingProf } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    let updateError
    if (existingProf) {
      const { error } = await supabase
        .from('profiles')
        .update({
          nama: cleanNama,
          nik: cleanNik,
          telepon: cleanTelepon,
        })
        .eq('id', user.id)
      updateError = error
    } else {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          nama: cleanNama,
          nik: cleanNik,
          telepon: cleanTelepon,
          role: 'pemohon',
        })
      updateError = error
    }

    if (updateError) {
      console.error('[Update Profile Error]', updateError)
      return {
        success: false,
        error: 'Gagal menyimpan data diri. Terjadi kendala sistem, silakan coba lagi.',
      }
    }

    revalidatePath('/permohonan-saya')
    return { success: true }
  } catch (err: unknown) {
    console.error('[Complete Profile Action Error]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat menyimpan data diri.',
    }
  }
}

/**
 * Mencari email terdaftar berdasarkan NIK (digunakan saat login melalui form dengan NIK)
 */
export async function getEmailByNik(nik: string) {
  try {
    const cleanNik = nik.trim().replace(/\D/g, '')
    if (!/^\d{16}$/.test(cleanNik)) {
      return { success: false, error: 'NIK harus terdiri dari 16 digit angka.' }
    }

    const supabase = await createClient()

    // Panggil fungsi RPC get_email_by_nik yang aman (security definer)
    const { data, error } = await supabase.rpc('get_email_by_nik', { p_nik: cleanNik })

    if (error) {
      console.warn('[RPC get_email_by_nik fallback]', error)
      // Fallback query langsung jika RPC belum dieksekusi
      const { data: directData } = await supabase
        .from('profiles')
        .select('email')
        .eq('nik', cleanNik)
        .maybeSingle()

      if (directData?.email) {
        return { success: true, email: directData.email }
      }

      return { success: false, error: 'NIK tidak ditemukan dalam sistem.' }
    }

    if (!data) {
      return { success: false, error: 'NIK tidak ditemukan dalam sistem.' }
    }

    return { success: true, email: data as string }
  } catch (err: unknown) {
    console.error('[getEmailByNik Error]', err)
    return {
      success: false,
      error: 'Terjadi kesalahan saat memeriksa NIK.',
    }
  }
}
