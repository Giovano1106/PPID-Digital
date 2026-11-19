'use client'

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import {
  FileText,
  MicrosoftExcelLogo,
  Printer,
  X,
  Calendar,
  SpinnerGap,
  WarningCircle,
  ArrowClockwise,
} from '@phosphor-icons/react'
import { getAllPermohonanForReport } from '@/app/actions/admin'

const subscribeNoop = () => () => {}

function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
}

type Profile = {
  nama: string
  nik: string | null
  email: string | null
  telepon: string | null
}

type Permohonan = {
  id: number
  user_id: string
  jenis_informasi: string
  deskripsi: string
  cara_memperoleh: string
  status: 'diajukan' | 'diproses' | 'dijawab' | 'ditolak'
  jawaban_admin: string | null
  deadline_awal: string | null
  diperpanjang: boolean
  alasan_perpanjangan: string | null
  deadline_akhir: string | null
  created_at: string
  profiles?: Profile | null
}

interface LaporanModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LaporanModal({ isOpen, onClose }: LaporanModalProps) {
  const mounted = useIsClient()
  const [data, setData] = useState<Permohonan[]>([])
  const [loading, setLoading] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadReport = useCallback(async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await getAllPermohonanForReport()
      if (res.success) {
        setData(res.data as Permohonan[])
      } else {
        setErrorMsg(res.error || 'Gagal memuat laporan permohonan.')
      }
    } catch {
      setErrorMsg('Terjadi gangguan koneksi saat mengambil laporan.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    let active = true

    Promise.resolve().then(async () => {
      if (!active) return
      await loadReport()
    })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      active = false
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, loadReport, onClose])

  if (!isOpen || !mounted) return null

  const todayDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const totalCount = data.length
  const diajukanCount = data.filter((p) => p.status === 'diajukan').length
  const diprosesCount = data.filter((p) => p.status === 'diproses').length
  const dijawabCount = data.filter((p) => p.status === 'dijawab').length
  const ditolakCount = data.filter((p) => p.status === 'ditolak').length

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadExcel = async () => {
    if (exportingExcel || data.length === 0) return
    setExportingExcel(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/admin/export-permohonan')
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(
          payload.error || 'Gagal mengunduh laporan Excel permohonan.'
        )
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const witaDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Makassar',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Laporan_Permohonan_PPID_${witaDate}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Terjadi gangguan saat mengunduh laporan Excel.'
      )
    } finally {
      setExportingExcel(false)
    }
  }

  return createPortal(
    <div
      className="print-only-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-transparent print:static"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau Laporan Permohonan"
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER (HIDDEN ON PRINT) */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 print:hidden shrink-0">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileText weight="fill" size={20} className="text-[#0e4891]" aria-hidden="true" />
              Pratinjau Laporan Permohonan
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Data seluruh riwayat permohonan PPID
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void handleDownloadExcel()
              }}
              disabled={loading || exportingExcel || !!errorMsg || data.length === 0}
              className="whitespace-nowrap px-3.5 py-2 min-h-[40px] rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {exportingExcel ? (
                <SpinnerGap weight="bold" size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <MicrosoftExcelLogo weight="fill" size={16} aria-hidden="true" />
              )}
              <span>{exportingExcel ? 'Menyiapkan Excel...' : 'Download Excel (.xlsx)'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !!errorMsg}
              className="px-3.5 py-2 min-h-[40px] rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              <Printer weight="fill" size={16} aria-hidden="true" /> Cetak / Simpan PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup pratinjau laporan"
              className="w-9 h-9 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              <X weight="bold" size={16} />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT AREA */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible font-plus-jakarta">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 print:hidden">
              <SpinnerGap weight="bold" size={40} className="animate-spin text-[#0e4891] mb-3" />
              <p className="font-bold text-sm">Mengambil seluruh data permohonan...</p>
            </div>
          ) : errorMsg ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3 print:hidden">
              <WarningCircle weight="fill" size={32} className="text-rose-600 mx-auto" />
              <p className="text-sm font-bold text-rose-900">{errorMsg}</p>
              <button
                type="button"
                onClick={loadReport}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white px-4 py-2 min-h-[40px] text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
              >
                <ArrowClockwise weight="bold" size={14} /> Coba Lagi
              </button>
            </div>
          ) : (
            <>
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                @media print {
                  @page {
                    size: A4 landscape;
                    margin: 1.5cm;
                  }
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  body > *:not(.print-only-modal) {
                    display: none !important;
                  }
                  .print-only-modal {
                    display: block !important;
                    position: relative !important;
                    width: 100% !important;
                    height: auto !important;
                  }
                  .print-table th, .print-table td {
                    font-size: 10px !important;
                    padding: 4px 6px !important;
                  }
                  .print-break-inside-avoid {
                    break-inside: avoid;
                  }
                }
              `,
                }}
              />

              {/* JUDUL LAPORAN */}
              <div className="border-b border-slate-200 pb-4 text-center">
                <h1 className="font-black text-xl text-slate-900 uppercase tracking-tight">
                  Laporan Rekapitulasi Permohonan Informasi Publik
                </h1>
                <p className="text-xs font-bold text-[#0e4891] mt-0.5">
                  PPID Digital | Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar weight="fill" size={14} className="text-slate-500" aria-hidden="true" />
                    <strong>Tanggal Cetak:</strong> {todayDateStr}
                  </span>
                </div>
              </div>

              {/* RINGKASAN STATISTIK */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 print:grid-cols-5">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Total Data
                  </span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block tabular-nums">
                    {totalCount}
                  </span>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e4891] block">
                    Perlu Diproses
                  </span>
                  <span className="text-base font-black text-[#0e4891] mt-0.5 block tabular-nums">
                    {diajukanCount}
                  </span>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-300 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Sedang Diproses
                  </span>
                  <span className="text-base font-black text-slate-800 mt-0.5 block tabular-nums">
                    {diprosesCount}
                  </span>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Dijawab
                  </span>
                  <span className="text-base font-black text-emerald-700 mt-0.5 block tabular-nums">
                    {dijawabCount}
                  </span>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                    Ditolak
                  </span>
                  <span className="text-base font-black text-rose-700 mt-0.5 block tabular-nums">
                    {ditolakCount}
                  </span>
                </div>
              </div>

              {/* TABEL DATA PERMOHONAN */}
              <div className="border border-slate-300 rounded-none overflow-x-auto print:border-slate-800 print:overflow-visible">
                <table className="w-full text-left print-table border-collapse">
                  <thead>
                    <tr className="bg-[#0e4891] text-white font-bold uppercase tracking-wider print:bg-slate-100 print:text-black print:border-b-2 print:border-black">
                      <th className="p-2 border border-[#0a366f] print:border-slate-800 text-center w-8">No</th>
                      <th className="p-2 border border-[#0a366f] print:border-slate-800 w-16">Tanggal</th>
                      <th className="p-2 border border-[#0a366f] print:border-slate-800 w-32">Pemohon & NIK</th>
                      <th className="p-2 border border-[#0a366f] print:border-slate-800 w-28">Kontak</th>
                      <th className="p-2 border border-[#0a366f] print:border-slate-800 w-28">Jenis Informasi</th>
                      <th className="p-2 border border-[#0a366f] print:border-slate-800">Deskripsi</th>
                      <th className="p-2 border border-[#0a366f] print:border-slate-800 w-16 text-center">Status</th>
                      <th className="p-2 border border-[#0a366f] print:border-slate-800 w-20 text-center">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-600 italic">
                          Tidak ada data permohonan.
                        </td>
                      </tr>
                    ) : (
                      data.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={`print-break-inside-avoid ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                        >
                          <td className="p-2 text-center border border-slate-300 print:border-slate-800 font-bold tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 whitespace-nowrap tabular-nums">
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800">
                            <strong className="block">{item.profiles?.nama || 'Pemohon'}</strong>
                            <span className="text-[10px] font-mono text-slate-600 print:text-black">
                              NIK: {item.profiles?.nik || '-'}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 leading-tight">
                            <div className="truncate" title={item.profiles?.email || '-'}>
                              {item.profiles?.email || '-'}
                            </div>
                            <div>{item.profiles?.telepon || '-'}</div>
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 font-semibold">
                            {item.jenis_informasi}
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 leading-relaxed max-w-xs whitespace-pre-line">
                            {item.deskripsi}
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 text-center">
                            <span
                              className={`inline-block px-1.5 py-0.5 uppercase rounded-md text-[10px] font-bold ${
                                item.status === 'dijawab'
                                  ? 'bg-[#0e4891] text-white print:bg-transparent print:text-black'
                                  : item.status === 'ditolak'
                                  ? 'bg-rose-50 text-rose-800 print:bg-transparent print:text-black'
                                  : item.status === 'diproses'
                                  ? 'bg-slate-100 text-slate-800 print:bg-transparent print:text-black'
                                  : 'bg-blue-50 text-[#0e4891] print:bg-transparent print:text-black'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 text-center font-mono tabular-nums">
                            {item.deadline_akhir || item.deadline_awal || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* FOOTER MODAL (HIDDEN ON PRINT) */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end print:hidden shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 min-h-[40px] rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
