import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import KategoriCard from '@/components/KategoriCard'
import LandingNav from '@/components/LandingNav'
import { MapPin, Phone, EnvelopeSimple } from '@phosphor-icons/react/dist/ssr'

// Revalidate page so it works with on-demand revalidation or periodic if needed
export const revalidate = 3600 // We still can set a baseline, but on-demand takes precedence. Actually let's just let it be default.

export default async function HomePage() {
  const supabase = await createClient()

  const [kontenRes, dokumenRes] = await Promise.all([
    supabase.from('konten_landing').select('*').order('id', { ascending: true }),
    supabase.from('dokumen_publik').select('*').order('created_at', { ascending: true })
  ])

  const listKonten = kontenRes.data || []
  const listDokumen = dokumenRes.data || []

  const getKontenBySection = (key: string) => {
    return listKonten.find((k) => k.section_key === key)
  }

  const getDokumenCountByKategori = (key: string) => {
    return listDokumen.filter((d) => d.kategori_key === key).length
  }

  const KATEGORI_KEYS = [
    { key: 'daftar_informasi_publik', label: 'Daftar Informasi Publik', badge: 'Informasi' },
    { key: 'surat_keputusan', label: 'Surat Keputusan', badge: 'Dokumen' },
    { key: 'visi_misi', label: 'Visi dan Misi PPID', badge: 'Profil' },
    { key: 'sop_spm', label: 'SOP dan SPM PPID', badge: 'Standar' },
    { key: 'pelayanan', label: 'Pelayanan', badge: 'Layanan' },
    { key: 'penghargaan', label: 'Penghargaan', badge: 'Apresiasi' },
    { key: 'permohonan_informasi', label: 'Permohonan Informasi', badge: 'Layanan' },
    { key: 'dokumen_program_kegiatan', label: 'Dokumen Program dan Kegiatan Tahun 2022-2024', badge: 'Laporan' },
  ]

  // We need to know if user is logged in for the Hero section button ("Ajukan Permohonan" vs "Daftar")
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-plus-jakarta antialiased selection:bg-amber-400 selection:text-slate-900">
      <LandingNav />

      {/* HERO SECTION */}
      <section className="py-24 px-6 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Layanan Portal Resmi Informasi Publik Digital
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mb-6">
            Akses Layanan Informasi Publik <span className="text-[#0e4891]">CIKASDA</span> Sulawesi Tengah
          </h1>

          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mb-10">
            Wujud komitmen transparansi, akuntabilitas, dan pelayanan informasi terbuka bagi seluruh masyarakat Sulawesi Tengah.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={user ? '/permohonan-saya/ajukan' : '/daftar'}
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-sm text-base"
            >
              Ajukan Permohonan Informasi
            </Link>
            <Link
              href="#kategori"
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-7 py-3.5 rounded-xl border border-slate-200 transition-colors shadow-sm text-base"
            >
              Lihat Daftar Informasi
            </Link>
          </div>
        </div>
      </section>

      {/* TENTANG PPID SECTION */}
      <section className="py-20 px-6 border-b border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-start">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              {getKontenBySection('tentang_ppid')?.judul || 'Tentang PPID CIKASDA'}
            </h2>
            <div className="w-12 h-1.5 bg-amber-400 rounded-full mb-6"></div>
          </div>
          <div className="md:w-2/3">
            <div className="prose prose-slate prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium prose-strong:text-slate-900 max-w-none text-lg">
              <p>
                {getKontenBySection('tentang_ppid')?.isi_teks || 
                  'Pejabat Pengelola Informasi dan Dokumentasi (PPID) pada Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah berfungsi sebagai layanan informasi publik dalam rangka mewujudkan penyelenggaraan negara yang baik, yaitu transparan, efektif dan efisien, akuntabel serta dapat dipertanggungjawabkan.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI INFORMASI SECTION */}
      <section id="kategori" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
              {getKontenBySection('kategori_informasi')?.judul || 'Kategori Informasi Publik'}
            </h2>
            <p className="text-slate-600 font-medium text-lg">
              {getKontenBySection('kategori_informasi')?.isi_teks || 'Telusuri berbagai kategori dokumen dan informasi publik yang tersedia secara terbuka untuk masyarakat.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {KATEGORI_KEYS.map((kategori) => (
              <KategoriCard
                key={kategori.key}
                href={`/informasi/${kategori.key}`}
                title={kategori.label}
                description="Klik untuk melihat daftar dokumen publik pada kategori ini."
                count={getDokumenCountByKategori(kategori.key)}
                badge={kategori.badge}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#0e4891] flex items-center justify-center text-amber-400 font-black text-xl shadow-sm">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-none">
                  PPID DIGITAL
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Dinas CIKASDA Prov. Sulteng
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
              Portal Layanan Informasi Publik Digital resmi dari Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah. Membangun transparansi melalui akses informasi yang mudah dan cepat.
            </p>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Hubungi Kami</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-amber-400 mt-1 shrink-0" size={18} weight="fill" />
                <span className="text-sm font-medium leading-relaxed">
                  Jl. Mohammad Yamin No.11, Tatura Utara, Kec. Palu Sel., Kota Palu, Sulawesi Tengah 94111
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-amber-400 shrink-0" size={18} weight="fill" />
                <span className="text-sm font-medium">0812-4217-0628</span>
              </li>
              <li className="flex items-center gap-3">
                <EnvelopeSimple className="text-amber-400 shrink-0" size={18} weight="fill" />
                <span className="text-sm font-medium">cikasda.sulteng@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#kategori" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Daftar Informasi Publik
                </Link>
              </li>
              <li>
                <Link href="/daftar" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Buat Akun Pemohon
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Masuk Sistem
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500">
            &copy; {new Date().getFullYear()} PPID Dinas CIKASDA Prov. Sulteng. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded-full text-slate-400">
              Versi 1.0.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}