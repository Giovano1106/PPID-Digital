import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/server'
import { ArrowLeft, ArrowSquareOut, FileText } from '@phosphor-icons/react/dist/ssr'

export default async function DikecualikanPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('konten_landing')
    .select('judul, isi_teks, link_drive')
    .eq('section_key', 'dikecualikan')
    .single()

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex flex-col selection:bg-[#0e4891] selection:text-white">
      {/* Navbar Minimalis Resmi */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
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

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-14">
        <div className="mb-8 border-b border-slate-200 pb-6">
          <Link
            href="/informasi/daftar_informasi_publik"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#0e4891] transition-colors mb-4 inline-flex items-center gap-1.5"
          >
            <ArrowLeft weight="bold" size={14} /> Daftar Informasi Publik
          </Link>
          <div className="flex items-center gap-2 mt-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              Kategori KIP Tertutup
            </span>
          </div>
          <h1 className="font-black text-3xl md:text-4xl text-slate-900 tracking-tight">
            {data?.judul ?? 'Informasi Dikecualikan'}
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-2 font-medium">
            Informasi publik yang bersifat rahasia dan tidak dapat diakses publik berdasarkan Pasal 17 UU No. 14 Tahun 2008 dan Uji Konsekuensi.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-700 font-semibold">
            Gagal mengambil data informasi dari server.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <FileText size={22} weight="bold" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Dasar Hukum & Rincian Pengecualian
              </h2>
            </div>

            <div className="prose prose-slate max-w-none text-xs md:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {data?.isi_teks ?? 'Konten informasi belum ditambahkan oleh pengelola.'}
            </div>

            {data?.link_drive && (
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={data.link_drive}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-xs"
                >
                  <span>Buka Berkas Hasil Uji Konsekuensi</span>
                  <ArrowSquareOut size={15} weight="bold" />
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}