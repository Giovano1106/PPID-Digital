import { createClient } from '@/app/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'

// Utility untuk mengubah string menjadi title case yang rapi
function formatTitle(str: string) {
  return str.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Komponen Client untuk merender PDF Viewer atau List
import DokumenViewer from './DokumenViewer'

export default async function KategoriInformasiPage({
  params,
}: {
  params: Promise<{ kategori: string }>
}) {
  const resolvedParams = await params
  const kategoriKey = resolvedParams.kategori
  
  const validCategories = ['berkala', 'serta_merta', 'setiap_saat', 'dikecualikan']
  
  if (!validCategories.includes(kategoriKey)) {
    notFound()
  }

  const supabase = await createClient()

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
          <Link href="/#kategori-informasi" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#0e4891] transition-colors mb-6 inline-flex items-center gap-1.5">
            <ArrowLeft weight="bold" size={14} /> Kategori Dokumen
          </Link>
          <h1 className="font-black text-4xl md:text-5xl text-slate-900 tracking-tight leading-tight">
            {kontenData?.judul || formatTitle(kategoriKey)}
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-4 max-w-3xl leading-relaxed font-medium">
            {kontenData?.isi_teks || 'Daftar dokumen publik yang tersedia untuk kategori ini.'}
          </p>
        </div>

        {/* Client Component untuk interaktivitas PDF */}
        <DokumenViewer dokumenList={dokumenList || []} />
        
      </main>
    </div>
  )
}
