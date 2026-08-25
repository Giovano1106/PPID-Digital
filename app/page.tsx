'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/client'
import KategoriCard from '@/components/KategoriCard'
import ConfirmModal from '@/components/ConfirmModal'
import Toast, { ToastType } from '@/components/Toast'
import { SpinnerGap, MapPin, Phone, EnvelopeSimple, List, X } from '@phosphor-icons/react'

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

  // State Modal Konfirmasi & Toast
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

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

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setShowLogoutModal(false)
    setLoggingOut(false)
    setToast({ message: 'Anda berhasil keluar dari akun.', type: 'info' })
    setTimeout(() => {
      window.location.reload()
    }, 1200)
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
                      className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      Admin Console
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="text-rose-600 hover:text-rose-700 px-2 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/permohonan-saya"
                      className="text-slate-600 hover:text-[#0e4891] transition-colors font-bold"
                    >
                      Riwayat Permohonan
                    </Link>
                    <Link
                      href="/permohonan-saya/ajukan"
                      className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      Ajukan Permohonan
                    </Link>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button
                      onClick={handleLogoutClick}
                      className="text-rose-600 hover:text-rose-700 px-2 py-1.5 rounded-lg text-sm font-bold transition-all"
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
            className="md:hidden flex items-center justify-center p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X weight="bold" size={24} /> : <List weight="bold" size={24} />}
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
                      onClick={handleLogoutClick}
                      className="w-full text-center bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/permohonan-saya/ajukan"
                      className="w-full text-center bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-4 py-3 rounded-xl transition-all shadow-sm"
                    >
                      Ajukan Permohonan
                    </Link>
                    <Link
                      href="/permohonan-saya"
                      className="text-slate-600 hover:text-[#0e4891] transition-colors font-bold py-2 border-b border-slate-100 text-center"
                    >
                      Riwayat Permohonan
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-center text-rose-600 hover:bg-rose-50 px-4 py-3 rounded-xl text-sm font-bold transition-all mt-1"
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
              Ajukan Permohonan Sekarang
            </Link>
            <a
              href="#kategori-informasi"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-7 py-3.5 rounded-xl transition-colors text-base border border-slate-200"
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
      <section id="kategori-informasi" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-[#0e4891] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Klasifikasi Dokumen
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3 mb-3">
            Kategori Informasi Publik
          </h2>
          <p className="text-slate-600 text-base font-medium">
            Pilih salah satu dari 4 kategori informasi publik untuk mengakses dokumen resmi dan laporan publik.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
            <div className="inline-block animate-spin text-2xl mb-2"><SpinnerGap weight="bold" /></div>
            <div>Memuat data informasi publik...</div>
          </div>
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
      <section className="py-24 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-[#0e4891] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Panduan Pemohon
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3 mb-3">
              Tahapan Alur Pengajuan Informasi
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-medium">
              4 langkah praktis mengajukan dan memantau permohonan informasi publik secara daring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-[#0e4891]/40 hover:shadow-md transition-all duration-300 group">
              <div className="w-11 h-11 bg-[#0e4891] text-amber-400 font-black text-lg rounded-xl flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                01
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Registrasi / Login
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Buat akun pengguna baru dengan NIK KTP terverifikasi atau masuk ke akun yang sudah terdaftar.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-[#0e4891]/40 hover:shadow-md transition-all duration-300 group">
              <div className="w-11 h-11 bg-[#0e4891] text-amber-400 font-black text-lg rounded-xl flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                02
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Isi Form Permohonan
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Pilih kategori informasi, tulis rincian kebutuhan dokumen dan tujuan penggunaan secara rinci.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-[#0e4891]/40 hover:shadow-md transition-all duration-300 group">
              <div className="w-11 h-11 bg-[#0e4891] text-amber-400 font-black text-lg rounded-xl flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                03
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Verifikasi Petugas
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Tim PPID akan mengkaji permohonan sesuai standar operasional SLA 10 hari kerja.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-[#0e4891]/40 hover:shadow-md transition-all duration-300 group">
              <div className="w-11 h-11 bg-[#0e4891] text-amber-400 font-black text-lg rounded-xl flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                04
              </div>
              <h4 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Terima Jawaban Resmi
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Dapatkan jawaban resmi beserta salinan berkas digital langsung melalui dashboard permohonan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER MULTI-COLUMN */}
      <footer className="bg-slate-900 text-white pt-16 pb-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-slate-800">
          {/* Kolom 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0e4891] text-amber-400 flex items-center justify-center font-black text-xl shadow-inner">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base tracking-tight text-white leading-none">
                  PPID DIGITAL
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Dinas CIKASDA Prov. Sulteng
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Portal Pejabat Pengelola Informasi dan Dokumentasi (PPID) resmi Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah.
            </p>
          </div>

          {/* Kolom 2: Kontak & Alamat */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2.5">
              Kontak & Alamat
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li className="flex items-start gap-2">
                <MapPin weight="fill" size={16} className="text-amber-400 shrink-0" />
                <span>Jl. Ir. H. Juanda No. 10, Palu, Sulawesi Tengah</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone weight="fill" size={16} className="text-amber-400 shrink-0" />
                <span>(0451) 422111 / WA Layanan PPID</span>
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeSimple weight="fill" size={16} className="text-amber-400 shrink-0" />
                <span>ppid.cikasda@sultengprov.go.id</span>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Jam Layanan */}
          <div>
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2.5">
              Jam Operasional Layanan
            </h4>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Senin - Kamis:</span>
                <span className="font-bold text-white">08:00 - 16:00 WITA</span>
              </div>
              <div className="flex justify-between border-t border-slate-700/40 pt-2">
                <span className="font-semibold text-slate-400">Jumat:</span>
                <span className="font-bold text-white">08:00 - 16:30 WITA</span>
              </div>
              <div className="flex justify-between border-t border-slate-700/40 pt-2 text-amber-400 font-semibold">
                <span>Sabtu - Minggu:</span>
                <span>Tutup (Hari Libur)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <div>
            © {new Date().getFullYear()} PPID Dinas CIKASDA Provinsi Sulawesi Tengah. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik</span>
          </div>
        </div>
      </footer>

      {/* CONFIRM LOGOUT MODAL */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun PPID Digital?"
        confirmText="Keluar Akun"
        cancelText="Batal"
        variant="danger"
        loading={loggingOut}
      />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}