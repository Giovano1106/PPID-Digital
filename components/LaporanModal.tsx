'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FileText, MicrosoftExcelLogo, Printer, X, Calendar, SpinnerGap } from '@phosphor-icons/react'
import { getAllPermohonanForReport } from '@/app/actions/admin'

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

export default function LaporanModal({
  isOpen,
  onClose,
}: LaporanModalProps) {
  const [data, setData] = useState<Permohonan[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      getAllPermohonanForReport().then((res) => {
        if (res.success) {
          setData(res.data)
        }
        setLoading(false)
      })
    }
  }, [isOpen])

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const todayDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Calculations for summary stats
  const totalCount = data.length
  const diajukanCount = data.filter((p) => p.status === 'diajukan').length
  const diprosesCount = data.filter((p) => p.status === 'diproses').length
  const dijawabCount = data.filter((p) => p.status === 'dijawab').length
  const ditolakCount = data.filter((p) => p.status === 'ditolak').length

  // Handle Print via Window
  const handlePrint = () => {
    window.print()
  }

  // Handle Formatted Excel Download (.xls HTML table)
  const handleDownloadExcel = () => {
    const tableRows = data
      .map(
        (item, index) => `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
          <td><b>${item.profiles?.nama || 'Pemohon'}</b></td>
          <td>${item.profiles?.nik || '-'}</td>
          <td>${item.profiles?.email || '-'} / ${item.profiles?.telepon || '-'}</td>
          <td>${item.jenis_informasi}</td>
          <td>${item.deskripsi.replace(/\n/g, '<br/>')}</td>
          <td>${item.cara_memperoleh}</td>
          <td style="text-align: center; font-weight: bold;">${item.status.toUpperCase()}</td>
          <td style="text-align: center;">${item.deadline_akhir || item.deadline_awal || '-'}</td>
        </tr>
      `
      )
      .join('')

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Laporan Permohonan</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; font-size: 11px; }
          .title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 4px; }
          .subtitle { font-size: 12px; font-weight: bold; text-align: center; color: #0e4891; margin-bottom: 12px; }
          .meta { font-size: 10px; color: #555555; margin-bottom: 16px; }
          .stat-table { border-collapse: collapse; margin-bottom: 16px; }
          .stat-table td { padding: 6px 12px; border: 1px solid #0e4891; font-weight: bold; background-color: #f0f4f8; }
          .data-table { border-collapse: collapse; width: 100%; }
          .data-table th { background-color: #0e4891; color: #ffffff; font-weight: bold; border: 1px solid #000000; padding: 8px; text-align: center; }
          .data-table td { border: 1px solid #cccccc; padding: 6px; vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="title">LAPORAN REKAPITULASI PERMOHONAN INFORMASI PUBLIK</div>
        <div class="subtitle">PPID DIGITAL — DINAS CIPTA KARYA DAN SUMBER DAYA AIR PROV. SULTENG</div>
        <div class="meta">Tanggal Cetak: ${todayDateStr}</div>

        <table class="stat-table">
          <tr>
            <td>Total Permohonan: ${totalCount}</td>
            <td>Perlu Diproses: ${diajukanCount}</td>
            <td>Sedang Diproses: ${diprosesCount}</td>
            <td>Dijawab: ${dijawabCount}</td>
            <td>Ditolak: ${ditolakCount}</td>
          </tr>
        </table>

        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Nama Pemohon</th>
              <th>NIK</th>
              <th>Kontak</th>
              <th>Jenis Informasi</th>
              <th>Rincian Kebutuhan</th>
              <th>Bentuk Salinan</th>
              <th>Status</th>
              <th>Deadline SLA</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `

    const blob = new Blob(['\uFEFF' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_PPID_Digital_${new Date().toISOString().split('T')[0]}.xls`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return createPortal(
    <div className="print-only-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-transparent print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* MODAL HEADER (HIDDEN ON PRINT) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <FileText weight="fill" size={20} className="text-[#0e4891]" />
              Pratinjau Laporan Permohonan
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Data Seluruh Riwayat Permohonan PPID
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadExcel}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <MicrosoftExcelLogo weight="fill" size={16} /> Download Excel (.xls)
            </button>
            <button
              onClick={handlePrint}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Printer weight="fill" size={16} /> Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors ml-2 cursor-pointer flex items-center justify-center"
            >
              <X weight="bold" size={16} />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT AREA */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible font-plus-jakarta">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 text-slate-400 print:hidden">
               <SpinnerGap weight="bold" size={48} className="animate-spin text-[#0e4891] mb-4" />
               <p className="font-bold">Mengambil seluruh data permohonan...</p>
             </div>
          ) : (
            <>
              {/* STYLE UNTUK PRINT */}
              <style dangerouslySetInnerHTML={{__html: `
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
              `}} />

              {/* JUDUL LAPORAN */}
              <div className="border-b border-slate-200 pb-4 text-center">
                <h1 className="font-black text-xl text-slate-900 uppercase tracking-tight">
                  Laporan Rekapitulasi Permohonan Informasi Publik
                </h1>
                <p className="text-xs font-bold text-[#0e4891] mt-0.5">
                  PPID Digital — Dinas Cipta Karya dan Sumber Daya Air Provinsi Sulawesi Tengah
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar weight="fill" size={14} className="text-slate-400" />
                    <strong>Tanggal Cetak:</strong> {todayDateStr}
                  </span>
                </div>
              </div>

              {/* RINGKASAN STATISTIK */}
              <div className="grid grid-cols-5 gap-3 print:grid-cols-5">
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Total Data</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">{totalCount}</span>
                </div>
                <div className="bg-blue-50 p-2 rounded border border-blue-200 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#0e4891] block">Perlu Diproses</span>
                  <span className="text-base font-black text-[#0e4891] mt-0.5 block">{diajukanCount}</span>
                </div>
                <div className="bg-slate-100 p-2 rounded border border-slate-300 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 block">Sedang Diproses</span>
                  <span className="text-base font-black text-slate-800 mt-0.5 block">{diprosesCount}</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded border border-emerald-200 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 block">Dijawab</span>
                  <span className="text-base font-black text-emerald-700 mt-0.5 block">{dijawabCount}</span>
                </div>
                <div className="bg-rose-50 p-2 rounded border border-rose-200 text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-800 block">Ditolak</span>
                  <span className="text-base font-black text-rose-700 mt-0.5 block">{ditolakCount}</span>
                </div>
              </div>

              {/* TABEL DATA PERMOHONAN */}
              <div className="border border-slate-300 rounded-none print:border-slate-800">
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
                        <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                          Tidak ada data permohonan.
                        </td>
                      </tr>
                    ) : (
                      data.map((item, idx) => (
                        <tr key={item.id} className={`print-break-inside-avoid ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="p-2 text-center border border-slate-300 print:border-slate-800 font-bold">{idx + 1}</td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 whitespace-nowrap">
                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800">
                            <strong className="block">{item.profiles?.nama || 'Pemohon'}</strong>
                            <span className="text-[9px] font-mono text-slate-500 print:text-black">NIK: {item.profiles?.nik || '-'}</span>
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 leading-tight">
                            <div className="truncate" title={item.profiles?.email || '-'}>{item.profiles?.email || '-'}</div>
                            <div>{item.profiles?.telepon || '-'}</div>
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 font-semibold">{item.jenis_informasi}</td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 leading-relaxed max-w-xs whitespace-pre-line">
                            {item.deskripsi}
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 text-center">
                            <span
                              className={`inline-block px-1.5 py-0.5 uppercase rounded ${
                                item.status === 'dijawab'
                                  ? 'bg-emerald-50 text-emerald-800 print:bg-transparent print:text-black'
                                  : item.status === 'ditolak'
                                  ? 'bg-rose-50 text-rose-800 print:bg-transparent print:text-black'
                                  : item.status === 'diproses'
                                  ? 'bg-amber-50 text-amber-800 print:bg-transparent print:text-black'
                                  : 'bg-blue-50 text-[#0e4891] print:bg-transparent print:text-black'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 print:border-slate-800 text-center font-mono">
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
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
