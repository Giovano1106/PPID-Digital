import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Target,
  Flag,
  CheckCircle,
  Clock,
  Handshake,
  ArrowRight
} from '@phosphor-icons/react/dist/ssr'

// Utility untuk mengubah string menjadi title case yang rapi
function formatTitle(str: string) {
  return str.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Komponen Client untuk merender PDF Viewer atau List
import DokumenViewer from './DokumenViewer'
import AlurPermohonanDiagram from '@/components/AlurPermohonanDiagram'

export const dynamicParams = false // Karena kita tahu persis ada 8 kategori, kategori lain akan 404

export function generateStaticParams() {
  return [
    { kategori: 'daftar_informasi_publik' },
    { kategori: 'surat_keputusan' },
    { kategori: 'visi_misi' },
    { kategori: 'sop_spm' },
    { kategori: 'pelayanan' },
    { kategori: 'penghargaan' },
    { kategori: 'permohonan_informasi' },
    { kategori: 'dokumen_program_kegiatan' },
  ]
}

export default async function KategoriInformasiPage({
  params,
}: {
  params: Promise<{ kategori: string }>
}) {
  const resolvedParams = await params
  const kategoriKey = resolvedParams.kategori
  
  const validCategories = [
    'daftar_informasi_publik',
    'surat_keputusan',
    'visi_misi',
    'sop_spm',
    'pelayanan',
    'penghargaan',
    'permohonan_informasi',
    'dokumen_program_kegiatan'
  ]
  
  if (!validCategories.includes(kategoriKey)) {
    notFound()
  }

  // Gunakan standard client agar Next.js tidak membaca cookies() dan menggagalkan SSG
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Ambil meta kategori
  const { data: kontenData } = await supabase
    .from('konten_landing')
    .select('judul, isi_teks')
    .eq('section_key', kategoriKey)
    .single()

  // Ambil daftar dokumen
  const { data: dokumenList } = await supabase
    .from('dokumen_publik')
    .select('*')
    .eq('kategori_key', kategoriKey)
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex flex-col selection:bg-amber-400 selection:text-slate-900">
      
      {/* Navbar Minimalis */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5">
              <Image src="/logo-sulteng.webp" alt="Logo Sulteng" width={40} height={40} className="w-10 h-10 object-contain" />
              <Image src="/logo-cikasda.webp" alt="Logo CIKASDA" width={40} height={40} className="w-10 h-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                PPID DIGITAL
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                Dinas CIKASDA Prov. Sulteng
              </span>
            </div>
          </div>
          
          <nav className="flex items-center">
            <Link
              href="/"
              className="text-sm font-bold text-slate-600 hover:text-[#0e4891] transition-colors flex items-center gap-2"
            >
              <ArrowLeft weight="bold" size={14} /> Kembali ke Beranda
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-16 flex flex-col h-full">
        <div className="mb-12 border-b border-slate-200 pb-8">
          <Link href="/#kategori" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#0e4891] transition-colors mb-6 inline-flex items-center gap-1.5">
            <ArrowLeft weight="bold" size={14} /> Kategori Informasi
          </Link>
          <h1 className="font-black text-4xl md:text-5xl text-slate-900 tracking-tight leading-tight">
            {kontenData?.judul || formatTitle(kategoriKey)}
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-4 max-w-3xl leading-relaxed font-medium">
            {kontenData?.isi_teks || 'Informasi dan dokumen publik resmi yang dikelola oleh PPID Dinas CIKASDA Provinsi Sulawesi Tengah.'}
          </p>

          {/* 1. VISI DAN MISI */}
          {kategoriKey === 'visi_misi' && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Visi */}
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute -right-8 -top-8 text-amber-100/50 group-hover:text-amber-200/50 transition-colors duration-500">
                  <Target size={200} weight="fill" />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                    <Target size={36} weight="fill" className="text-slate-900" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-6">Visi PPID</h3>
                  <p className="text-xl text-slate-700 font-medium leading-relaxed italic">
                    “Mewujudkan pengelolaan dan pelayanan informasi publik Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah.”
                  </p>
                </div>
              </div>

              {/* Misi */}
              <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="absolute -right-8 -top-8 text-slate-800/50 group-hover:text-slate-800 transition-colors duration-500">
                  <Flag size={200} weight="fill" />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                    <Flag size={36} weight="fill" className="text-amber-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-8">Misi PPID</h3>
                  <ul className="space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="mt-1 bg-amber-400/20 p-1 rounded-full shrink-0">
                        <CheckCircle size={24} weight="fill" className="text-amber-400" />
                      </div>
                      <span className="text-slate-300 font-medium leading-relaxed text-lg">
                        Menyediakan informasi publik sesuai peraturan perundang-undangan.
                      </span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="mt-1 bg-amber-400/20 p-1 rounded-full shrink-0">
                        <CheckCircle size={24} weight="fill" className="text-amber-400" />
                      </div>
                      <span className="text-slate-300 font-medium leading-relaxed text-lg">
                        Menyediakan sumber daya manusia dan sarana pengelolaan dan pelayanan informasi yang baik.
                      </span>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="mt-1 bg-amber-400/20 p-1 rounded-full shrink-0">
                        <CheckCircle size={24} weight="fill" className="text-amber-400" />
                      </div>
                      <span className="text-slate-300 font-medium leading-relaxed text-lg">
                        Melayani pemohon informasi secara cepat, transparan dan bertanggungjawab.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. DAFTAR INFORMASI PUBLIK (Pintasan Kategori) */}
          {kategoriKey === 'daftar_informasi_publik' && (
            <div className="mt-10 bg-slate-50/50 rounded-2xl p-6 border border-slate-200">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Pintasan Kategori Spesifik</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/setiap-saat" className="bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 p-4 rounded-xl transition-all shadow-sm hover:shadow group">
                  <h3 className="font-bold text-slate-800 group-hover:text-[#0e4891] mb-1.5 transition-colors">Setiap Saat</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">Informasi yang siap tersedia setiap saat untuk diberikan kepada pemohon.</p>
                </Link>
                
                <Link href="/serta-merta" className="bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-200 p-4 rounded-xl transition-all shadow-sm hover:shadow group">
                  <h3 className="font-bold text-slate-800 group-hover:text-amber-600 mb-1.5 transition-colors">Serta Merta</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">Informasi penting yang dapat mengancam hajat hidup orang banyak.</p>
                </Link>
                
                <Link href="/berkala" className="bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 p-4 rounded-xl transition-all shadow-sm hover:shadow group">
                  <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 mb-1.5 transition-colors">Berkala</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">Informasi publik yang wajib diperbaharui dan disediakan secara rutin.</p>
                </Link>
                
                <Link href="/dikecualikan" className="bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 p-4 rounded-xl transition-all shadow-sm hover:shadow group">
                  <h3 className="font-bold text-slate-800 group-hover:text-rose-600 mb-1.5 transition-colors">Dikecualikan</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-medium">Informasi yang bersifat rahasia dan tidak dapat diakses publik (UU KIP).</p>
                </Link>
              </div>
            </div>
          )}

          {/* 3. PERMOHONAN INFORMASI (Bagan Alur Lengkap & Ketentuan Hukum) */}
          {kategoriKey === 'permohonan_informasi' && (
            <div className="mt-10">
              <AlurPermohonanDiagram mode="full" />
            </div>
          )}

          {/* 4. PELAYANAN (Maklumat & Jam Layanan) */}
          {kategoriKey === 'pelayanan' && (
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-blue-50 text-[#0e4891] rounded-2xl flex items-center justify-center mb-6">
                    <Handshake size={32} weight="fill" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Maklumat Pelayanan PPID</h3>
                  <blockquote className="border-l-4 border-amber-400 pl-4 py-1 italic text-slate-700 text-base leading-relaxed mb-6 font-medium">
                    “Dengan ini kami menyatakan sanggup menyelenggarakan pelayanan informasi publik sesuai standar pelayanan yang telah ditetapkan dan apabila tidak menepati janji, kami siap menerima sanksi sesuai ketentuan peraturan perundang-undangan.”
                  </blockquote>
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  Dinas CIKASDA Provinsi Sulawesi Tengah
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-white/10 text-amber-400 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                    <Clock size={32} weight="fill" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-6">Waktu Operasional Pelayanan</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2.5 border-b border-white/10">
                      <span className="text-slate-300 font-semibold text-sm">Senin – Kamis</span>
                      <span className="text-amber-400 font-bold font-mono text-sm">08.00 – 16.00 WITA</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-white/10">
                      <span className="text-slate-300 font-semibold text-sm">Jumat</span>
                      <span className="text-amber-400 font-bold font-mono text-sm">08.00 – 16.30 WITA</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-white/10">
                      <span className="text-slate-300 font-semibold text-sm">Waktu Istirahat (Senin-Kamis)</span>
                      <span className="text-slate-400 font-mono text-sm">12.00 – 13.00 WITA</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-slate-300 font-semibold text-sm">Waktu Istirahat (Jumat)</span>
                      <span className="text-slate-400 font-mono text-sm">11.30 – 13.00 WITA</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-6 italic">
                  *Pelayanan daring melalui portal web tetap dapat diakses 24 jam setiap hari.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tabel Data Akses Layanan untuk daftar_informasi_publik */}
        {kategoriKey === 'daftar_informasi_publik' && (() => {
          const DATA_AKSES_LAYANAN = [
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
          ]

          const TAHUN_LIST = ['2022', '2023', '2024', '2025', '2026']

          const DOKUMEN_KEPEGAWAIAN = [
            {
              nama: 'Daftar Urut Kepangkatan ASN (DUK)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Profil Pejabat Struktural (Foto, Data Profil Pribadi, Riwayat Kepangkatan, Riwayat Pendidikan dan Riwayat Jabatan)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Statistik ASN (Minimal Memuat Data Statistik Berdasarkan Pendidikan, Golongan Ruang, Jenis Kelamin)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Laporan Harta Kekayaan LHKASN/LHKPN Khusus Pejabat Struktural (Eselon 2) yang Telah Diverifikasi oleh KPK RI',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Laporan Harta Kekayaan LHKASN/LHKPN Khusus Pejabat Struktural (Eselon 3) yang Telah Diverifikasi oleh KPK RI',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Laporan Harta Kekayaan LHKASN/LHKPN Khusus Pejabat Struktural (Eselon 4) yang Telah Diverifikasi oleh KPK RI',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          const DOKUMEN_KEUANGAN_ASET = [
            {
              nama: 'Rencana Kerja Anggaran (RKA)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Dokumen Pelaksanaan Anggaran (DPA)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Laporan Realisasi Anggaran (LRA)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Catatan Atas Laporan Keuangan (CALK)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Anggaran Kas',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Daftar Aset',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Kebijakan Umum Anggaran (KUA) Prioritas Pagu Anggaran Sementara (PPAS)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Dokumen Rencana Umum Pengadaan (RUP)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Dokumen-Dokumen Elektronik Berkaitan dengan Progam dan Kegiatan',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          const DOKUMEN_PERENCANAAN = [
            {
              nama: 'Indikator Kinerja Utama (IKU)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'RENSTRA (Rencana Strategis)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'RENJA (Rencana Kerja Awal)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'LAKIP (Laporan Kinerja Instansi Pemerintah)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'LPPD (Laporan Pertanggungjawaban Pemerintah Daerah)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Perjanjian Kinerja (Internal OPD)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          const DOKUMEN_KETATAUSAHAAN = [
            {
              nama: 'Agenda Pimpinan OPD / Buku Tamu (Januari - Desember)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Surat menyurat pimpinan OPD atau pejabat Kementerian/Lembaga/Badan dalam rangka pelaksaan tugas, fungsi, dan wewenangnya Tahun 2024 - 2026',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          const DOKUMEN_KETERBUKAAN_INFORMASI = [
            {
              nama: 'Daftar Informasi Publik (DIP)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Daftar Informasi Dikecualikan dari PPID Utama (SK) atau Surat Usul Informasi Dikecualikan oleh PPID Pelaksana',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'SK Pimpinan Badan Publik Tentang Struktur PPID Pelaksana',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'SK Tim Petugas Informasi',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'SK Tim Petugas Aduan Masyarakat',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'SK Tim Petugas Kehumasan',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Standar Pelayanan (SP)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          const DOKUMEN_KINERJA_BADAN_PUBLIK = [
            {
              nama: 'Survey Kepuasan Masyarakat (SKM)',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Permohonan Informasi Online',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          const PENGELOLAAN_ADUAN_WEB = [
            {
              nama: 'Memiliki aplikasi WEB sendiri dalam mengelola aplikasi aduan masyarkat',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Mengelola aplikasi aduan masyarakat melalui aplikasi Lapor!',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'WEB Resmi OPD memliki link untuk terhubung ke aplikasi Lapor!',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          const TIM_LAYANAN_ADUAN = [
            {
              nama: 'Fotokopi SK Tim Pengelolaan Layanan Aduan',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Fotokopi Tanda Terima (SPM) Honorarium/SPPD Tim Pengelola Layanan Aduan',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          const PUBLIKASI_LAYANAN_ADUAN = [
            {
              nama: 'Dokumentasi kegiatan layanan aduan masyarakat melalui publikasi FLAYER di media sosial',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Dokumentasi kegiatan layanan aduan masyarakat melalui pemasangan BANNER di ruang publik',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Foto kegiatan sosialisasi tentang aduan masyarakat',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
            {
              nama: 'Foto kopi SPM pelaksanaan kegiatan sosialisasi tentang aduan masyarakat',
              links: {
                '2022': '#',
                '2023': '#',
                '2024': '#',
                '2025': '#',
                '2026': '#',
              },
            },
          ]

          return (
            <div className="space-y-12 mb-12">
              {/* TABEL 1: DATA AKSES LAYANAN INFORMASI PUBLIK */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide">DATA AKSES LAYANAN INFORMASI PUBLIK</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DATA_AKSES_LAYANAN.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Buka ${row.nama} (${th})`}
                                    >
                                      Klik
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Link ${row.nama} (${th})`}
                                    >
                                      Klik
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 2: DOKUMEN TENTANG KEPEGAWAIAN */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">DOKUMEN TENTANG KEPEGAWAIAN</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DOKUMEN_KEPEGAWAIAN.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 3: DOKUMEN TENTANG KEUANGAN DAN ASET */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">DOKUMEN TENTANG KEUANGAN DAN ASET</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DOKUMEN_KEUANGAN_ASET.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 4: DOKUMEN TENTANG PERENCANAAN */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">DOKUMEN TENTANG PERENCANAAN</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DOKUMEN_PERENCANAAN.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 5: DOKUMEN TENTANG KETATAUSAHAAN */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">DOKUMEN TENTANG KETATAUSAHAAN</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DOKUMEN_KETATAUSAHAAN.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 6: DOKUMEN TENTANG KETERBUKAAN INFORMASI PUBLIK */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">DOKUMEN TENTANG KETERBUKAAN INFORMASI PUBLIK</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DOKUMEN_KETERBUKAAN_INFORMASI.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 7: DOKUMEN TENTANG KINERJA BADAN PUBLIK */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">DOKUMEN TENTANG KINERJA BADAN PUBLIK</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {DOKUMEN_KINERJA_BADAN_PUBLIK.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 8: PENGELOLAAN ADUAN MASYARAKAT MELALUI APLIKASI BERBASIS WEB */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">PENGELOLAAN ADUAN MASYARAKAT MELALUI APLIKASI BERBASIS WEB</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {PENGELOLAAN_ADUAN_WEB.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 9: TIM KEGIATAN PENGELOLAAN LAYANAN ADUAN */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">TIM KEGIATAN PENGELOLAAN LAYANAN ADUAN</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {TIM_LAYANAN_ADUAN.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL 10: KEGIATAN PUBLIKASI LAYANAN ADUAN MASYARAKAT (LAPOR!) MELALUI KEGIATAN OPD */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 tracking-wide uppercase">KEGIATAN PUBLIKASI LAYANAN ADUAN MASYARAKAT (LAPOR!) MELALUI KEGIATAN OPD</h3>
                  <span className="text-xs font-bold text-slate-500 font-mono hidden sm:inline-block">Tahun 2022 - 2026</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-[#0e4891] text-white">
                        <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                        {TAHUN_LIST.map((th) => (
                          <th key={th} className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {PUBLIKASI_LAYANAN_ADUAN.map((row, idx) => {
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                              {row.nama}
                            </td>
                            {TAHUN_LIST.map((th) => {
                              const targetUrl = (row.links as Record<string, string>)[th] || '#'
                              const isExternal = targetUrl.startsWith('http')
                              return (
                                <td key={th} className="py-4 px-4 text-center">
                                  {targetUrl && targetUrl !== '#' ? (
                                    <a
                                      href={targetUrl}
                                      target={isExternal ? '_blank' : '_self'}
                                      rel={isExternal ? 'noopener noreferrer' : undefined}
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </a>
                                  ) : (
                                    <span
                                      className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                      title={`Unduh ${row.nama} (${th})`}
                                    >
                                      Unduh
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Dokumen Lampiran Lainnya untuk daftar_informasi_publik */}
        {kategoriKey === 'daftar_informasi_publik' && dokumenList && dokumenList.length > 0 && (
          <div className="mb-6 mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Dokumen Lampiran Lainnya</h2>
            <DokumenViewer dokumenList={dokumenList} />
          </div>
        )}

        {/* Render DokumenViewer untuk kategori dokumen nyata (bukan visi_misi dan bukan daftar_informasi_publik) */}
        {kategoriKey !== 'visi_misi' && kategoriKey !== 'daftar_informasi_publik' && (
          <>
            {dokumenList && dokumenList.length > 0 ? (
              <div className="mt-4">
                {(kategoriKey === 'permohonan_informasi' || kategoriKey === 'pelayanan') && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Dokumen Lampiran & Regulasi Terkait</h2>
                  </div>
                )}
                <DokumenViewer dokumenList={dokumenList} />
              </div>
            ) : (
              kategoriKey !== 'permohonan_informasi' && kategoriKey !== 'pelayanan' && (
                <DokumenViewer dokumenList={[]} />
              )
            )}
          </>
        )}
        
      </main>
    </div>
  )
}
