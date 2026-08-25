import { Printer, ArrowsClockwise, MagnifyingGlass, X } from '@phosphor-icons/react'

interface AdminHeaderProps {
  totalCount: number
  countMenunggu: number
  countSelesai: number
  searchQuery: string
  setSearchQuery: (q: string) => void
  filterStatus: 'menunggu' | 'selesai' | 'semua'
  setFilterStatus: (status: 'menunggu' | 'selesai' | 'semua') => void
  setCurrentPage: (p: number) => void
  setShowLaporanModal: (v: boolean) => void
  fetchPermohonan: () => void
}

export default function AdminHeader({
  totalCount,
  countMenunggu,
  countSelesai,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  setCurrentPage,
  setShowLaporanModal,
  fetchPermohonan,
}: AdminHeaderProps) {
  return (
    <>
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-black text-2xl md:text-3xl tracking-tight text-slate-900">Kelola Permohonan Informasi</h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Tinjau permohonan masuk, berikan jawaban resmi, dan kelola batas waktu SLA.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowLaporanModal(true)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            title="Buka pratinjau laporan PDF / Excel"
          >
            <Printer weight="bold" size={16} /> Cetak Laporan
          </button>
          <button
            onClick={fetchPermohonan}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <ArrowsClockwise weight="bold" size={16} /> Refresh Data
          </button>
        </div>
      </div>

      {/* SEARCH BAR & FILTER TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs space-y-4">
        {/* Input Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlass weight="bold" size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Cari berdasarkan nama pemohon, NIK, jenis informasi, atau deskripsi..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0e4891] focus:bg-white focus:ring-2 focus:ring-[#0e4891]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X weight="bold" size={14} />
            </button>
          )}
        </div>

        {/* Tabs Filter dengan Counter Badge */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <button
            onClick={() => { setFilterStatus('menunggu'); setCurrentPage(1); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              filterStatus === 'menunggu'
                ? 'bg-[#0e4891] text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Menunggu Tindakan</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filterStatus === 'menunggu' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {countMenunggu}
            </span>
          </button>

          <button
            onClick={() => { setFilterStatus('selesai'); setCurrentPage(1); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              filterStatus === 'selesai'
                ? 'bg-[#0e4891] text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Selesai (Dijawab/Ditolak)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filterStatus === 'selesai' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {countSelesai}
            </span>
          </button>

          <button
            onClick={() => { setFilterStatus('semua'); setCurrentPage(1); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              filterStatus === 'semua'
                ? 'bg-[#0e4891] text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Semua Permohonan</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filterStatus === 'semua' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
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
