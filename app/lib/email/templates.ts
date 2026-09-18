// Template email HTML resmi PPID Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah
// Didesain institusional, bersih, responsif, dan bebas AI slop

const BASE_HEADER = `
  <div style="background-color: #0e4891; padding: 24px 30px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">
      PPID DIGITAL
    </h1>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #dbeafe; font-weight: 500;">
      Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah
    </p>
    <p style="margin: 2px 0 0 0; font-size: 10px; color: #bfdbfe;">
      Jl. Mohammad Yamin No.11, Kota Palu, Sulawesi Tengah 94111
    </p>
  </div>
`

const BASE_FOOTER = `
  <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
    <p style="margin: 0 0 4px 0;">
      Email ini dikirim secara otomatis oleh Sistem Layanan Informasi Publik (PPID) Dinas CIKASDA Prov. Sulteng.
    </p>
    <p style="margin: 0; color: #94a3b8;">
      © 2026 PPID Dinas Cipta Karya & Sumber Daya Air Provinsi Sulawesi Tengah. Hak Cipta Dilindungi.
    </p>
  </div>
`

export function wrapEmailTemplate(contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PPID Digital Dinas CIKASDA Prov. Sulteng</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <div style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: left;">
              ${BASE_HEADER}
              <div style="padding: 28px 30px;">
                ${contentHtml}
              </div>
              ${BASE_FOOTER}
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// 1. TEMPLATE UNTUK ADMIN: Permohonan Baru Masuk
export function templatePengajuanBaruAdmin(data: {
  permohonanId: number | string
  nama: string
  nik: string
  email: string
  telepon: string
  jenisInformasi: string
  deskripsi: string
  caraMemperoleh: string
  tanggal: string
  deadlineAwal: string
  appUrl: string
}) {
  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #dbeafe; color: #0e4891; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        Pemberitahuan Admin
      </span>
      <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
        Permohonan Informasi Publik Baru Masuk (#${data.permohonanId})
      </h2>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
        Yth. Tim Admin PPID Dinas CIKASDA Sulteng, seorang pemohon baru saja mengajukan permohonan informasi publik melalui portal PPID Digital. Mohon segera ditindaklanjuti sesuai SOP dan tenggat waktu layanan.
      </p>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0; color: #64748b; width: 140px; font-weight: 600;">Nomor Tiket:</td>
          <td style="padding: 5px 0; color: #0f172a; font-weight: 700;">#${data.permohonanId}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Nama Pemohon:</td>
          <td style="padding: 5px 0; color: #0f172a; font-weight: 700;">${data.nama}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">NIK:</td>
          <td style="padding: 5px 0; color: #0f172a; font-family: monospace;">${data.nik || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Kontak:</td>
          <td style="padding: 5px 0; color: #0f172a;">${data.email} | ${data.telepon || '-'}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Kategori Informasi:</td>
          <td style="padding: 5px 0; color: #0e4891; font-weight: 700;">${data.jenisInformasi}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Tanggal Diajukan:</td>
          <td style="padding: 5px 0; color: #0f172a;">${data.tanggal}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Tenggat SLA (10 Hari):</td>
          <td style="padding: 5px 0; color: #b91c1c; font-weight: 700;">${data.deadlineAwal}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Bentuk Salinan:</td>
          <td style="padding: 5px 0; color: #0f172a;">${data.caraMemperoleh}</td>
        </tr>
      </table>

      <div style="margin-top: 14px; pt: 12px; border-top: 1px dashed #cbd5e1;">
        <p style="margin: 10px 0 4px 0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">
          Rincian Informasi yang Dibutuhkan:
        </p>
        <p style="margin: 0; font-size: 12px; color: #1e293b; line-height: 1.6; white-space: pre-line;">
          ${data.deskripsi}
        </p>
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${data.appUrl}/admin" style="display: inline-block; background-color: #0e4891; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
        Buka Konsol Admin PPID
      </a>
    </div>
  `
  return wrapEmailTemplate(content)
}

// 2. TEMPLATE UNTUK PEMOHON: Tanda Terima Pengajuan
export function templatePengajuanBaruPemohon(data: {
  permohonanId: number | string
  nama: string
  jenisInformasi: string
  deskripsi: string
  tanggal: string
  deadlineAwal: string
  appUrl: string
}) {
  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #dbeafe; color: #0e4891; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        Tanda Terima Pengajuan
      </span>
      <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
        Permohonan Informasi Berhasil Diajukan (#${data.permohonanId})
      </h2>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
        Yth. Sdr/i. <strong>${data.nama}</strong>, permohonan informasi publik Anda telah berhasil terdaftar dalam sistem PPID Digital Dinas CIKASDA Provinsi Sulawesi Tengah.
      </p>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <tr>
          <td style="padding: 5px 0; color: #64748b; width: 140px; font-weight: 600;">Nomor Registrasi:</td>
          <td style="padding: 5px 0; color: #0f172a; font-weight: 700;">#${data.permohonanId}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Kategori Informasi:</td>
          <td style="padding: 5px 0; color: #0e4891; font-weight: 700;">${data.jenisInformasi}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Tanggal Pengajuan:</td>
          <td style="padding: 5px 0; color: #0f172a;">${data.tanggal}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Batas Waktu Layanan:</td>
          <td style="padding: 5px 0; color: #0e4891; font-weight: 700;">Maks. 10 Hari Kerja (s.d. ${data.deadlineAwal})</td>
        </tr>
      </table>

      <div style="margin-top: 14px; pt: 12px; border-top: 1px dashed #cbd5e1;">
        <p style="margin: 10px 0 4px 0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">
          Rincian Permohonan Anda:
        </p>
        <p style="margin: 0; font-size: 12px; color: #1e293b; line-height: 1.6; white-space: pre-line;">
          ${data.deskripsi}
        </p>
      </div>
    </div>

    <p style="font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
      Sesuai dengan amanat UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik, permohonan Anda akan ditindaklanjuti dalam waktu maksimal 10 hari kerja. Anda dapat memantau status secara berkala melalui tautan di bawah ini:
    </p>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${data.appUrl}/permohonan-saya/${data.permohonanId}" style="display: inline-block; background-color: #0e4891; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
        Pantau Riwayat Permohonan Saya
      </a>
    </div>
  `
  return wrapEmailTemplate(content)
}

// 3. TEMPLATE UNTUK PEMOHON: Status Diproses
export function templateStatusDiproses(data: {
  permohonanId: number | string
  nama: string
  jenisInformasi: string
  appUrl: string
}) {
  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        Pembaruan Status
      </span>
      <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
        Permohonan Informasi #${data.permohonanId} Sedang Diproses
      </h2>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
        Yth. Sdr/i. <strong>${data.nama}</strong>, berkas permohonan informasi publik Anda telah diverifikasi oleh petugas admin PPID dan saat ini <strong>sedang dalam proses penelaahan teknis</strong> pada bidang terkait di lingkungan Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah.
      </p>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 12px; color: #334155;">
        <strong>Kategori Informasi:</strong> ${data.jenisInformasi}<br>
        <strong>Status Saat Ini:</strong> <span style="display: inline-block; background-color: #e2e8f0; color: #1e293b; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; text-transform: uppercase;">DIPROSES</span>
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${data.appUrl}/permohonan-saya/${data.permohonanId}" style="display: inline-block; background-color: #0e4891; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px;">
        Lihat Status Permohonan
      </a>
    </div>
  `
  return wrapEmailTemplate(content)
}

// 4. TEMPLATE UNTUK PEMOHON: Jawaban Resmi Diterbitkan
export function templateJawabanAdmin(data: {
  permohonanId: number | string
  nama: string
  jenisInformasi: string
  jawabanAdmin: string
  appUrl: string
}) {
  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #0e4891; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        Keputusan Resmi
      </span>
      <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
        Tanggapan Resmi Permohonan Informasi #${data.permohonanId}
      </h2>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
        Yth. Sdr/i. <strong>${data.nama}</strong>, PPID Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah telah menerbitkan tanggapan resmi atas permohonan informasi publik Anda.
      </p>
    </div>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase;">
        Isi Jawaban Resmi / Keputusan Admin:
      </p>
      <div style="font-size: 13px; color: #14532d; line-height: 1.6; white-space: pre-line;">
        ${data.jawabanAdmin}
      </div>
    </div>

    <p style="font-size: 12px; color: #475569; line-height: 1.5;">
      Untuk melihat pratinjau dokumen terlampir atau mengunduh berkas lengkap, silakan akses halaman detail permohonan Anda melalui tombol di bawah:
    </p>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${data.appUrl}/permohonan-saya/${data.permohonanId}" style="display: inline-block; background-color: #0e4891; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
        Buka Detail & Lampiran Dokumen
      </a>
    </div>
  `
  return wrapEmailTemplate(content)
}

// 5. TEMPLATE UNTUK PEMOHON: Perpanjangan Waktu SLA (+7 Hari)
export function templatePerpanjanganSLA(data: {
  permohonanId: number | string
  nama: string
  alasan: string
  deadlineAkhir: string
  appUrl: string
}) {
  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        Pemberitahuan Resmi
      </span>
      <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
        Perpanjangan Waktu Layanan Informasi #${data.permohonanId}
      </h2>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
        Yth. Sdr/i. <strong>${data.nama}</strong>, berdasarkan ketentuan Pasal 22 ayat (7) Undang-Undang No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik, PPID Dinas CIKASDA Prov. Sulteng memberitahukan perpanjangan batas waktu layanan permohonan informasi Anda selama <strong>7 (tujuh) hari kerja</strong>.
      </p>
    </div>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
      <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
        <strong>Tenggat Waktu Baru:</strong> <span style="color: #0e4891; font-weight: 700;">${data.deadlineAkhir}</span>
      </p>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
        <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">
          Alasan Teknis Perpanjangan:
        </p>
        <p style="margin: 0; font-size: 12px; color: #1e293b; line-height: 1.6;">
          ${data.alasan}
        </p>
      </div>
    </div>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${data.appUrl}/permohonan-saya/${data.permohonanId}" style="display: inline-block; background-color: #0e4891; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px;">
        Pantau Riwayat Permohonan
      </a>
    </div>
  `
  return wrapEmailTemplate(content)
}

// 6. TEMPLATE UNTUK PEMOHON: Penolakan Permohonan
export function templatePenolakanPermohonan(data: {
  permohonanId: number | string
  nama: string
  alasan: string
  appUrl: string
}) {
  const content = `
    <div style="margin-bottom: 20px;">
      <span style="display: inline-block; background-color: #ffe4e6; color: #be123c; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
        Pemberitahuan Resmi
      </span>
      <h2 style="margin: 4px 0 0 0; font-size: 18px; font-weight: 800; color: #0f172a;">
        Penolakan Permohonan Informasi #${data.permohonanId}
      </h2>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; line-height: 1.5;">
        Yth. Sdr/i. <strong>${data.nama}</strong>, setelah melalui proses verifikasi dan penelaahan materi permohonan, PPID Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah menyatakan bahwa permohonan informasi publik Anda <strong>belum dapat dipenuhi</strong>.
      </p>
    </div>

    <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; color: #9f1239; text-transform: uppercase;">
        Alasan Penolakan:
      </p>
      <p style="margin: 0; font-size: 12px; color: #881337; line-height: 1.6; white-space: pre-line;">
        ${data.alasan}
      </p>
    </div>

    <p style="font-size: 12px; color: #475569; line-height: 1.5;">
      Apabila Anda merasa keberatan atas penolakan ini, Anda dapat mengajukan permohonan keberatan secara resmi sesuai tata cara yang diatur dalam UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik.
    </p>

    <div style="text-align: center; margin: 28px 0 10px 0;">
      <a href="${data.appUrl}/permohonan-saya/${data.permohonanId}" style="display: inline-block; background-color: #0e4891; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 8px;">
        Lihat Detail Permohonan
      </a>
    </div>
  `
  return wrapEmailTemplate(content)
}
