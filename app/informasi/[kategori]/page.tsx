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
import DaftarInformasiPublikView from '@/components/DaftarInformasiPublikView'
import { getDaftarInformasiTables } from '@/app/actions/daftar-informasi'
import { DaftarInformasiTable } from '@/app/informasi/data/daftarInformasiDefault'

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

  // Ambil data matriks tabel khusus kategori daftar_informasi_publik
  let daftarInformasiTables: DaftarInformasiTable[] = []
  if (kategoriKey === 'daftar_informasi_publik') {
    const res = await getDaftarInformasiTables()
    daftarInformasiTables = res.data || []
  }

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
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-50 text-[#0e4891] rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                    <Target size={26} weight="bold" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 mb-3 inline-block">
                    Arah & Cita-Cita Layanan
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Visi PPID</h3>
                  <blockquote className="border-l-4 border-[#0e4891] pl-4 py-1 italic text-slate-700 text-base leading-relaxed font-medium">
                    “Mewujudkan pengelolaan dan pelayanan informasi publik Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah yang transparan, akuntabel, dan terpercaya.”
                  </blockquote>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                  PPID Dinas CIKASDA Provinsi Sulawesi Tengah
                </div>
              </div>

              {/* Misi */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-50 text-[#0e4891] rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                    <Flag size={26} weight="bold" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 mb-3 inline-block">
                    Agenda Strategis
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Misi PPID</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center shrink-0 border border-blue-100">
                        <CheckCircle size={15} weight="bold" />
                      </div>
                      <span className="text-slate-700 font-medium text-sm leading-relaxed">
                        Menyediakan informasi publik sesuai peraturan perundang-undangan secara akurat dan tepat waktu.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center shrink-0 border border-blue-100">
                        <CheckCircle size={15} weight="bold" />
                      </div>
                      <span className="text-slate-700 font-medium text-sm leading-relaxed">
                        Menyediakan sumber daya manusia dan sarana pengelolaan dan pelayanan informasi yang prima.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center shrink-0 border border-blue-100">
                        <CheckCircle size={15} weight="bold" />
                      </div>
                      <span className="text-slate-700 font-medium text-sm leading-relaxed">
                        Melayani pemohon informasi secara cepat, transparan, dan bertanggung jawab.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                  Amanat UU No. 14 Tahun 2008
                </div>
              </div>
            </div>
          )}

          {/* 2. DAFTAR INFORMASI PUBLIK (Pintasan Kategori) */}
          {kategoriKey === 'daftar_informasi_publik' && (
            <div className="mt-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Pintasan Kategori Berdasarkan Sifat Informasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/setiap-saat" className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#0e4891]/40 p-4 rounded-xl transition-all shadow-2xs group">
                  <h3 className="font-bold text-slate-900 group-hover:text-[#0e4891] mb-1.5 transition-colors text-sm">Setiap Saat</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">Informasi yang siap tersedia setiap saat untuk diberikan kepada pemohon.</p>
                </Link>
                
                <Link href="/serta-merta" className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#0e4891]/40 p-4 rounded-xl transition-all shadow-2xs group">
                  <h3 className="font-bold text-slate-900 group-hover:text-[#0e4891] mb-1.5 transition-colors text-sm">Serta Merta</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">Informasi penting yang dapat mengancam hajat hidup orang banyak.</p>
                </Link>
                
                <Link href="/berkala" className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#0e4891]/40 p-4 rounded-xl transition-all shadow-2xs group">
                  <h3 className="font-bold text-slate-900 group-hover:text-[#0e4891] mb-1.5 transition-colors text-sm">Berkala</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">Informasi publik yang wajib diperbaharui dan disediakan secara rutin.</p>
                </Link>
                
                <Link href="/dikecualikan" className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#0e4891]/40 p-4 rounded-xl transition-all shadow-2xs group">
                  <h3 className="font-bold text-slate-900 group-hover:text-[#0e4891] mb-1.5 transition-colors text-sm">Dikecualikan</h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-normal">Informasi yang bersifat rahasia dan tidak dapat diakses publik (UU KIP).</p>
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
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-50 text-[#0e4891] rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                    <Handshake size={26} weight="bold" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 mb-3 inline-block">
                    Komitmen Layanan Publik
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Maklumat Pelayanan PPID</h3>
                  <blockquote className="border-l-4 border-[#0e4891] pl-4 py-1 italic text-slate-700 text-base leading-relaxed mb-6 font-medium">
                    “Dengan ini kami menyatakan sanggup menyelenggarakan pelayanan informasi publik sesuai standar pelayanan yang telah ditetapkan dan apabila tidak menepati janji, kami siap menerima sanksi sesuai ketentuan peraturan perundang-undangan.”
                  </blockquote>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                  Dinas CIKASDA Provinsi Sulawesi Tengah
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-50 text-[#0e4891] rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                    <Clock size={26} weight="bold" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 mb-3 inline-block">
                    Jam Operasional Kantor
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Waktu Pelayanan PPID</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-700 font-semibold text-sm">Senin – Kamis</span>
                      <span className="text-slate-900 font-bold font-mono text-sm bg-slate-100 px-2.5 py-0.5 rounded">08.00 – 16.00 WITA</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-700 font-semibold text-sm">Jumat</span>
                      <span className="text-slate-900 font-bold font-mono text-sm bg-slate-100 px-2.5 py-0.5 rounded">08.00 – 16.30 WITA</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 font-medium text-xs">Istirahat (Senin – Kamis)</span>
                      <span className="text-slate-500 font-mono text-xs">12.00 – 13.00 WITA</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600 font-medium text-xs">Istirahat (Jumat)</span>
                      <span className="text-slate-500 font-mono text-xs">11.30 – 13.00 WITA</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium italic">
                  *Layanan permohonan daring via portal tetap aktif 24 jam setiap hari.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabel Matriks untuk daftar_informasi_publik */}
        {kategoriKey === 'daftar_informasi_publik' && (
          <DaftarInformasiPublikView tables={daftarInformasiTables} />
        )}

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
