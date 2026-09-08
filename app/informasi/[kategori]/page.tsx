import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, Target, Flag, CheckCircle, Clock, Lightning, Calendar, LockKey } from '@phosphor-icons/react/dist/ssr'

// Utility untuk mengubah string menjadi title case yang rapi
function formatTitle(str: string) {
  return str.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Komponen Client untuk merender PDF Viewer atau List
import DokumenViewer from './DokumenViewer'

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
            <ArrowLeft weight="bold" size={14} /> Kategori Dokumen
          </Link>
          <h1 className="font-black text-4xl md:text-5xl text-slate-900 tracking-tight leading-tight">
            {kontenData?.judul || formatTitle(kategoriKey)}
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-4 max-w-3xl leading-relaxed font-medium">
            {kontenData?.isi_teks || 'Daftar dokumen publik yang tersedia untuk kategori ini.'}
          </p>

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
        </div>

        {/* Template Tabel Data Akses Layanan (Tanpa data dummy) */}
        {kategoriKey === 'daftar_informasi_publik' && (
          <div className="mb-12">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400">
                <h3 className="font-black text-lg text-slate-900 tracking-wide">DATA AKSES LAYANAN INFORMASI PUBLIK</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#0e4891] text-white">
                      <th className="py-4 px-6 font-bold text-sm w-1/3">Data</th>
                      <th className="py-4 px-4 font-bold text-sm text-center">2022</th>
                      <th className="py-4 px-4 font-bold text-sm text-center">2023</th>
                      <th className="py-4 px-4 font-bold text-sm text-center">2024</th>
                      <th className="py-4 px-4 font-bold text-sm text-center">2025</th>
                      <th className="py-4 px-4 font-bold text-sm text-center">2026</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {/* Data kosong */}
                    <tr>
                      <td colSpan={6} className="py-10 text-center">
                        <p className="text-sm font-medium text-slate-500 italic">Belum ada data yang tersedia saat ini.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bagian Dokumen Lainnya (opsional jika masih ada PDF) */}
        {kategoriKey === 'daftar_informasi_publik' && dokumenList && dokumenList.length > 0 && (
          <div className="mb-6 mt-8">
            <h2 className="text-xl font-bold text-slate-900">Dokumen Lampiran Lainnya</h2>
          </div>
        )}

        {/* Client Component untuk interaktivitas PDF */}
        {(!dokumenList || dokumenList.length > 0) && kategoriKey !== 'daftar_informasi_publik' && (
          <DokumenViewer dokumenList={dokumenList || []} />
        )}
        {dokumenList && dokumenList.length > 0 && kategoriKey === 'daftar_informasi_publik' && (
          <DokumenViewer dokumenList={dokumenList} />
        )}
        
      </main>
    </div>
  )
}
