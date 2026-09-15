import Link from 'next/link'
import {
  IdentificationCard,
  MagnifyingGlass,
  Clock,
  CheckCircle,
  Prohibit,
  Scales,
  ArrowRight,
  ArrowDown
} from '@phosphor-icons/react/dist/ssr'

interface AlurPermohonanDiagramProps {
  mode?: 'full' | 'compact'
  showCTA?: boolean
}

export default function AlurPermohonanDiagram({
  mode = 'full',
  showCTA = true,
}: AlurPermohonanDiagramProps) {
  if (mode === 'compact') {
    return (
      <div className="space-y-10">
        {/* 4 Tahap Ringkas untuk Landing Page */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Langkah 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group hover:border-[#0e4891]/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-[#0e4891] flex items-center justify-center font-extrabold text-sm font-mono border border-blue-100">
                  01
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Pengajuan
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50/50 flex items-center justify-center text-[#0e4891] mb-4">
                <IdentificationCard size={24} weight="bold" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Isi Formulir & KTP
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Pemohon mendaftar dan mengisi formulir daring dengan melampirkan identitas resmi (KTP/Surat Kuasa).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500 font-mono">
              Portal Online / Meja PPID
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group hover:border-[#0e4891]/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-extrabold text-sm font-mono border border-amber-100">
                  02
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Verifikasi
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50/50 flex items-center justify-center text-amber-600 mb-4">
                <MagnifyingGlass size={24} weight="bold" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Pemeriksaan Berkas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Petugas PPID memverifikasi kejelasan rincian dokumen yang diminta serta kesesuaian tujuan penggunaan.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-500 font-mono">
              Bukti Registrasi Terbit
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group hover:border-[#0e4891]/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-sm font-mono border border-indigo-100">
                  03
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono">
                  SLA Resmi
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 mb-4">
                <Clock size={24} weight="bold" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Telaah & Pemrosesan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                PPID menelaah dan berkoordinasi dengan bidang teknis Dinas CIKASDA untuk menyiapkan dokumen yang dimohonkan.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-700 font-mono">
              Maks. 10 + 7 Hari Kerja
            </div>
          </div>

          {/* Langkah 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group hover:border-[#0e4891]/30">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-sm font-mono border border-emerald-100">
                  04
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                  Penyerahan
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50/50 flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle size={24} weight="bold" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Pemberian Jawaban
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Surat pemberitahuan dan salinan dokumen resmi diserahkan kepada pemohon secara digital maupun fisik.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 font-mono">
              Salinan Dokumen Sah
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        {showCTA && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/permohonan-saya/ajukan"
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-7 py-3 rounded-xl transition-all shadow-sm text-sm inline-flex items-center gap-2"
            >
              Mulai Ajukan Permohonan <ArrowRight weight="bold" size={14} />
            </Link>
            <Link
              href="/informasi/permohonan_informasi"
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl border border-slate-200 transition-all shadow-xs text-sm"
            >
              Pelajari Alur Lengkap & Keberatan
            </Link>
          </div>
        )}
      </div>
    )
  }

  // MODE FULL (Untuk /informasi/permohonan_informasi)
  return (
    <div className="space-y-12">
      {/* HEADER BANNER KETENTUAN HUKUM */}
      <div className="bg-gradient-to-br from-[#0e4891] to-[#0a366f] rounded-3xl p-8 md:p-10 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            Standar Pelayanan Informasi Publik Resmi
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">
            Bagan Alur Pelayanan Informasi Publik Dinas CIKASDA
          </h2>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-8 font-medium">
            Prosedur operasional baku pengajuan, verifikasi, pemrosesan, hingga penyerahan dokumen informasi publik sesuai amanat UU No. 14 Tahun 2008 dan Peraturan Komisi Informasi No. 1 Tahun 2021.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/permohonan-saya/ajukan"
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-sm text-sm inline-flex items-center gap-2"
            >
              Ajukan Permohonan Sekarang <ArrowRight weight="bold" size={16} />
            </Link>
            <Link
              href="/permohonan-saya"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition-all border border-white/20 text-sm"
            >
              Pantau Status Permohonan
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 1: ALUR TAHAPAN PENGAJUAN HINGGA PENELAAHAN (TAHAP 1 - 3) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg bg-blue-100 text-[#0e4891] font-black text-xs flex items-center justify-center font-mono">
            A
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Tahapan Penerimaan & Pemrosesan Berkas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* TAHAP 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-50 text-[#0e4891] font-mono">
                  Tahap 01
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">Awal Pengajuan</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0e4891] mb-5">
                <IdentificationCard size={28} weight="bold" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">
                Penyampaian Permohonan
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Pemohon menyampaikan permohonan melalui portal daring PPID CIKASDA atau datang langsung ke meja layanan dengan melampirkan identitas diri resmi (KTP perorangan / Akta Pendirian bagi Badan Hukum).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Media: Daring / Luring</span>
              <span className="font-bold text-[#0e4891]">Identitas Wajib</span>
            </div>
          </div>

          {/* TAHAP 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-50 text-amber-700 font-mono">
                  Tahap 02
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">Verifikasi</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-5">
                <MagnifyingGlass size={28} weight="bold" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">
                Pemeriksaan Kelengkapan
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Petugas PPID memeriksa kelengkapan data administratif, kejelasan subjek informasi publik yang dimohonkan, serta tujuan penggunaannya. Bukti tanda terima permohonan diberikan kepada pemohon.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Kriteria: Jelas & Lengkap</span>
              <span className="font-bold text-amber-700">Tanda Terima Sah</span>
            </div>
          </div>

          {/* TAHAP 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-mono">
                  Tahap 03
                </span>
                <span className="text-xs font-bold text-indigo-700 font-mono font-extrabold">SLA 10 Hari Kerja</span>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-5">
                <Clock size={28} weight="bold" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">
                Koordinasi & Penelaahan Dokumen
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                PPID berkoordinasi dengan pejabat pengelola arsip di bidang teknis Dinas CIKASDA untuk meneliti ketersediaan dokumen dan status keterbukaannya (apakah terbuka atau masuk kategori dikecualikan).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Batas Waktu: 10 Hari Kerja</span>
              <span className="font-bold text-indigo-700">+7 Hari (Opsi)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PERCABANGAN PENETAPAN KEPUTUSAN (TAHAP 4: DITERIMA VS DITOLAK) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center font-mono">
            B
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Tahap 04: Penetapan Keputusan & Pemberian Tanggapan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CABANG DITERIMA */}
          <div className="bg-emerald-50/40 rounded-3xl border border-emerald-200 p-7 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle size={24} weight="fill" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                  Keputusan Diterima
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-0.5">
                  Informasi Publik Terbuka Diberikan
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
              Petugas menerbitkan Surat Pemberitahuan Tertulis. Salinan berkas informasi diberikan kepada pemohon melalui:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Tautan berkas digital resmi di portal permohonan pemohon.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Salinan fisik langsung di meja layanan PPID Dinas CIKASDA.</span>
              </li>
            </ul>
          </div>

          {/* CABANG DITOLAK / DIKECUALIKAN */}
          <div className="bg-rose-50/40 rounded-3xl border border-rose-200 p-7 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Prohibit size={24} weight="bold" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded">
                  Keputusan Ditolak
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-0.5">
                  Informasi Rahasia / Dikecualikan
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
              Apabila informasi menyangkut rahasia negara/pasal 17 UU KIP, PPID menerbitkan Surat Pemberitahuan Penolakan yang mencantumkan:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Pasal dan alasan hukum pengecualian informasi secara tertulis.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Panduan hak dan batas waktu pengajuan keberatan kepada Atasan PPID.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 3: MEKANISME KEBERATAN INFORMASI (TAHAP 5) */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-9 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
              Perlindungan Hak Pemohon
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center border border-white/10">
                <Scales size={28} weight="bold" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Tahap 05: Hak Pengajuan Keberatan Informasi
                </h3>
                <span className="text-xs text-slate-400 font-mono">Batas Waktu: 30 Hari Kerja</span>
              </div>
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium mb-4">
              Apabila pemohon tidak puas dengan tanggapan tertulis, permohonan ditolak tanpa dasar hukum yang sah, atau tidak ditanggapi dalam kurun waktu 10 hari kerja, pemohon berhak menyampaikan Surat Keberatan kepada <strong>Atasan PPID (Kepala Dinas CIKASDA Provinsi Sulawesi Tengah)</strong>.
            </p>
            <p className="text-xs text-slate-400 italic">
              *Atasan PPID wajib memberikan tanggapan tertulis atas keberatan paling lambat 30 hari kerja sejak keberatan diterima.
            </p>
          </div>

          <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 text-center max-w-xs w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
              Biaya Layanan
            </span>
            <span className="text-2xl font-black text-amber-400 block mb-2">
              GRATIS (Rp 0)
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Pelayanan informasi publik PPID Dinas CIKASDA tidak dipungut biaya retribusi apapun.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
