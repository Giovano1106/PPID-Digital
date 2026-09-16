export interface DaftarInformasiItem {
  id?: number | bigint
  tabel_id?: number | bigint
  nama: string
  links: Record<string, string>
  urutan?: number
}

export interface DaftarInformasiTable {
  id?: number | bigint
  judul: string
  deskripsi: string
  action_type: 'unduh' | 'klik'
  urutan: number
  items: DaftarInformasiItem[]
}

export const TAHUN_LIST = ['2022', '2023', '2024', '2025', '2026']

export const DAFTAR_INFORMASI_DEFAULT: DaftarInformasiTable[] = [
  {
    judul: 'DATA AKSES LAYANAN INFORMASI PUBLIK',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'klik',
    urutan: 1,
    items: [
      {
        nama: 'Website Resmi Berdomain (go.id atau sultengprov.go.id)',
        links: {
          '2022': 'https://cikasda.sultengprov.go.id',
          '2023': 'https://cikasda.sultengprov.go.id',
          '2024': 'https://cikasda.sultengprov.go.id',
          '2025': 'https://cikasda.sultengprov.go.id',
          '2026': 'https://cikasda.sultengprov.go.id',
        },
      },
      {
        nama: 'Aplikasi yang Berbasis Android/IOS/LINUX dan Dapat Diakses Secara Umum',
        links: {
          '2022': '#',
          '2023': '#',
          '2024': '#',
          '2025': '#',
          '2026': '#',
        },
      },
      {
        nama: 'Media Sosial Resmi (Youtube) Identik dengan Nama Badan Publik',
        links: {
          '2022': 'https://youtube.com',
          '2023': 'https://youtube.com',
          '2024': 'https://youtube.com',
          '2025': 'https://youtube.com',
          '2026': 'https://youtube.com',
        },
      },
      {
        nama: 'Media Sosial Resmi (Facebook) Identik dengan Nama Badan Publik',
        links: {
          '2022': 'https://facebook.com',
          '2023': 'https://facebook.com',
          '2024': 'https://facebook.com',
          '2025': 'https://facebook.com',
          '2026': 'https://facebook.com',
        },
      },
      {
        nama: 'Media Sosial Resmi (Instagram) Identik dengan Nama Badan Publik',
        links: {
          '2022': 'https://instagram.com',
          '2023': 'https://instagram.com',
          '2024': 'https://instagram.com',
          '2025': 'https://instagram.com',
          '2026': 'https://instagram.com',
        },
      },
      {
        nama: 'Website Resmi Memuat Menu Khusus Untuk Layanan Informasi Publik / Daftar Informasi Publik',
        links: {
          '2022': '/informasi/daftar_informasi_publik',
          '2023': '/informasi/daftar_informasi_publik',
          '2024': '/informasi/daftar_informasi_publik',
          '2025': '/informasi/daftar_informasi_publik',
          '2026': '/informasi/daftar_informasi_publik',
        },
      },
    ],
  },
  {
    judul: 'DOKUMEN TENTANG KEPEGAWAIAN',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 2,
    items: [
      {
        nama: 'Daftar Urut Kepangkatan ASN (DUK)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Profil Pejabat Struktural (Foto, Data Profil Pribadi, Riwayat Kepangkatan, Riwayat Pendidikan dan Riwayat Jabatan)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Statistik ASN (Minimal Memuat Data Statistik Berdasarkan Pendidikan, Golongan Ruang, Jenis Kelamin)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Laporan Harta Kekayaan LHKASN/LHKPN Khusus Pejabat Struktural (Eselon 2) yang Telah Diverifikasi oleh KPK RI',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Laporan Harta Kekayaan LHKASN/LHKPN Khusus Pejabat Struktural (Eselon 3) yang Telah Diverifikasi oleh KPK RI',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Laporan Harta Kekayaan LHKASN/LHKPN Khusus Pejabat Struktural (Eselon 4) yang Telah Diverifikasi oleh KPK RI',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
  {
    judul: 'DOKUMEN TENTANG KEUANGAN DAN ASET',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 3,
    items: [
      {
        nama: 'Rencana Kerja Anggaran (RKA)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Dokumen Pelaksanaan Anggaran (DPA)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Laporan Realisasi Anggaran (LRA)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Catatan Atas Laporan Keuangan (CALK)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Anggaran Kas',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Daftar Aset',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Kebijakan Umum Anggaran (KUA) Prioritas Pagu Anggaran Sementara (PPAS)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Dokumen Rencana Umum Pengadaan (RUP)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Dokumen-Dokumen Elektronik Berkaitan dengan Progam dan Kegiatan',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
  {
    judul: 'DOKUMEN TENTANG PERENCANAAN',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 4,
    items: [
      {
        nama: 'Indikator Kinerja Utama (IKU)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'RENSTRA (Rencana Strategis)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'RENJA (Rencana Kerja Awal)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'LAKIP (Laporan Kinerja Instansi Pemerintah)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'LPPD (Laporan Pertanggungjawaban Pemerintah Daerah)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Perjanjian Kinerja (Internal OPD)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
  {
    judul: 'DOKUMEN TENTANG KETATAUSAHAAN',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 5,
    items: [
      {
        nama: 'Agenda Pimpinan OPD / Buku Tamu (Januari - Desember)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Surat menyurat pimpinan OPD atau pejabat Kementerian/Lembaga/Badan dalam rangka pelaksaan tugas, fungsi, dan wewenangnya Tahun 2024 - 2026',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
  {
    judul: 'DOKUMEN TENTANG KETERBUKAAN INFORMASI PUBLIK',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 6,
    items: [
      {
        nama: 'Daftar Informasi Publik (DIP)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Daftar Informasi Dikecualikan dari PPID Utama (SK) atau Surat Usul Informasi Dikecualikan oleh PPID Pelaksana',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'SK Pimpinan Badan Publik Tentang Struktur PPID Pelaksana',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'SK Tim Petugas Informasi',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'SK Tim Petugas Aduan Masyarakat',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'SK Tim Petugas Kehumasan',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Standar Pelayanan (SP)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
  {
    judul: 'DOKUMEN TENTANG KINERJA BADAN PUBLIK',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 7,
    items: [
      {
        nama: 'Survey Kepuasan Masyarakat (SKM)',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Permohonan Informasi Online',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
  {
    judul: 'PENGELOLAAN ADUAN MASYARAKAT MELALUI APLIKASI BERBASIS WEB',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 8,
    items: [
      {
        nama: 'Memiliki aplikasi WEB sendiri dalam mengelola aplikasi aduan masyarkat',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Mengelola aplikasi aduan masyarakat melalui aplikasi Lapor!',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'WEB Resmi OPD memliki link untuk terhubung ke aplikasi Lapor!',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
  {
    judul: 'TIM KEGIATAN PENGELOLAAN LAYANAN ADUAN',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 9,
    items: [
      {
        nama: 'Fotokopi SK Tim Pengelolaan Layanan Aduan',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Fotokopi Tanda Terima (SPM) Honorarium/SPPD Tim Pengelola Layanan Aduan',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
  {
    judul: 'KEGIATAN PUBLIKASI LAYANAN ADUAN MASYARAKAT (LAPOR!) MELALUI KEGIATAN OPD',
    deskripsi: 'Tahun 2022 - 2026',
    action_type: 'unduh',
    urutan: 10,
    items: [
      {
        nama: 'Dokumentasi kegiatan layanan aduan masyarakat melalui publikasi FLAYER di media sosial',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Dokumentasi kegiatan layanan aduan masyarakat melalui pemasangan BANNER di ruang publik',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Foto kegiatan sosialisasi tentang aduan masyarakat',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
      {
        nama: 'Foto kopi SPM pelaksanaan kegiatan sosialisasi tentang aduan masyarakat',
        links: { '2022': '#', '2023': '#', '2024': '#', '2025': '#', '2026': '#' },
      },
    ],
  },
]
