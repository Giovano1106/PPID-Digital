export interface TemplateVariable {
  key: string
  label: string
  example: string
  description?: string
  canUseIn?: string[]
}

export interface EmailTemplateData {
  template_key: string
  nama_template: string
  target_penerima: 'admin' | 'pemohon'
  subjek: string
  badge_label: string
  judul_heading: string
  pesan_pembuka: string
  pesan_penutup: string
  cta_label: string
  available_variables: TemplateVariable[]
  updated_at?: string
}

export const DEFAULT_EMAIL_TEMPLATES: Record<string, EmailTemplateData> = {
  pengajuan_baru_admin: {
    template_key: 'pengajuan_baru_admin',
    nama_template: 'Notifikasi Permohonan Baru (Petugas PPID)',
    target_penerima: 'admin',
    subjek: '[PPID CIKASDA] Permohonan Informasi Publik Baru Masuk (#{{id}})',
    badge_label: 'Pemberitahuan Sistem',
    judul_heading: 'Permohonan Informasi Baru Telah Diajukan',
    pesan_pembuka:
      'Terdapat pengajuan permohonan informasi publik baru dari masyarakat yang memerlukan verifikasi dan tindak lanjut dari Petugas PPID Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah.',
    pesan_penutup:
      'Mohon segera lakukan verifikasi kelengkapan berkas pemohon dan tindak lanjuti sesuai ketentuan batas waktu layanan (SLA).',
    cta_label: 'Buka Admin Console',
    available_variables: [
      { key: '{{id}}', label: 'ID Registrasi', example: '14', description: 'Nomor unik tiket permohonan', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{nama}}', label: 'Nama Pemohon', example: 'Budi Santoso, S.T.', description: 'Nama lengkap warga yang mengajukan', canUseIn: ['Subjek', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{nik}}', label: 'NIK Pemohon', example: '7271012345670001', description: 'Nomor Induk Kependudukan 16 digit', canUseIn: ['Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{email}}', label: 'Email Pemohon', example: 'budi.santoso@email.com', description: 'Alamat email pemohon', canUseIn: ['Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{telepon}}', label: 'Nomor Telepon/WA', example: '081234567890', description: 'Nomor kontak telepon atau WhatsApp pemohon', canUseIn: ['Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{jenis_informasi}}', label: 'Kategori Informasi', example: 'Dokumen Program dan Kegiatan', description: 'Kelompok informasi yang dimohonkan', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka'] },
      { key: '{{deskripsi}}', label: 'Rincian Kebutuhan', example: 'Salinan Rencana Anggaran Biaya (RAB)...', description: 'Teks uraian detail dokumen yang diminta pemohon', canUseIn: ['Pesan Pembuka'] },
      { key: '{{cara_memperoleh}}', label: 'Cara Memperoleh', example: 'Melihat / Membaca / Mendengarkan', description: 'Metode akses informasi yang dipilih pemohon', canUseIn: ['Pesan Pembuka'] },
      { key: '{{tanggal}}', label: 'Tanggal Pengajuan', example: '18 September 2026', description: 'Waktu permohonan didaftarkan di portal', canUseIn: ['Subjek', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{deadline_awal}}', label: 'Batas SLA 10 Hari', example: '2 Oktober 2026', description: 'Estimasi tenggat waktu maksimal penyelesaian awal', canUseIn: ['Subjek', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{link_portal}}', label: 'Tautan Admin Console', example: 'http://localhost:3000/admin', description: 'Tautan langsung ke halaman pengelolaan admin', canUseIn: ['Pesan Penutup', 'Tombol CTA'] },
    ],
  },
  pengajuan_baru_pemohon: {
    template_key: 'pengajuan_baru_pemohon',
    nama_template: 'Tanda Terima Pengajuan (Pemohon)',
    target_penerima: 'pemohon',
    subjek: '[PPID CIKASDA] Tanda Terima Pengajuan Permohonan Informasi (#{{id}})',
    badge_label: 'Tanda Terima Resmi',
    judul_heading: 'Tanda Terima Registrasi Permohonan Informasi',
    pesan_pembuka:
      'Yth. Sdr/i. {{nama}}, permohonan informasi publik Anda telah berhasil kami terima dan diregistrasikan ke dalam Sistem PPID Digital Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah.',
    pesan_penutup:
      'Permohonan Anda akan ditindaklanjuti oleh petugas PPID sesuai ketentuan Standar Layanan Informasi Publik. Anda dapat memantau perkembangan status permohonan secara berkala melalui portal PPID.',
    cta_label: 'Lihat Status Permohonan',
    available_variables: [
      { key: '{{id}}', label: 'ID Registrasi', example: '14', description: 'Nomor unik tiket permohonan', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{nama}}', label: 'Nama Pemohon', example: 'Budi Santoso, S.T.', description: 'Nama pemohon untuk salam resmi', canUseIn: ['Subjek', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{jenis_informasi}}', label: 'Kategori Informasi', example: 'Dokumen Program dan Kegiatan', description: 'Kelompok informasi yang dimohonkan', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka'] },
      { key: '{{deskripsi}}', label: 'Rincian Kebutuhan', example: 'Salinan Rencana Anggaran Biaya (RAB)...', description: 'Uraian kebutuhan dokumen yang diajukan', canUseIn: ['Pesan Pembuka'] },
      { key: '{{tanggal}}', label: 'Tanggal Registrasi', example: '18 September 2026', description: 'Tanggal permohonan resmi tercatat', canUseIn: ['Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{deadline_awal}}', label: 'Estimasi Batas SLA', example: '2 Oktober 2026', description: 'Tenggat waktu awal penyelesaian informasi (10 hari kerja)', canUseIn: ['Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{link_portal}}', label: 'Tautan Portal Pemohon', example: 'http://localhost:3000/permohonan-saya/14', description: 'Tautan langsung ke riwayat permohonan pemohon', canUseIn: ['Pesan Penutup', 'Tombol CTA'] },
    ],
  },
  status_diproses: {
    template_key: 'status_diproses',
    nama_template: 'Pemberitahuan Berkas Diproses (Pemohon)',
    target_penerima: 'pemohon',
    subjek: '[PPID CIKASDA] Permohonan Informasi #{{id}} Sedang Diproses',
    badge_label: 'Pembaruan Status',
    judul_heading: 'Permohonan Sedang Dalam Proses Penanganan',
    pesan_pembuka:
      'Yth. Sdr/i. {{nama}}, kami informasikan bahwa berkas permohonan informasi publik Anda telah diverifikasi dan saat ini sedang dalam proses penanganan oleh unit kerja terkait pada Dinas CIKASDA Provinsi Sulawesi Tengah.',
    pesan_penutup:
      'Tim teknis dan PPID Pelaksana sedang melakukan koordinasi dan penyiapan dokumen yang Anda butuhkan. Kami akan mengabarkan kembali segera setelah tanggapan resmi disetujui.',
    cta_label: 'Lihat Status Permohonan',
    available_variables: [
      { key: '{{id}}', label: 'ID Registrasi', example: '14', description: 'Nomor unik tiket permohonan', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{nama}}', label: 'Nama Pemohon', example: 'Budi Santoso, S.T.', description: 'Nama pemohon untuk salam resmi', canUseIn: ['Subjek', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{jenis_informasi}}', label: 'Kategori Informasi', example: 'Dokumen Program dan Kegiatan', description: 'Kategori informasi yang sedang diproses', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka'] },
      { key: '{{link_portal}}', label: 'Tautan Portal Pemohon', example: 'http://localhost:3000/permohonan-saya/14', description: 'Tautan langsung ke status tiket pemohon', canUseIn: ['Pesan Penutup', 'Tombol CTA'] },
    ],
  },
  jawaban_admin: {
    template_key: 'jawaban_admin',
    nama_template: 'Tanggapan / Jawaban Resmi (Pemohon)',
    target_penerima: 'pemohon',
    subjek: '[PPID CIKASDA] Tanggapan Resmi Permohonan Informasi #{{id}}',
    badge_label: 'Keputusan Resmi',
    judul_heading: 'Tanggapan Resmi Permohonan Informasi #{{id}}',
    pesan_pembuka:
      'Yth. Sdr/i. {{nama}}, PPID Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah telah menerbitkan tanggapan resmi atas permohonan informasi publik Anda.',
    pesan_penutup:
      'Apabila informasi yang diberikan memerlukan dokumen fisik atau verifikasi tambahan, Anda dapat mendatangi meja layanan PPID Dinas CIKASDA Provinsi Sulawesi Tengah pada jam kerja operasional.',
    cta_label: 'Buka Rincian & Unduh Jawaban',
    available_variables: [
      { key: '{{id}}', label: 'ID Registrasi', example: '14', description: 'Nomor unik tiket permohonan', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{nama}}', label: 'Nama Pemohon', example: 'Budi Santoso, S.T.', description: 'Nama pemohon untuk salam resmi', canUseIn: ['Subjek', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{jenis_informasi}}', label: 'Kategori Informasi', example: 'Dokumen Program dan Kegiatan', description: 'Kategori informasi yang dijawab', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka'] },
      { key: '{{jawaban_admin}}', label: 'Teks Jawaban Admin', example: 'Permohonan disetujui, dokumen terlampir di portal...', description: 'Uraian jawaban resmi yang diketik admin di console', canUseIn: ['Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{link_portal}}', label: 'Tautan Portal Pemohon', example: 'http://localhost:3000/permohonan-saya/14', description: 'Tautan langsung untuk mengunduh jawaban', canUseIn: ['Pesan Penutup', 'Tombol CTA'] },
    ],
  },
  perpanjangan_sla: {
    template_key: 'perpanjangan_sla',
    nama_template: 'Pemberitahuan Perpanjangan Waktu Layanan (Pemohon)',
    target_penerima: 'pemohon',
    subjek: '[PPID CIKASDA] Perpanjangan Batas Waktu Layanan Informasi #{{id}}',
    badge_label: 'Pemberitahuan SLA',
    judul_heading: 'Pemberitahuan Perpanjangan Waktu Layanan (+7 Hari Kerja)',
    pesan_pembuka:
      'Yth. Sdr/i. {{nama}}, berdasarkan Pasal 22 ayat (7) Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik, kami memberitahukan bahwa proses pemenuhan permohonan informasi Anda memerlukan perpanjangan waktu kerja.',
    pesan_penutup:
      'Kami berkomitmen untuk menyelesaikan permohonan Anda selambat-lambatnya pada tanggal batas waktu akhir di atas. Terima kasih atas pengertian dan kerja sama Anda.',
    cta_label: 'Periksa Rincian Permohonan',
    available_variables: [
      { key: '{{id}}', label: 'ID Registrasi', example: '14', description: 'Nomor unik tiket permohonan', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{nama}}', label: 'Nama Pemohon', example: 'Budi Santoso, S.T.', description: 'Nama pemohon untuk salam resmi', canUseIn: ['Subjek', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{alasan}}', label: 'Alasan Perpanjangan', example: 'Proses koordinasi dan pengarsipan teknis...', description: 'Alasan perpanjangan 7 hari kerja yang diinput admin', canUseIn: ['Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{deadline_akhir}}', label: 'Batas Waktu Baru', example: '11 Oktober 2026', description: 'Tanggal batas waktu setelah perpanjangan +7 hari', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{link_portal}}', label: 'Tautan Portal Pemohon', example: 'http://localhost:3000/permohonan-saya/14', description: 'Tautan langsung untuk memeriksa status', canUseIn: ['Pesan Penutup', 'Tombol CTA'] },
    ],
  },
  penolakan: {
    template_key: 'penolakan',
    nama_template: 'Pemberitahuan Penolakan Permohonan (Pemohon)',
    target_penerima: 'pemohon',
    subjek: '[PPID CIKASDA] Pemberitahuan Penolakan Permohonan Informasi #{{id}}',
    badge_label: 'Pemberitahuan Penolakan',
    judul_heading: 'Pemberitahuan Penolakan Permohonan Informasi',
    pesan_pembuka:
      'Yth. Sdr/i. {{nama}}, sehubungan dengan permohonan informasi publik yang Anda ajukan, kami menyampaikan bahwa permohonan tersebut tidak dapat dipenuhi dengan rincian alasan pertimbangan sebagai berikut:',
    pesan_penutup:
      'Sesuai dengan peraturan perundang-undangan yang berlaku, apabila Anda merasa keberatan atas penolakan ini, Anda berhak mengajukan Surat Keberatan melalui portal PPID paling lambat 30 (tiga puluh) hari kerja sejak diterimanya pemberitahuan ini.',
    cta_label: 'Lihat Keputusan Penolakan',
    available_variables: [
      { key: '{{id}}', label: 'ID Registrasi', example: '14', description: 'Nomor unik tiket permohonan', canUseIn: ['Subjek', 'Heading', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{nama}}', label: 'Nama Pemohon', example: 'Budi Santoso, S.T.', description: 'Nama pemohon untuk salam resmi', canUseIn: ['Subjek', 'Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{alasan}}', label: 'Alasan Penolakan', example: 'Informasi termasuk dokumen yang dikecualikan...', description: 'Uraian dasar penolakan yang diinput admin', canUseIn: ['Pesan Pembuka', 'Pesan Penutup'] },
      { key: '{{link_portal}}', label: 'Tautan Portal Pemohon', example: 'http://localhost:3000/permohonan-saya/14', description: 'Tautan langsung untuk melihat keputusan dan mengajukan keberatan', canUseIn: ['Pesan Penutup', 'Tombol CTA'] },
    ],
  },
}
