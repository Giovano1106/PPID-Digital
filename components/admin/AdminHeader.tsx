'use client'

import {
  Printer,
  ArrowsClockwise,
  MagnifyingGlass,
  X,
  ArrowRight,
  WarningCircle,
} from '@phosphor-icons/react'

interface AdminHeaderProps {
  totalCount: number
  countDiajukan: number
  countDiproses: number
  countDijawab: number
  countDitolak: number
  countOverdue: number
  countMenunggu: number
  countSelesai: number
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterStatus: 'menunggu' | 'selesai' | 'semua'
  setFilterStatus: (status: 'menunggu' | 'selesai' | 'semua') => void
  setCurrentPage: (p: number) => void
  setShowLaporanModal: (v: boolean) => void
  fetchPermohonan: () => void
  isRefreshing?: boolean
}

export default function AdminHeader({
  totalCount,
  countDiajukan,
  countDiproses,
  countDijawab,
  countDitolak,
  countOverdue,
  countMenunggu,
  countSelesai,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  setCurrentPage,
  setShowLaporanModal,
  fetchPermohonan,
  isRefreshing = false,
}: AdminHeaderProps) {
  return (
    <>
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kelola Permohonan Informasi
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Tinjau permohonan masuk, berikan jawaban resmi, dan pantau batas waktu SLA.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowLaporanModal(true)}
            className="min-h-[44px] whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            title="Buka pratinjau laporan PDF dan Excel"
          >
            <Printer weight="bold" size={16} aria-hidden="true" />
            <span>Cetak / Laporan Excel</span>
          </button>
          <button
            type="button"
            onClick={fetchPermohonan}
            disabled={isRefreshing}
            aria-label="Segarkan daftar permohonan"
            className="min-h-[44px] whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            <ArrowsClockwise
              weight="bold"
              size={16}
              className={isRefreshing ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* OPERATIONAL SLA LEDGER STRIP */}
      <section
        aria-label="Ringkasan status SLA permohonan"
        className="mb-6 rounded-xl border border-slate-200 bg-white grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden"
      >
        {/* Focal Primary Cell: Perlu Diproses (diajukan) */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus('menunggu')
            setCurrentPage(1)
          }}
          aria-label={`Filter permohonan menunggu tindakan, ${countDiajukan} perlu diproses`}
          className={`md:col-span-5 p-5 text-left transition-colors cursor-pointer flex flex-col justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0e4891] ${
            countDiajukan > 0
              ? 'bg-blue-50/40 hover:bg-blue-50/70'
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0e4891]">
              {countDiajukan > 0 && (
                <span
                  className="w-2 h-2 rounded-full bg-[#0e4891] shrink-0"
                  aria-hidden="true"
                />
              )}
              Perlu Diproses (Diajukan)
            </span>
            {countOverdue > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-800 tabular-nums">
                <WarningCircle weight="fill" size={12} aria-hidden="true" />
                {countOverdue} Melewati SLA
              </span>
            ) : countDiajukan > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-2 py-0.5 text-[11px] font-bold text-[#0e4891]">
                Perlu Verifikasi
                <ArrowRight weight="bold" size={11} aria-hidden="true" />
              </span>
            ) : (
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                Terkendali
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums ${
                  countDiajukan > 0 ? 'text-[#0e4891]' : 'text-slate-900'
                }`}
              >
                {countDiajukan}
              </p>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {countDiajukan > 0
                  ? 'Permohonan baru menunggu verifikasi awal admin'
                  : 'Tidak ada permohonan baru yang belum diverifikasi'}
              </p>
            </div>
          </div>
        </button>

        {/* Compact Secondary Ledger Cells */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-5 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Sedang Diproses
            </span>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                {countDiproses}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Dalam kajian bidang
              </p>
            </div>
          </div>

          <div className="p-5 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Dijawab / Ditolak
            </span>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                {countSelesai}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1 tabular-nums">
                {countDijawab} dijawab - {countDitolak} ditolak
              </p>
            </div>
          </div>

          <div className="p-5 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Total Permohonan
            </span>
            <div className="mt-3">
              <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                {totalCount}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Seluruh berkas masuk
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BAR & FILTER TABS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 space-y-4">
        {/* Input Search */}
        <div className="relative">
          <span
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600"
            aria-hidden="true"
          >
            <MagnifyingGlass weight="bold" size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            aria-label="Cari permohonan berdasarkan nama pemohon, NIK, jenis informasi, atau deskripsi"
            placeholder="Cari berdasarkan nama pemohon, NIK, jenis informasi, atau deskripsi..."
            className="w-full min-h-[44px] pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-600 focus:outline-none focus:border-[#0e4891] focus:bg-white focus:ring-2 focus:ring-[#0e4891]/20 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setCurrentPage(1)
              }}
              aria-label="Hapus kata kunci pencarian"
              className="absolute inset-y-0 right-1.5 my-auto w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891]"
            >
              <X weight="bold" size={14} />
            </button>
          )}
        </div>

        {/* Tabs Filter dengan Counter Badge */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1" role="tablist" aria-label="Filter status permohonan">
          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'menunggu'}
            onClick={() => {
              setFilterStatus('menunggu')
              setCurrentPage(1)
            }}
            className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2 ${
              filterStatus === 'menunggu'
                ? 'bg-[#0e4891] text-white'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Menunggu Tindakan</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                filterStatus === 'menunggu'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {countMenunggu}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'selesai'}
            onClick={() => {
              setFilterStatus('selesai')
              setCurrentPage(1)
            }}
            className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2 ${
              filterStatus === 'selesai'
                ? 'bg-[#0e4891] text-white'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Selesai (Dijawab / Ditolak)</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                filterStatus === 'selesai'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {countSelesai}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterStatus === 'semua'}
            onClick={() => {
              setFilterStatus('semua')
              setCurrentPage(1)
            }}
            className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2 ${
              filterStatus === 'semua'
                ? 'bg-[#0e4891] text-white'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Semua Permohonan</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${
                filterStatus === 'semua'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {totalCount}
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
