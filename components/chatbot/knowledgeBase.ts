export interface FAQItem {
  id: string
  question: string
  keywords: string[]
  answer: string
  actionLink?: {
    label: string
    href: string
  }
}

export interface QuickChip {
  id: string
  label: string
  query: string
}

export const QUICK_CHIPS: QuickChip[] = [
  {
    id: 'cara_ajukan',
    label: 'Cara Ajukan Permohonan',
    query: 'Bagaimana cara mengajukan permohonan informasi publik?',
  },
  {
    id: 'waktu_proses',
    label: 'Berapa Lama Prosesnya?',
    query: 'Berapa lama jangka waktu proses permohonan informasi?',
  },
  {
    id: 'syarat_dokumen',
    label: 'Apa Saja Syaratnya?',
    query: 'Apa saja syarat untuk mengajukan permohonan informasi?',
  },
  {
    id: 'biaya_layanan',
    label: 'Apakah Ada Biaya?',
    query: 'Apakah permohonan informasi dipungut biaya?',
  },
  {
    id: 'kategori_info',
    label: 'Kategori Informasi',
    query: 'Apa saja kategori informasi publik yang tersedia?',
  },
]

export const KNOWLEDGE_BASE: FAQItem[] = [
  {
    id: 'alur_permohonan',
    question: 'Bagaimana cara mengajukan permohonan informasi publik?',
    keywords: [
      'cara',
      'ajukan',
      'alur',
      'prosedur',
      'langkah',
      'tahapan',
      'permohonan',
      'minta data',
      'pengajuan',
      'daftar akun',
      'formulir',
    ],
    answer:
      'Untuk mengajukan permohonan informasi secara daring:\n1. Masuk ke sistem atau buat akun pemohon terlebih dahulu.\n2. Lengkapi data profil diri (Nama Lengkap, 16 digit NIK, dan nomor WhatsApp aktif). Tidak perlu mengunggah foto KTP.\n3. Buka menu **Permohonan Saya** dan klik **Ajukan Permohonan**.\n4. Pilih kategori informasi, tulis rincian kebutuhan informasi, dan cara memperolehnya.\n5. Tim PPID CIKASDA akan memverifikasi dan memproses permintaan Anda.',
    actionLink: {
      label: 'Ajukan Permohonan Sekarang',
      href: '/permohonan-saya/ajukan',
    },
  },
  {
    id: 'jangka_waktu',
    question: 'Berapa lama jangka waktu proses permohonan informasi?',
    keywords: [
      'lama',
      'waktu',
      'jangka',
      'durasi',
      'hari',
      'proses',
      'tanggapan',
      'selesai',
      'kapan',
      'tenggat',
    ],
    answer:
      'Sesuai amanat UU KIP No. 14 Tahun 2008:\n• **Pemberitahuan Tertulis**: Maksimal **10 (sepuluh) hari kerja** sejak permohonan diterima lengkap.\n• **Perpanjangan Waktu**: Dapat diperpanjang paling lambat **7 (tujuh) hari kerja** tambahan dengan alasan tertulis resmi.\n• Jika belum mendapat tanggapan, pemohon berhak mengajukan keberatan dalam jangka waktu 30 hari kerja.',
    actionLink: {
      label: 'Lihat Alur Prosedur',
      href: '#alur-permohonan',
    },
  },
  {
    id: 'syarat_ketentuan',
    question: 'Apa saja syarat untuk mengajukan permohonan informasi?',
    keywords: [
      'syarat',
      'ketentuan',
      'nik',
      'ktp',
      'identitas',
      'dokumen pemohon',
      'persyaratan',
      'berkas',
      'surat kuasa',
    ],
    answer:
      'Persyaratan pengajuan di sistem PPID Digital CIKASDA:\n• **Perorangan**: Cukup mengisi data diri berupa Nama Lengkap, 16 digit NIK, dan kontak aktif (WhatsApp/telepon) pada profil akun. Tidak perlu melampirkan atau mengunggah foto KTP fisik.\n• **Formulir Permohonan**: Mengisi rincian kebutuhan informasi beserta tujuan penggunaannya secara jelas dan bertanggung jawab.\n• **Badan Hukum / Organisasi**: Menyertakan nama lembaga dan identitas perwakilan yang sah.',
    actionLink: {
      label: 'Daftar Akun Pemohon',
      href: '/daftar',
    },
  },
  {
    id: 'biaya_layanan',
    question: 'Apakah permohonan informasi dipungut biaya?',
    keywords: [
      'biaya',
      'tarif',
      'bayar',
      'gratis',
      'ongkos',
      'pungutan',
      'uang',
      'harga',
    ],
    answer:
      'Layanan permohonan informasi publik di PPID Dinas CIKASDA Provinsi Sulawesi Tengah adalah **GRATIS (Rp 0)**.\n\nJika pemohon memerlukan salinan dokumen fisik (hardcopy) dalam jumlah banyak, pemohon hanya menanggung biaya penggandaan/fotokopi mandiri atau menyediakan media penyimpanan (flashdisk).',
  },
  {
    id: 'kategori_informasi',
    question: 'Apa saja kategori informasi publik yang tersedia?',
    keywords: [
      'kategori',
      'jenis',
      'klasifikasi',
      'daftar informasi',
      'dokumen apa saja',
      'berkala',
      'serta merta',
      'setiap saat',
      'dikecualikan',
    ],
    answer:
      'Informasi publik di PPID CIKASDA dikelompokkan menjadi:\n1. **Informasi Berkala**: Profil dinas, program kerja, laporan akuntabilitas kinerja (LAKIP), rencana strategis.\n2. **Informasi Serta Merta**: Pemberitahuan darurat bencana terkait infrastruktur air dan irigasi.\n3. **Informasi Setiap Saat**: SOP, SPM, regulasi, Surat Keputusan (SK), dan daftar dokumen dinas.\n4. **Informasi Dikecualikan**: Informasi yang dirahasiakan menurut ketentuan undang-undang.',
    actionLink: {
      label: 'Telusuri Kategori Informasi',
      href: '#kategori',
    },
  },
  {
    id: 'profil_cikasda',
    question: 'Apa tugas dan fungsi Dinas CIKASDA Provinsi Sulawesi Tengah?',
    keywords: [
      'cikasda',
      'tugas',
      'fungsi',
      'cipta karya',
      'sumber daya air',
      'sda',
      'profil dinas',
      'tentang cikasda',
      'dinas',
    ],
    answer:
      'Dinas Cipta Karya dan Sumber Daya Air (CIKASDA) Provinsi Sulawesi Tengah bertanggung jawab menyelenggarakan urusan pemerintahan daerah di bidang pekerjaan umum dan penataan ruang, khususnya sub-urusan **Cipta Karya** (gedung negara, permukiman, drainase perkotaan) dan **Sumber Daya Air** (irigasi, sungai, waduk/bendungan, pantai, dan air baku).',
    actionLink: {
      label: 'Lihat Visi Misi',
      href: '/informasi/visi_misi',
    },
  },
  {
    id: 'kontak_ppid',
    question: 'Bagaimana cara menghubungi atau mendatangi kantor PPID CIKASDA?',
    keywords: [
      'kontak',
      'alamat',
      'nomor telepon',
      'whatsapp',
      'email',
      'lokasi',
      'kantor',
      'hubungi',
      'telepon',
    ],
    answer:
      'Anda dapat menghubungi atau berkunjung ke:\n• **Alamat**: Jl. Mohammad Yamin No.11, Tatura Utara, Kec. Palu Selatan, Kota Palu, Sulawesi Tengah 94111\n• **WhatsApp / Telp**: 0812-4217-0628\n• **Email**: cikasda.sulteng@gmail.com\n• **Jam Pelayanan**: Senin s/d Jumat, 08.00 - 16.00 WITA.',
  },
  {
    id: 'keberatan_informasi',
    question: 'Bagaimana jika permohonan saya ditolak atau tidak ditanggapi?',
    keywords: [
      'keberatan',
      'tolak',
      'ditolak',
      'sengketa',
      'komplain',
      'tidak dijawab',
      'terlambat',
      'aduan',
    ],
    answer:
      'Pemohon berhak mengajukan **Keberatan Informasi Publik** kepada Atasan PPID dalam jangka waktu paling lambat 30 (tiga puluh) hari kerja apabila:\n• Permohonan ditolak tanpa alasan yang sah\n• Informasi tidak diberikan sesuai batas waktu (10+7 hari kerja)\n• Permintaan biaya tidak wajar\n• Informasi yang diberikan tidak sesuai permintaan.',
  },
]

/**
 * Mencari jawaban berdasarkan pencocokan kata kunci dan teks pengguna.
 */
export function searchKnowledgeBase(query: string): FAQItem | null {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return null

  // 1. Exact / High substring match
  const directMatch = KNOWLEDGE_BASE.find(
    (item) =>
      item.question.toLowerCase().includes(normalized) ||
      normalized.includes(item.question.toLowerCase().slice(0, 20))
  )
  if (directMatch) return directMatch

  // 2. Score-based keyword match
  const words = normalized.split(/\s+/).filter((w) => w.length > 2)

  let bestMatch: FAQItem | null = null
  let maxScore = 0

  for (const item of KNOWLEDGE_BASE) {
    let score = 0
    for (const word of words) {
      if (item.keywords.some((k) => k.includes(word) || word.includes(k))) {
        score += 2
      }
      if (item.question.toLowerCase().includes(word)) {
        score += 1
      }
    }

    if (score > maxScore && score >= 2) {
      maxScore = score
      bestMatch = item
    }
  }

  return bestMatch
}

/**
 * Pesan sambutan awal Si Cika saat jendela chat pertama kali dibuka.
 */
export const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'bot' as const,
  text: 'Halo! Saya **Si Cika**, asisten digital resmi PPID Dinas CIKASDA Provinsi Sulawesi Tengah.\n\nAda yang bisa saya bantu terkait layanan permohonan dan keterbukaan informasi publik? Silakan pilih topik pertanyaan di bawah atau ketik langsung pertanyaan Anda.',
  timestamp: new Date(),
}
