import { CaretUp, CaretDown, ChatTeardropText, XCircle, Clock, CheckCircle, PencilSimple } from '@phosphor-icons/react'

type Permohonan = any

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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'diajukan':
        return 'bg-blue-50 text-[#0e4891] border-blue-200'
      case 'diproses':
        return 'bg-slate-100 text-slate-800 border-slate-300'
      case 'dijawab':
        return 'bg-[#0e4891] text-white border-[#0e4891]'
      case 'ditolak':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {paginatedList.map((item) => {
        const isExpanded = expandedIds[item.id] || false
        const isLongDeskripsi = item.deskripsi.length > 150

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow"
          >
            {/* HEADER KARTU */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900">
                    {item.profiles?.nama || 'Pemohon'}
                  </h2>
                  {item.profiles?.nik && (
                    <span className="text-[11px] font-bold font-mono bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 text-slate-700">
                      NIK: {item.profiles.nik}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  Email: <span className="text-slate-900 font-bold">{item.profiles?.email || '-'}</span> | WA: <span className="text-slate-900 font-bold">{item.profiles?.telepon || '-'}</span> | Diajukan:{' '}
                  <span className="text-slate-900 font-bold">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
              </div>

              {/* BADGE STATUS & SLA */}
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider border ${getStatusBadge(item.status)}`}
                >
                  {item.status}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Deadline SLA: <span className="text-slate-900 font-bold">{item.deadline_akhir || item.deadline_awal || '-'}</span>
                </span>
              </div>
            </div>

            {/* DETAIL PERMOHONAN */}
            <div className="mt-4 text-xs space-y-2">
              <div>
                <span className="inline-block bg-slate-100 text-slate-800 border border-slate-200 font-bold text-[11px] px-2.5 py-0.5 rounded-md mb-2">
                  {item.jenis_informasi}
                </span>
                <p className="font-bold text-slate-900">Deskripsi / Rincian Kebutuhan:</p>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed font-medium mt-1">
                  {isLongDeskripsi && !isExpanded
                    ? `${item.deskripsi.slice(0, 150)}...`
                    : item.deskripsi}
                </p>
                {isLongDeskripsi && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="text-[#0e4891] font-bold text-[11px] hover:underline mt-1 cursor-pointer flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <><CaretUp weight="bold" /> Sembunyikan</>
                    ) : (
                      <><CaretDown weight="bold" /> Lihat Selengkapnya</>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium pt-2">
                Bentuk Salinan / Cara Memperoleh: <span className="text-slate-900 font-bold">{item.cara_memperoleh}</span>
              </p>
            </div>

            {/* JAWABAN ADMIN (JIKA ADA) */}
            {item.jawaban_admin && (
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs">
                <p className="font-bold text-slate-900 mb-1">Jawaban / Tanggapan Resmi Saat Ini:</p>
                <p className="text-slate-800 whitespace-pre-line font-medium leading-relaxed">{item.jawaban_admin}</p>
              </div>
            )}

            {/* ALASAN PERPANJANGAN (JIKA ADA) */}
            {item.diperpanjang && item.alasan_perpanjangan && (
              <div className="mt-3 rounded-xl bg-slate-100 border border-slate-200 p-3 text-xs text-slate-800 font-medium">
                <strong className="font-bold">Status Perpanjangan SLA:</strong> Diperpanjang 7 hari kerja ({item.alasan_perpanjangan})
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap gap-2">
                {!item.diperpanjang && item.status !== 'dijawab' && item.status !== 'ditolak' && (
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => openPerpanjangModal(item)}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock weight="bold" size={16} /> Perpanjang SLA (+7 Hari)
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.status === 'diajukan' && (
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => openProcessModal(item)}
                    className="rounded-xl bg-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle weight="bold" size={16} /> Proses Permohonan
                  </button>
                )}

                {item.status !== 'dijawab' && item.status !== 'ditolak' && (
                  <>
                    <button
                      disabled={updatingId === item.id}
                      onClick={() => openJawabModal(item)}
                      className="rounded-xl bg-[#0e4891] hover:bg-[#0a366f] px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChatTeardropText weight="fill" size={16} /> Jawab Permohonan
                    </button>

                    <button
                      disabled={updatingId === item.id}
                      onClick={() => openTolakModal(item)}
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle weight="fill" size={16} /> Tolak
                    </button>
                  </>
                )}

                {item.status === 'dijawab' && (
                  <button
                    disabled={updatingId === item.id}
                    onClick={() => openJawabModal(item)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <PencilSimple weight="bold" size={16} /> Edit Jawaban
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
