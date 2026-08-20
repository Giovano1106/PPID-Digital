'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/client'
import KategoriCard from '@/components/KategoriCard'

const supabase = createClient()

type KontenLanding = {
  id: number
  section_key: string
  judul: string
  isi_teks: string
}

type DokumenPublik = {
  id: number | string
  kategori_key: string
  nama_dokumen: string
  file_url: string
}

export default function HomePage() {
  const [listKonten, setListKonten] = useState<KontenLanding[]>([])
  const [listDokumen, setListDokumen] = useState<DokumenPublik[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single()

        if (profile?.role === 'admin') {
          setIsAdmin(true)
        }
      }

      const [kontenRes, dokumenRes] = await Promise.all([
        supabase.from('konten_landing').select('*').order('id', { ascending: true }),
        supabase.from('dokumen_publik').select('*').order('created_at', { ascending: true })
      ])

      if (kontenRes.data) setListKonten(kontenRes.data)
      if (dokumenRes.data) setListDokumen(dokumenRes.data)
      setLoading(false)
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    window.location.reload()
  }

  const getKontenBySection = (key: string) => {
    return listKonten.find((k) => k.section_key === key)
  }

  const getDokumenCountByKategori = (key: string) => {
    return listDokumen.filter((d) => d.kategori_key === key).length
  }

  const KATEGORI_KEYS = [
    { key: 'berkala', label: 'Informasi Berkala', badge: 'Rutin' },
    { key: 'serta_merta', label: 'Informasi Serta Merta', badge: 'Darurat' },
    { key: 'setiap_saat', label: 'Informasi Setiap Saat', badge: 'On-Demand' },
    { key: 'dikecualikan', label: 'Informasi Dikecualikan', badge: 'Terbatas' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-plus-jakarta antialiased selection:bg-amber-400 selection:text-slate-900">
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#0e4891] flex items-center justify-center text-amber-400 font-black text-xl shadow-sm">
              P
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

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className="text-slate-700 hover:text-[#0e4891] transition-colors font-bold"
                    >
                      Admin Console
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/permohonan-saya"
                      className="text-slate-600 hover:text-[#0e4891] transition-colors"
                    >
                      Riwayat Permohonan
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Keluar
                    </button>
                    <Link
                      href="/permohonan-saya/ajukan"
                      className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      Ajukan Permohonan
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-[#0e4891] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Ajukan Permohonan
                </Link>
              </>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden flex items-center justify-center p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-6 flex flex-col gap-4 animate-fade-in">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className="text-slate-700 hover:text-[#0e4891] transition-colors font-bold py-2 border-b border-slate-100"
                    >
                      Admin Console
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/permohonan-saya"
                      className="text-slate-600 hover:text-[#0e4891] transition-colors font-bold py-2 border-b border-slate-100"
                    >
                      Riwayat Permohonan
                    </Link>
                    <Link
                      href="/permohonan-saya/ajukan"
                      className="w-full text-center bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-sm"
                    >
                      Ajukan Permohonan
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-center bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm font-bold transition-all mt-2"
                    >
                      Keluar
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-[#0e4891] transition-colors font-bold py-2 border-b border-slate-100 text-center"
                >
                  Masuk Akun
                </Link>
                <Link
                  href="/daftar"
                  className="w-full text-center bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-sm"
                >
                  Ajukan Permohonan Baru
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="py-24 px-6 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Layanan Portal Resmi Informasi Publik
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mb-6">
            Akses Layanan Informasi Publik CIKASDA Sulawesi Tengah
          </h1>

          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mb-10">
            Keterbukaan informasi untuk mewujudkan tata kelola pemerintahan yang transparan, akuntabel, dan partisipatif.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={user ? '/permohonan-saya/ajukan' : '/daftar'}
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md text-base"
            >
              Ajukan Permohonan Sekarang
            </Link>
            <a
              href="#kategori-informasi"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-7 py-3.5 rounded-xl transition-all text-base border border-slate-200"
            >
              Lihat Kategori Informasi
            </a>
          </div>
        </div>
      </section>

      {/* RINGKASAN STATISTIK */}
      <section className="bg-[#0e4891] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-black text-amber-400">100%</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-100 mt-1">Transparansi Publik</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-white">10 Hari</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-100 mt-1">Maksimal SLA Respon</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-amber-400">4 Kategori</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-100 mt-1">Jenis Informasi</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-white">Gratis</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-100 mt-1">Tanpa Biaya Layanan</div>
          </div>
        </div>
      </section>

      {/* KATEGORI INFORMASI (4 SEBARIS COMPONENT GRID LAYOUT) */}
      <section id="kategori-informasi" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Kategori Informasi Publik
          </h2>
          <p className="text-slate-600 text-base font-medium">
            Pilih salah satu dari 4 kategori informasi publik untuk melihat daftar dokumen resmi.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Memuat data informasi publik...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {KATEGORI_KEYS.map((cat) => {
              const konten = getKontenBySection(cat.key)
              const count = getDokumenCountByKategori(cat.key)

              return (
                <KategoriCard
                  key={cat.key}
                  title={konten?.judul || cat.label}
                  description={konten?.isi_teks || 'Dokumen resmi yang dikelola oleh PPID CIKASDA Sulteng.'}
                  badge={cat.badge}
                  count={count}
                  href={`/informasi/${cat.key}`}
                />
              )
            })}
          </div>
        )}
      </section>

      {/* TATA CARA PERMOHONAN */}
      <section className="py-20 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Tahapan Alur Pengajuan Informasi
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Prosedur sederhana untuk mengajukan permohonan informasi publik secara daring di PPID CIKASDA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 bg-[#0e4891] text-amber-400 font-extrabold text-base rounded-lg flex items-center justify-center mb-4">
                01
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Registrasi / Login</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Buat akun pengguna baru dengan menyertakan identitas NIK KTP yang sah.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 bg-[#0e4891] text-amber-400 font-extrabold text-base rounded-lg flex items-center justify-center mb-4">
                02
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Isi Form Formulir</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Pilih kategori informasi dan tuliskan rincian kebutuhan dokumen secara jelas.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 bg-[#0e4891] text-amber-400 font-extrabold text-base rounded-lg flex items-center justify-center mb-4">
                03
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Verifikasi Petugas</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Admin PPID akan meninjau dan memproses permohonan sesuai standar SLA 10 hari.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="w-10 h-10 bg-[#0e4891] text-amber-400 font-extrabold text-base rounded-lg flex items-center justify-center mb-4">
                04
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-2">Terima Jawaban</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Dapatkan tanggapan resmi dan dokumen informasi publik langsung di dashboard Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0e4891] text-amber-400 flex items-center justify-center font-bold text-base">
              P
            </div>
            <div>
              <div className="font-bold text-sm">PPID Digital CIKASDA</div>
              <div className="text-xs text-slate-400">Dinas Cipta Karya dan Sumber Daya Air Sulawesi Tengah</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} PPID CIKASDA Sulawesi Tengah. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}