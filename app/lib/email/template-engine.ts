import { EmailTemplateData, DEFAULT_EMAIL_TEMPLATES } from './default-templates'
import { wrapEmailTemplate } from './templates'

export interface EmailRenderContext {
  id?: number | string
  nama?: string
  nik?: string
  email?: string
  telepon?: string
  jenis_informasi?: string
  deskripsi?: string
  cara_memperoleh?: string
  tanggal?: string
  deadline_awal?: string
  deadline_akhir?: string
  jawaban_admin?: string
  alasan?: string
  link_portal?: string
  [key: string]: any
}

export const DUMMY_PREVIEW_CONTEXT: EmailRenderContext = {
  id: '14',
  nama: 'Budi Santoso, S.T.',
  nik: '7271012345670001',
  email: 'budi.santoso@email.com',
  telepon: '081234567890',
  jenis_informasi: 'Dokumen Program dan Kegiatan',
  deskripsi:
    'Permohonan Salinan Rencana Anggaran Biaya (RAB) dan Kerangka Acuan Kerja (KAK) Pembangunan Prasarana Pengendali Banjir Wilayah Sungai Palu Tahun Anggaran 2025.',
  cara_memperoleh: 'Melihat / Membaca / Mendengarkan',
  tanggal: '18 September 2026',
  deadline_awal: '2 Oktober 2026',
  deadline_akhir: '11 Oktober 2026',
  jawaban_admin:
    'Permohonan informasi publik telah disetujui. Dokumen salinan KAK dan ringkasan teknis telah diunggah ke portal resmi dan dapat diunduh melalui tautan terlampir.',
  alasan:
    'Perpanjangan waktu 7 (tujuh) hari kerja diperlukan sehubungan dengan proses penelusuran dan verifikasi dokumen teknis pada Balai Wilayah Sungai.',
  link_portal: 'http://localhost:3000/permohonan-saya/14',
}

/**
 * Mengganti token {{kunci}} dengan data aktual / simulasi
 */
export function replaceTokens(text: string, context: EmailRenderContext): string {
  if (!text) return ''
  return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    if (context[key] !== undefined && context[key] !== null) {
      return String(context[key])
    }
    return match
  })
}

/**
 * Merender tabel ringkasan data permohonan sesuai tipe template
 */
function renderContextDataTable(templateKey: string, ctx: EmailRenderContext): string {
  if (templateKey === 'pengajuan_baru_admin') {
    return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; width: 35%; background-color: #f1f5f9;">ID Registrasi</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #0e4891;">#${ctx.id || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Nama Pemohon</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1e293b;">${ctx.nama || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">NIK</td>
            <td style="padding: 10px 14px; font-size: 13px; color: #1e293b; font-family: monospace;">${ctx.nik || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Email / Telp</td>
            <td style="padding: 10px 14px; font-size: 13px; color: #1e293b;">${ctx.email || '-'} / ${ctx.telepon || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Kategori Informasi</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #0f172a;">${ctx.jenis_informasi || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Rincian Kebutuhan</td>
            <td style="padding: 10px 14px; font-size: 12px; color: #334155; line-height: 1.5;">${ctx.deskripsi || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Cara Memperoleh</td>
            <td style="padding: 10px 14px; font-size: 12px; color: #334155;">${ctx.cara_memperoleh || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Tanggal Pengajuan</td>
            <td style="padding: 10px 14px; font-size: 12px; color: #334155;">${ctx.tanggal || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #b45309; background-color: #fef3c7;">Batas SLA 10 Hari</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #b45309; background-color: #fffbeb;">${ctx.deadline_awal || '-'}</td>
          </tr>
        </tbody>
      </table>
    `
  }

  if (templateKey === 'pengajuan_baru_pemohon') {
    return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; width: 35%; background-color: #f1f5f9;">Nomor Registrasi</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #0e4891;">#${ctx.id || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Nama Pemohon</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1e293b;">${ctx.nama || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Kategori Informasi</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #0f172a;">${ctx.jenis_informasi || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Rincian Kebutuhan</td>
            <td style="padding: 10px 14px; font-size: 12px; color: #334155; line-height: 1.5;">${ctx.deskripsi || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Tanggal Registrasi</td>
            <td style="padding: 10px 14px; font-size: 12px; color: #334155;">${ctx.tanggal || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #0e4891; background-color: #eff6ff;">Estimasi Batas SLA</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #0e4891; background-color: #f8fafc;">${ctx.deadline_awal || '-'}</td>
          </tr>
        </tbody>
      </table>
    `
  }

  if (templateKey === 'status_diproses') {
    return `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; width: 35%; background-color: #f1f5f9;">Nomor Registrasi</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #0e4891;">#${ctx.id || '-'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Kategori Informasi</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #0f172a;">${ctx.jenis_informasi || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-size: 12px; font-weight: 700; color: #1e3a8a; background-color: #dbeafe;">Status Saat Ini</td>
            <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #1d4ed8; background-color: #eff6ff;">Sedang Diproses oleh Tim Teknis</td>
          </tr>
        </tbody>
      </table>
    `
  }

  if (templateKey === 'jawaban_admin') {
    return `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #0e4891; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 800; color: #0e4891; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
          Isi Tanggapan Resmi PPID:
        </span>
        <div style="font-size: 13px; color: #1e293b; line-height: 1.6; white-space: pre-line;">
          ${ctx.jawaban_admin || '-'}
        </div>
      </div>
    `
  }

  if (templateKey === 'perpanjangan_sla') {
    return `
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
          Alasan Perpanjangan Batas Waktu:
        </span>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #92400e; line-height: 1.5;">
          ${ctx.alasan || '-'}
        </p>
        <div style="font-size: 12px; font-weight: 700; color: #78350f; border-top: 1px dashed #fcd34d; padding-top: 8px;">
          Batas Waktu Layanan Baru: <span style="font-size: 13px; font-weight: 800; color: #b45309;">${ctx.deadline_akhir || '-'}</span>
        </div>
      </div>
    `
  }

  if (templateKey === 'penolakan') {
    return `
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
          Alasan Pertimbangan Penolakan:
        </span>
        <p style="margin: 0; font-size: 13px; color: #b91c1c; line-height: 1.5; white-space: pre-line;">
          ${ctx.alasan || '-'}
        </p>
      </div>
    `
  }

  return ''
}

/**
 * Mengkompilasi template terstruktur menjadi kode HTML email lengkap dan terformat
 */
export function compileEmailHtml(
  template: EmailTemplateData,
  context: EmailRenderContext
): { subject: string; html: string } {
  const subject = replaceTokens(template.subjek, context)
  const badge = replaceTokens(template.badge_label, context)
  const heading = replaceTokens(template.judul_heading, context)
  const pembuka = replaceTokens(template.pesan_pembuka, context)
  const penutup = replaceTokens(template.pesan_penutup, context)
  const ctaLabel = replaceTokens(template.cta_label, context)
  const portalUrl = context.link_portal || 'http://localhost:3000'

  const dataTable = renderContextDataTable(template.template_key, context)

  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #0e4891; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        ${badge}
      </span>
      <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
        ${heading}
      </h2>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #475569; line-height: 1.6;">
        ${pembuka}
      </p>
    </div>

    ${dataTable}

    ${
      penutup
        ? `
      <p style="margin: 0 0 24px 0; font-size: 13px; color: #475569; line-height: 1.6;">
        ${penutup}
      </p>
    `
        : ''
    }

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${portalUrl}" 
         style="display: inline-block; background-color: #0e4891; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.02em;">
        ${ctaLabel}
      </a>
    </div>
  `

  return {
    subject,
    html: wrapEmailTemplate(content),
  }
}
