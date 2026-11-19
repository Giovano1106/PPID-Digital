import { createClient } from '@/app/lib/supabase/server'
import { sendEmail, getAdminNotificationEmail, getAppUrl } from '@/app/lib/email/mailer'
import { getEmailTemplateByKey } from '@/app/lib/email/template-store'
import { compileEmailHtml, EmailRenderContext } from '@/app/lib/email/template-engine'

function formatDateIndo(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const parts = dateStr.split('T')[0].split('-').map(Number)
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  return dateStr
}

/**
 * Mengirim notifikasi email internal saat ada permohonan baru (hanya dipanggil dari Server Action terotentikasi).
 */
export async function dispatchNewPermohonanNotification(permohonanId: number) {
  try {
    const supabase = await createClient()
    const appUrl = getAppUrl()
    const adminEmail = getAdminNotificationEmail()

    const { data: item, error } = await supabase
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
      .eq('id', permohonanId)
      .single()

    if (error || !item) {
      console.error('[Email Notification Error] Permohonan tidak ditemukan:', permohonanId, error)
      return { success: false, error: 'Permohonan tidak ditemukan' }
    }

    const pemohonNama = item.profiles?.nama || 'Pemohon Informasi'
    const pemohonEmail = item.profiles?.email
    const pemohonNik = item.profiles?.nik || '-'
    const pemohonTelepon = item.profiles?.telepon || '-'
    const tanggalPengajuan = formatDateIndo(item.created_at)
    const deadlineAwalFormatted = formatDateIndo(item.deadline_awal)

    if (adminEmail) {
      const adminTpl = await getEmailTemplateByKey('pengajuan_baru_admin')
      const compiledAdmin = compileEmailHtml(adminTpl, {
        id: item.id,
        nama: pemohonNama,
        nik: pemohonNik,
        email: pemohonEmail || '-',
        telepon: pemohonTelepon,
        jenis_informasi: item.jenis_informasi,
        deskripsi: item.deskripsi,
        cara_memperoleh: item.cara_memperoleh,
        tanggal: tanggalPengajuan,
        deadline_awal: deadlineAwalFormatted,
        link_portal: `${appUrl}/admin`,
      })

      sendEmail({
        to: adminEmail,
        subject: compiledAdmin.subject,
        html: compiledAdmin.html,
      }).catch((err) => console.error('[Email Admin Error]', err))
    }

    if (pemohonEmail) {
      const pemohonTpl = await getEmailTemplateByKey('pengajuan_baru_pemohon')
      const compiledPemohon = compileEmailHtml(pemohonTpl, {
        id: item.id,
        nama: pemohonNama,
        jenis_informasi: item.jenis_informasi,
        deskripsi: item.deskripsi,
        tanggal: tanggalPengajuan,
        deadline_awal: deadlineAwalFormatted,
        link_portal: `${appUrl}/permohonan-saya/${item.id}`,
      })

      sendEmail({
        to: pemohonEmail,
        subject: compiledPemohon.subject,
        html: compiledPemohon.html,
      }).catch((err) => console.error('[Email Pemohon Error]', err))
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('[dispatchNewPermohonanNotification Exception]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengirim notifikasi email',
    }
  }
}

/**
 * Mengirim notifikasi email internal saat status permohonan diubah oleh Admin (hanya dipanggil dari Server Action Admin).
 */
export async function dispatchStatusUpdateNotification(
  permohonanId: number,
  status: 'diproses' | 'dijawab' | 'perpanjang' | 'tolak',
  extraData?: {
    jawabanAdmin?: string
    alasan?: string
    deadlineAkhir?: string
  }
) {
  try {
    const supabase = await createClient()
    const appUrl = getAppUrl()

    const { data: item, error } = await supabase
      .from('permohonan')
      .select(`
        *,
        profiles (
          nama,
          email
        )
      `)
      .eq('id', permohonanId)
      .single()

    if (error || !item) {
      console.error('[Email Status Update Error] Permohonan tidak ditemukan:', permohonanId, error)
      return { success: false, error: 'Permohonan tidak ditemukan' }
    }

    const pemohonEmail = item.profiles?.email
    const pemohonNama = item.profiles?.nama || 'Pemohon Informasi'

    if (!pemohonEmail) {
      return { success: true, message: 'No applicant email' }
    }

    let templateKey = ''
    const renderCtx: EmailRenderContext = {
      id: item.id,
      nama: pemohonNama,
      jenis_informasi: item.jenis_informasi,
      link_portal: `${appUrl}/permohonan-saya/${item.id}`,
    }

    switch (status) {
      case 'diproses':
        templateKey = 'status_diproses'
        break

      case 'dijawab':
        templateKey = 'jawaban_admin'
        renderCtx.jawaban_admin =
          extraData?.jawabanAdmin || item.jawaban_admin || 'Jawaban resmi telah diterbitkan.'
        break

      case 'perpanjang':
        templateKey = 'perpanjangan_sla'
        renderCtx.alasan =
          extraData?.alasan || item.alasan_perpanjangan || 'Proses penguasaan dan pengolahan dokumen teknis.'
        renderCtx.deadline_akhir = formatDateIndo(extraData?.deadlineAkhir || item.deadline_akhir)
        break

      case 'tolak': {
        templateKey = 'penolakan'
        const rawAlasan =
          extraData?.alasan || item.jawaban_admin || 'Tidak memenuhi ketentuan perundang-undangan.'
        renderCtx.alasan = rawAlasan.replace(/^\[DITOLAK\]\s*Alasan:\s*/i, '').trim()
        break
      }
    }

    if (templateKey) {
      const template = await getEmailTemplateByKey(templateKey)
      const compiled = compileEmailHtml(template, renderCtx)

      sendEmail({
        to: pemohonEmail,
        subject: compiled.subject,
        html: compiled.html,
      }).catch((err) => console.error('[Send Status Email Error]', err))
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('[dispatchStatusUpdateNotification Exception]', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengirim notifikasi status',
    }
  }
}
