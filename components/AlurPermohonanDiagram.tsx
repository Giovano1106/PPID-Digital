import Link from 'next/link'
import {
  IdentificationCard,
  MagnifyingGlass,
  Clock,
  CheckCircle,
  Prohibit,
  Scales,
  ArrowRight,
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
        {/* 4 Tahap Terstruktur untuk Landing Page */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Langkah 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between relative group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center font-bold text-xs border border-blue-100">
                  01
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Pengajuan
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 text-[#0e4891] flex items-center justify-center mb-4 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                <IdentificationCard size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Isi Formulir & KTP
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Pemohon mendaftar dan mengisi formulir permohonan daring dengan melampirkan identitas resmi (KTP / Surat Kuasa).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Kanal Layanan</span>
              <span className="font-semibold text-slate-700">Daring & Meja PPID</span>
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between relative group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center font-bold text-xs border border-blue-100">
                  02
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Verifikasi
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 text-[#0e4891] flex items-center justify-center mb-4 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                <MagnifyingGlass size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Pemeriksaan Berkas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Petugas PPID memverifikasi kejelasan rincian informasi publik serta kesesuaian tujuan permohonan.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Keluaran Tahap</span>
              <span className="font-semibold text-slate-700">Tanda Terima Sah</span>
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between relative group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center font-bold text-xs border border-blue-100">
                  03
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Pemrosesan
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 text-[#0e4891] flex items-center justify-center mb-4 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                <Clock size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Telaah & Penyiapan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                PPID berkoordinasi dengan unit kerja teknis Dinas CIKASDA untuk menyiapkan dokumen yang dimohonkan.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Batas Waktu</span>
              <span className="font-semibold text-slate-700">Maks. 10 + 7 Hari</span>
            </div>
          </div>

          {/* Langkah 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between relative group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center font-bold text-xs border border-blue-100">
                  04
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Penyerahan
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-50 text-[#0e4891] flex items-center justify-center mb-4 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                <CheckCircle size={24} weight="bold" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-[#0e4891] transition-colors">
                Pemberian Jawaban
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Surat pemberitahuan dan salinan dokumen resmi diserahkan kepada pemohon secara digital maupun fisik.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>Bentuk Berkas</span>
              <span className="font-semibold text-slate-700">Salinan Dokumen Sah</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        {showCTA && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/permohonan-saya/ajukan"
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-xs text-xs inline-flex items-center gap-2"
            >
              <span>Mulai Ajukan Permohonan</span>
              <ArrowRight weight="bold" size={14} />
            </Link>
            <Link
              href="/informasi/permohonan_informasi"
              className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3 rounded-xl border border-slate-200 transition-all shadow-2xs text-xs"
            >
              Pelajari Alur Lengkap & Regulasi
            </Link>
          </div>
        )}
      </div>
    )
  }

  // MODE FULL (Untuk /informasi/permohonan_informasi)
  return (
    <div className="space-y-10">
      {/* PANDUAN DAN AKSI PENGAJUAN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0e4891] border border-blue-100">
              Dasar Regulasi
            </span>
            <span className="text-xs text-slate-500 font-medium">
              UU No. 14 Tahun 2008 & Perki No. 1 Tahun 2021
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
            Standar Operasional Prosedur Pelayanan Informasi
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Bagan alur resmi proses permohonan informasi publik Dinas CIKASDA Sulteng dari tahap registrasi hingga penyerahan salinan resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/permohonan-saya/ajukan"
            className="bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs text-xs inline-flex items-center gap-2"
          >
            <span>Ajukan Permohonan</span>
            <ArrowRight weight="bold" size={14} />
          </Link>
          <Link
            href="/permohonan-saya"
            className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-all shadow-2xs text-xs"
          >
            Pantau Status
          </Link>
        </div>
      </div>

      {/* SECTION 1: ALUR TAHAPAN PENGAJUAN HINGGA PENELAAHAN (TAHAP 1 - 3) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e4891] font-bold text-xs flex items-center justify-center border border-blue-100">
            A
          </span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Tahapan Penerimaan & Pemrosesan Berkas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* TAHAP 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#0e4891] border border-blue-100">
                  Tahap 01
                </span>
                <span className="text-xs font-semibold text-slate-500">Awal Pengajuan</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0e4891] mb-5 border border-blue-100">
                <IdentificationCard size={28} weight="bold" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Penyampaian Permohonan
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Pemohon menyampaikan permohonan melalui portal daring PPID CIKASDA atau datang langsung ke meja layanan dengan melampirkan identitas diri resmi (KTP perorangan / Akta Pendirian bagi Badan Hukum).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Media: Daring / Luring</span>
              <span className="font-semibold text-slate-700">Identitas Wajib</span>
            </div>
          </div>

          {/* TAHAP 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#0e4891] border border-blue-100">
                  Tahap 02
                </span>
                <span className="text-xs font-semibold text-slate-500">Verifikasi</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0e4891] mb-5 border border-blue-100">
                <MagnifyingGlass size={28} weight="bold" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Pemeriksaan Kelengkapan
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Petugas PPID memeriksa kelengkapan data administratif, kejelasan subjek informasi publik yang dimohonkan, serta tujuan penggunaannya. Bukti tanda terima permohonan diberikan kepada pemohon.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Kriteria: Jelas & Lengkap</span>
              <span className="font-semibold text-slate-700">Tanda Terima Sah</span>
            </div>
          </div>

          {/* TAHAP 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#0e4891] border border-blue-100">
                  Tahap 03
                </span>
                <span className="text-xs font-semibold text-slate-600">SLA 10 Hari Kerja</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#0e4891] mb-5 border border-blue-100">
                <Clock size={28} weight="bold" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Koordinasi & Penelaahan Dokumen
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                PPID berkoordinasi dengan pejabat pengelola arsip di bidang teknis Dinas CIKASDA untuk meneliti ketersediaan dokumen dan status keterbukaannya (apakah terbuka atau masuk kategori dikecualikan).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Batas Waktu: 10 Hari Kerja</span>
              <span className="font-semibold text-slate-700">+7 Hari (Opsi)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PERCABANGAN PENETAPAN KEPUTUSAN (TAHAP 4: DITERIMA VS DITOLAK) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e4891] font-bold text-xs flex items-center justify-center border border-blue-100">
            B
          </span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Tahap 04: Penetapan Keputusan & Pemberian Tanggapan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CABANG DITERIMA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-2xs relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                <CheckCircle size={22} weight="bold" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Keputusan Diterima
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Informasi Publik Terbuka Diberikan
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
              Petugas menerbitkan Surat Pemberitahuan Tertulis. Salinan berkas informasi diberikan kepada pemohon melalui:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0e4891]"></span>
                <span>Tautan berkas digital resmi di portal permohonan pemohon.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0e4891]"></span>
                <span>Salinan fisik langsung di meja layanan PPID Dinas CIKASDA.</span>
              </li>
            </ul>
          </div>

          {/* CABANG DITOLAK / DIKECUALIKAN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-2xs relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                <Prohibit size={22} weight="bold" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Keputusan Ditolak
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Informasi Rahasia / Dikecualikan
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
              Apabila informasi menyangkut rahasia negara/pasal 17 UU KIP, PPID menerbitkan Surat Pemberitahuan Penolakan yang mencantumkan:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0e4891]"></span>
                <span>Pasal dan alasan hukum pengecualian informasi secara tertulis.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0e4891]"></span>
                <span>Panduan hak dan batas waktu pengajuan keberatan kepada Atasan PPID.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 3: MEKANISME KEBERATAN INFORMASI (TAHAP 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase tracking-wider mb-3 border border-slate-200">
              Perlindungan Hak Pemohon
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0e4891] flex items-center justify-center border border-blue-100">
                <Scales size={22} weight="bold" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Tahap 05: Hak Pengajuan Keberatan Informasi
                </h3>
                <span className="text-xs text-slate-500 font-medium">Batas Waktu: 30 Hari Kerja</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed font-normal mb-3">
              Apabila pemohon tidak puas dengan tanggapan tertulis, permohonan ditolak tanpa dasar hukum yang sah, atau tidak ditanggapi dalam kurun waktu 10 hari kerja, pemohon berhak menyampaikan Surat Keberatan kepada <strong>Atasan PPID (Kepala Dinas CIKASDA Provinsi Sulawesi Tengah)</strong>.
            </p>
            <p className="text-xs text-slate-400 italic">
              *Atasan PPID wajib memberikan tanggapan tertulis atas keberatan paling lambat 30 hari kerja sejak keberatan diterima.
            </p>
          </div>

          <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-5 text-center max-w-xs w-full">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Biaya Layanan
            </span>
            <span className="text-2xl font-black text-slate-900 block mb-1">
              GRATIS (Rp 0)
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Pelayanan informasi publik PPID Dinas CIKASDA tidak dipungut biaya retribusi apapun.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
