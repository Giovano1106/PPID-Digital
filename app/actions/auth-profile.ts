'use server'

import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient, isSupabaseAdminConfigured } from '@/app/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getAppUrl, sendEmail } from '@/app/lib/email/mailer'
import { getEmailTemplateByKey } from '@/app/lib/email/template-store'
import { compileEmailHtml } from '@/app/lib/email/template-engine'

export interface CompleteProfileInput {
  nama: string
  nik: string
  telepon: string
}

interface AuthRateRecord {
  count: number
  resetAt: number
}

const authRateLimitMap = new Map<string, AuthRateRecord>()

function checkAuthRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now()
  if (authRateLimitMap.size > 1000) {
    for (const [k, v] of authRateLimitMap.entries()) {
      if (now > v.resetAt) authRateLimitMap.delete(k)
    }
  }
  const existing = authRateLimitMap.get(key)
  if (!existing || now > existing.resetAt) {
    authRateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (existing.count >= maxAttempts) {
    return false
  }
  existing.count += 1
  return true
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

    const nameRegex = /^[a-zA-Z\s'\.,-]+$/
    if (!nameRegex.test(cleanNama)) {
      return {
        success: false,
        error:
          "Nama lengkap hanya boleh berisi huruf, spasi, titik (.), koma (,), tanda hubung (-), dan tanda petik (').",
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
 * Login aman menggunakan Email atau NIK 16 digit di sisi server (mencegah enumerasi NIK ke email di browser).
 */
export async function signInWithEmailOrNik(identifier: string, password: string): Promise<{
  success: boolean
  redirectTo?: string
  error?: string
}> {
  try {
    const rawInput = identifier.trim()
    if (!rawInput || !password) {
      return {
        success: false,
        error: 'Email/NIK dan kata sandi wajib diisi.',
      }
    }

    const rateKey = `login:${rawInput.toLowerCase()}`
    if (!checkAuthRateLimit(rateKey, 10, 5 * 60 * 1000)) {
      return {
        success: false,
        error: 'Terlalu banyak percobaan masuk. Silakan tunggu beberapa menit lalu coba lagi.',
      }
    }

    const supabase = await createClient()
    let targetEmail = rawInput

    const digitsOnly = rawInput.replace(/\D/g, '')
    const isNik = digitsOnly.length === 16 && !rawInput.includes('@')

    if (isNik) {
      const { data: resolvedEmail } = await supabase.rpc('get_email_by_nik', {
        p_nik: digitsOnly,
      })

      if (!resolvedEmail || typeof resolvedEmail !== 'string') {
        return {
          success: false,
          error: 'Email/NIK atau kata sandi tidak cocok. Silakan periksa kembali.',
        }
      }
      targetEmail = resolvedEmail
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    })

    if (error || !authData?.user) {
      return {
        success: false,
        error: 'Email/NIK atau kata sandi tidak cocok. Silakan periksa kembali.',
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle()

    const redirectTo = profile?.role === 'admin' ? '/admin' : '/permohonan-saya'
    revalidatePath('/', 'layout')

    return {
      success: true,
      redirectTo,
    }
  } catch (err: unknown) {
    console.error('[signInWithEmailOrNik Error]', err)
    return {
      success: false,
      error: 'Email/NIK atau kata sandi tidak cocok. Silakan periksa kembali.',
    }
  }
}

/**
 * Mengirim tautan reset kata sandi via Email atau NIK di sisi server dengan respons seragam (anti-enumerasi).
 */
export async function requestPasswordReset(identifier: string): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  const uniformMessage =
    'Jika email atau NIK tersebut terdaftar, tautan pemulihan kata sandi telah dikirim ke kotak masuk email Anda.'

  try {
    const rawInput = identifier.trim()
    const digitsOnly = rawInput.replace(/\D/g, '')
    const isNik = digitsOnly.length === 16 && !rawInput.includes('@')
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawInput)

    if (!isNik && !isEmail) {
      return {
        success: false,
        error: 'Masukkan alamat email yang valid atau NIK tepat 16 digit.',
      }
    }

    const rateKey = `reset:${(isNik ? digitsOnly : rawInput).toLowerCase()}`
    if (!checkAuthRateLimit(rateKey, 5, 10 * 60 * 1000)) {
      return {
        success: false,
        error: 'Terlalu banyak permintaan pemulihan sandi. Silakan tunggu beberapa menit.',
      }
    }

    const supabase = await createClient()
    let targetEmail = isEmail ? rawInput : ''

    if (isNik) {
      const { data: resolvedEmail } = await supabase.rpc('get_email_by_nik', {
        p_nik: digitsOnly,
      })
      if (resolvedEmail && typeof resolvedEmail === 'string') {
        targetEmail = resolvedEmail
      }
    }

    if (targetEmail) {
      const hasSmtpPass = Boolean(process.env.SMTP_PASS?.trim())

      if (isSupabaseAdminConfigured() && hasSmtpPass) {
        const adminClient = createAdminClient()
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
          type: 'recovery',
          email: targetEmail,
        })

        if (linkError) {
          console.warn('[requestPasswordReset generateLink Notice]', linkError.message)
        } else if (linkData?.properties?.hashed_token) {
          const { data: profileRow } = await adminClient
            .from('profiles')
            .select('nama')
            .ilike('email', targetEmail)
            .maybeSingle()

          const userMeta = linkData.user?.user_metadata as
            | { nama?: string; full_name?: string; name?: string }
            | undefined
          const resolvedNama =
            profileRow?.nama?.trim() ||
            userMeta?.nama?.trim() ||
            userMeta?.full_name?.trim() ||
            userMeta?.name?.trim() ||
            'Pengguna Portal PPID'

          const recoveryUrl = `${getAppUrl()}/update-sandi?token_hash=${encodeURIComponent(
            linkData.properties.hashed_token
          )}&type=recovery`

          const resetTemplate = await getEmailTemplateByKey('reset_sandi')
          const compiled = compileEmailHtml(resetTemplate, {
            nama: resolvedNama,
            email: targetEmail,
            link_portal: recoveryUrl,
          })

          const sendResult = await sendEmail({
            to: targetEmail,
            subject: compiled.subject,
            html: compiled.html,
          })

          if (!sendResult.success) {
            console.error('[requestPasswordReset SendEmail Error]', sendResult.error)
          }
        }
      } else {
        console.warn(
          '[requestPasswordReset] SUPABASE_SERVICE_ROLE_KEY atau SMTP_PASS belum disetel, menggunakan mailer Supabase default.'
        )
        const redirectTo = `${getAppUrl()}/api/auth/callback?next=/update-sandi`
        const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
          redirectTo,
        })
        if (error) {
          console.warn('[requestPasswordReset Notice]', error.message)
        }
      }
    }

    return {
      success: true,
      message: uniformMessage,
    }
  } catch (err: unknown) {
    console.error('[requestPasswordReset Exception]', err)
    return {
      success: true,
      message: uniformMessage,
    }
  }
}
