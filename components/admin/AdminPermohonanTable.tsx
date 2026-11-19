'use client'

import {
  CaretUp,
  CaretDown,
  ChatTeardropText,
  XCircle,
  Clock,
  CheckCircle,
  PencilSimple,
  WarningCircle,
} from '@phosphor-icons/react'

export interface PermohonanProfile {
  nama: string
  nik: string | null
  email: string | null
  telepon: string | null
}

export interface Permohonan {
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
  updated_at?: string | null
  profiles?: PermohonanProfile | null
}

interface AdminPermohonanTableProps {
  paginatedList: Permohonan[]
  expandedIds: Record<number, boolean>
  toggleExpand: (id: number) => void
  updatingId: number | null
  openProcessModal: (item: Permohonan) => void
  openJawabModal: (item: Permohonan) => void
  openTolakModal: (item: Permohonan) => void
  openPerpanjangModal: (item: Permohonan) => void
}

function getTodayWitaYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function extractDeadlineYmd(deadlineStr: string | null): string | null {
  if (!deadlineStr) return null
  const match = deadlineStr.trim().match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]
  const parsed = new Date(deadlineStr)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed)
}

function formatDeadlineIndo(deadlineStr: string | null): string {
  if (!deadlineStr) return '-'
  const ymd = extractDeadlineYmd(deadlineStr)
  if (!ymd) return deadlineStr
  const parts = ymd.split('-').map(Number)
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  return deadlineStr
}

function formatJawabanAdminDisplay(
  status: Permohonan['status'],
  jawabanAdmin: string
): { label: string; text: string; isRejection: boolean } {
  if (status === 'ditolak') {
    const cleaned = jawabanAdmin.replace(/^\[DITOLAK\]\s*Alasan:\s*/i, '').trim()
    return {
      label: 'Alasan Penolakan Resmi:',
      text: cleaned || jawabanAdmin,
      isRejection: true,
    }
  }

  return {
    label: 'Jawaban / Tanggapan Resmi Saat Ini:',
    text: jawabanAdmin,
    isRejection: false,
  }
}

export default function AdminPermohonanTable({
  paginatedList,
  expandedIds,
  toggleExpand,
  updatingId,
  openProcessModal,
  openJawabModal,
  openTolakModal,
  openPerpanjangModal,
}: AdminPermohonanTableProps) {
  const todayWitaYmd = getTodayWitaYmd()

  const getStatusBadge = (status: Permohonan['status']) => {
    switch (status) {
      case 'diajukan':
        return 'bg-blue-50 text-[#0e4891] border-blue-200'
      case 'diproses':
        return 'bg-slate-100 text-slate-800 border-slate-300'
      case 'dijawab':
        return 'bg-[#0e4891] text-white border-[#0e4891]'
      case 'ditolak':
        return 'bg-rose-50 text-rose-800 border-rose-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-4">
      {paginatedList.map((item) => {
        const isExpanded = expandedIds[item.id] || false
        const isLongDeskripsi = item.deskripsi.length > 150
        const applicantName = item.profiles?.nama || 'Pemohon'
        const targetDeadline = item.deadline_akhir || item.deadline_awal
        const deadlineYmd = extractDeadlineYmd(targetDeadline)
        const isOverdue =
          item.status !== 'dijawab' &&
          item.status !== 'ditolak' &&
          deadlineYmd !== null &&
          deadlineYmd < todayWitaYmd

        const responseDisplay = item.jawaban_admin
          ? formatJawabanAdminDisplay(item.status, item.jawaban_admin)
          : null

        return (
          <article
            key={item.id}
            className={`rounded-xl bg-white p-5 sm:p-6 transition-colors ${
              isOverdue
                ? 'border-y border-r border-slate-200 border-l-[3px] border-l-rose-600'
                : 'border border-slate-200'
            }`}
          >
            {/* HEADER KARTU */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-[#0e4891] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md tabular-nums">
                    #{item.id}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 break-words">
                    {applicantName}
                  </h2>
                  {item.profiles?.nik && (
                    <span className="text-[11px] font-bold font-mono bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 text-slate-700 tabular-nums">
                      NIK: {item.profiles.nik}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                  <span className="min-w-0 break-all">
                    Email:{' '}
                    <span className="text-slate-900 font-semibold">
                      {item.profiles?.email || '-'}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300 hidden sm:inline">
                    /
                  </span>
                  <span className="tabular-nums">
                    WA:{' '}
                    <span className="text-slate-900 font-semibold">
                      {item.profiles?.telepon || '-'}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300 hidden sm:inline">
                    /
                  </span>
                  <span className="tabular-nums">
                    Diajukan:{' '}
                    <span className="text-slate-900 font-semibold">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                </div>
              </div>

              {/* BADGE STATUS & SLA */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-800">
                      <WarningCircle weight="fill" size={13} aria-hidden="true" />
                      Melewati SLA
                    </span>
                  )}
                  <span
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <span className="text-xs text-slate-500 font-medium tabular-nums">
                  Deadline SLA:{' '}
                  <span
                    className={`font-bold ${
                      isOverdue ? 'text-rose-700' : 'text-slate-900'
                    }`}
                  >
                    {formatDeadlineIndo(targetDeadline)}
                  </span>
                </span>
              </div>
            </div>

            {/* DETAIL PERMOHONAN */}
            <div className="mt-4 text-xs space-y-2.5">
              <div className="min-w-0">
                <span className="inline-block bg-slate-100 text-slate-800 border border-slate-200 font-bold text-[11px] px-2.5 py-0.5 rounded-md mb-2">
                  {item.jenis_informasi}
                </span>
                <p className="font-bold text-slate-900">Deskripsi / Rincian Kebutuhan:</p>
                <p className="text-slate-700 whitespace-pre-line break-words leading-relaxed font-medium mt-1">
                  {isLongDeskripsi && !isExpanded
                    ? `${item.deskripsi.slice(0, 150)}...`
                    : item.deskripsi}
                </p>
                {isLongDeskripsi && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded
                        ? `Sembunyikan rincian permohonan #${item.id}`
                        : `Lihat selengkapnya rincian permohonan #${item.id}`
                    }
                    className="text-[#0e4891] font-bold text-xs hover:underline mt-1.5 min-h-[38px] px-1 -ml-1 rounded-lg cursor-pointer inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
                  >
                    {isExpanded ? (
                      <>
                        <CaretUp weight="bold" aria-hidden="true" /> Sembunyikan
                      </>
                    ) : (
                      <>
                        <CaretDown weight="bold" aria-hidden="true" /> Lihat Selengkapnya
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium pt-1">
                Bentuk Salinan / Cara Memperoleh:{' '}
                <span className="text-slate-900 font-bold">{item.cara_memperoleh}</span>
              </p>
            </div>

            {/* JAWABAN ADMIN / ALASAN PENOLAKAN */}
            {responseDisplay && (
              <div
                className={`mt-4 rounded-xl border p-4 text-xs min-w-0 ${
                  responseDisplay.isRejection
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <p
                  className={`font-bold mb-1 ${
                    responseDisplay.isRejection ? 'text-rose-900' : 'text-slate-900'
                  }`}
                >
                  {responseDisplay.label}
                </p>
                <p
                  className={`whitespace-pre-line [overflow-wrap:anywhere] font-medium leading-relaxed ${
                    responseDisplay.isRejection ? 'text-rose-900' : 'text-slate-800'
                  }`}
                >
                  {responseDisplay.text}
                </p>
              </div>
            )}

            {/* ALASAN PERPANJANGAN (JIKA ADA) */}
            {item.diperpanjang && item.alasan_perpanjangan && (
              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 font-medium">
                <strong className="font-bold text-slate-900">Status Perpanjangan SLA:</strong>{' '}
                Diperpanjang +7 hari kerja WITA ({item.alasan_perpanjangan})
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="flex flex-wrap gap-2">
                {!item.diperpanjang && item.status !== 'dijawab' && item.status !== 'ditolak' && (
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => openPerpanjangModal(item)}
                    aria-label={`Perpanjang batas waktu SLA permohonan #${item.id} dari ${applicantName}`}
                    className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
                  >
                    <Clock weight="bold" size={15} aria-hidden="true" /> Perpanjang SLA (+7 Hari)
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.status === 'diajukan' && (
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => openProcessModal(item)}
                    aria-label={`Proses permohonan #${item.id} dari ${applicantName}`}
                    className="min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    <CheckCircle weight="bold" size={15} aria-hidden="true" /> Proses Permohonan
                  </button>
                )}

                {item.status !== 'dijawab' && item.status !== 'ditolak' && (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => openJawabModal(item)}
                      aria-label={`Jawab permohonan #${item.id} dari ${applicantName}`}
                      className="min-h-[38px] rounded-lg bg-[#0e4891] hover:bg-[#0a366f] px-4 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
                    >
                      <ChatTeardropText weight="fill" size={15} aria-hidden="true" /> Jawab Permohonan
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => openTolakModal(item)}
                      aria-label={`Tolak permohonan #${item.id} dari ${applicantName}`}
                      className="min-h-[38px] rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
                    >
                      <XCircle weight="fill" size={15} aria-hidden="true" /> Tolak
                    </button>
                  </>
                )}

                {item.status === 'dijawab' && (
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => openJawabModal(item)}
                    aria-label={`Edit jawaban permohonan #${item.id} dari ${applicantName}`}
                    className="min-h-[38px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
                  >
                    <PencilSimple weight="bold" size={15} aria-hidden="true" /> Edit Jawaban
                  </button>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
