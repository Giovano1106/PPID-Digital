'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/client'

const supabase = createClient()

type KontenLanding = {
  id: number
  section_key: string
  judul: string
  isi_teks: string
  link_drive: string | null
}

export default function HomePage() {
  const [listKonten, setListKonten] = useState<KontenLanding[]>([])

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUserAndKonten = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      const { data } = await supabase.from('konten_landing').select('*')
      if (data) setListKonten(data)
    }
    fetchUserAndKonten()
  }, [])

  // Mengambil link drive berdasarkan section_key
  const getLink = (key: string) => {
    const item = listKonten.find((k) => k.section_key === key)
    return item?.link_drive || '#'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* TOP NAVBAR NAVIGATION */}
      <nav className="bg-[#0a366f] text-white border-b border-white/10 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-900 font-black flex items-center justify-center text-base shadow-sm">
              P
            </div>
            <div>
              <span className="font-extrabold text-sm md:text-base tracking-wide block leading-tight">
                PPID DIGITAL
              </span>
              <span className="text-[10px] text-blue-200 block uppercase tracking-wider font-semibold">
                CIKASDA PROV. SULTENG
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            {user ? (
              <>
                <Link
                  href="/permohonan-saya"
                  className="bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-lg border border-white/20 transition"
                >
                  📋 Riwayat Saya
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-rose-600/80 hover:bg-rose-600 px-3 py-2 rounded-lg transition"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-amber-300 transition px-2 py-1"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 1. HERO BANNER CIKASDA */}
      <section className="relative bg-[#0e4891] text-white overflow-hidden py-20 md:py-28 px-4 border-b-4 border-amber-400">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest text-amber-300 mb-6 shadow-sm">
            <span>🏛️ PPID Resmi CIKASDA Sulawesi Tengah</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white max-w-4xl mx-auto">
            LAYANAN INFORMASI & DOKUMENTASI PUBLIK DIGITAL
          </h1>

          <p className="mt-4 text-base md:text-lg text-blue-100 max-w-2xl mx-auto font-medium">
            Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah berkomitmen memberikan transparansi data dan kemudahan akses informasi bagi masyarakat.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={user ? '/permohonan-saya/ajukan' : '/login'}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-95 text-sm tracking-wider uppercase"
            >
              Ajukan Permohonan Informasi
            </Link>
            <a
              href="#kategori-informasi"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl border border-white/30 backdrop-blur-md transition text-sm tracking-wider uppercase"
            >
              Lihat Daftar Informasi
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATISTIK RINGKAS */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="text-center border-r border-slate-100 last:border-none p-2">
            <p className="text-2xl md:text-3xl font-black text-[#0e4891]">100%</p>
            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Transparansi Publik</p>
          </div>
          <div className="text-center border-r border-slate-100 last:border-none p-2">
            <p className="text-2xl md:text-3xl font-black text-[#0e4891]">4</p>
            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Kategori Informasi</p>
          </div>
          <div className="text-center border-r border-slate-100 last:border-none p-2">
            <p className="text-2xl md:text-3xl font-black text-[#0e4891]">24/7</p>
            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Akses Layanan</p>
          </div>
          <div className="text-center p-2">
            <p className="text-2xl md:text-3xl font-black text-amber-500">Gratis</p>
            <p className="text-xs font-bold text-slate-500 uppercase mt-1">Tanpa Biaya</p>
          </div>
        </div>
      </section>

      {/* 3. KATEGORI INFORMASI PUBLIK */}
      <section id="kategori-informasi" className="max-w-6xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#0e4891] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
            Kategori Dokumen
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
            Daftar Informasi Publik CIKASDA
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Pilih kategori informasi untuk langsung melihat berkas publik yang tersedia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-[#0e4891] transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl text-[#0e4891] font-bold mb-4 group-hover:bg-[#0e4891] group-hover:text-white transition">
                📅
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0e4891] transition">
                Informasi Berkala
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Informasi yang diperbarui dan diumumkan secara rutin berkala oleh PPID CIKASDA.
              </p>
            </div>
            <a
              href={getLink('berkala')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block text-center rounded-lg bg-slate-100 group-hover:bg-[#0e4891] group-hover:text-white py-2.5 text-xs font-bold text-slate-700 transition"
            >
              Buka Berkas Google Drive ➔
            </a>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-[#0e4891] transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl text-amber-600 font-bold mb-4 group-hover:bg-amber-500 group-hover:text-white transition">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0e4891] transition">
                Informasi Serta Merta
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Informasi penting yang menyangkut hajat hidup orang banyak dan ketertiban umum.
              </p>
            </div>
            <a
              href={getLink('serta_merta')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block text-center rounded-lg bg-slate-100 group-hover:bg-[#0e4891] group-hover:text-white py-2.5 text-xs font-bold text-slate-700 transition"
            >
              Buka Berkas Google Drive ➔
            </a>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-[#0e4891] transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl text-emerald-600 font-bold mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                📂
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0e4891] transition">
                Informasi Setiap Saat
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Informasi publik yang wajib disediakan dan dapat diakses kapan saja oleh pemohon.
              </p>
            </div>
            <a
              href={getLink('setiap_saat')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block text-center rounded-lg bg-slate-100 group-hover:bg-[#0e4891] group-hover:text-white py-2.5 text-xs font-bold text-slate-700 transition"
            >
              Buka Berkas Google Drive ➔
            </a>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-[#0e4891] transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-2xl text-rose-600 font-bold mb-4 group-hover:bg-rose-600 group-hover:text-white transition">
                🔒
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0e4891] transition">
                Informasi Dikecualikan
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Daftar informasi yang bersifat rahasia sesuai ketentuan regulasi dan undang-undang.
              </p>
            </div>
            <a
              href={getLink('dikecualikan')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block text-center rounded-lg bg-slate-100 group-hover:bg-[#0e4891] group-hover:text-white py-2.5 text-xs font-bold text-slate-700 transition"
            >
              Buka Berkas Google Drive ➔
            </a>
          </div>
        </div>
      </section>

      {/* 4. TATA CARA PERMOHONAN */}
      <section className="bg-slate-100 py-16 px-4 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Tata Cara Permohonan Informasi
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Langkah mudah mengajukan permohonan informasi publik secara online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center relative">
              <span className="w-8 h-8 bg-[#0e4891] text-white font-bold text-sm rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Buat Akun / Login</h4>
              <p className="text-xs text-slate-600 mt-2">
                Daftar akun pemohon menggunakan NIK dan identitas diri yang valid.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center relative">
              <span className="w-8 h-8 bg-[#0e4891] text-white font-bold text-sm rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Isi Form </h4>
              <p className="text-xs text-slate-600 mt-2">
                Isi rincian informasi yang dicari
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center relative">
              <span className="w-8 h-8 bg-[#0e4891] text-white font-bold text-sm rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Verifikasi PPID</h4>
              <p className="text-xs text-slate-600 mt-2">
                Petugas PPID CIKASDA memproses dan memverifikasi permohonan Anda.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center relative">
              <span className="w-8 h-8 bg-[#0e4891] text-white font-bold text-sm rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Terima Informasi</h4>
              <p className="text-xs text-slate-600 mt-2">
                Status dipantau dari dashboard dan salinan dokumen diberikan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0e4891] text-white text-center py-8 text-xs font-medium border-t-4 border-amber-400">
        <p className="tracking-wide">
          © 2026 DINAS CIPTA KARYA DAN SUMBER DAYA AIR PROVINSI SULAWESI TENGAH
        </p>
        <p className="text-blue-200 mt-1">Pejabat Pengelola Informasi dan Dokumentasi (PPID) Digital</p>
      </footer>
    </div>
  )
}