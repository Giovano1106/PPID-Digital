'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Modal from '@/components/Modal'
import Toast, { ToastType } from '@/components/Toast'

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

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [listPermohonan, setListPermohonan] = useState<Permohonan[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // State Filter & Pagination
  const [filterStatus, setFilterStatus] = useState<'menunggu' | 'selesai' | 'semua'>('menunggu')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // State Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)

  // State Modals
  const [activeModal, setActiveModal] = useState<'jawab' | 'tolak' | 'perpanjang' | null>(null)
  const [selectedItem, setSelectedItem] = useState<Permohonan | null>(null)
  const [inputText, setInputText] = useState('')

  // Fetch semua permohonan beserta profil pemohon
  const fetchPermohonan = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('permohonan')
      .select(`
        *,
        profiles (
          nama,
          nik,
          email,
          telepon
        )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListPermohonan(data as unknown as Permohonan[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPermohonan()
  }, [])

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  // Update status (Diproses)
  const handleSetDiproses = async (id: number) => {
    setUpdatingId(id)
    const { error } = await supabase
      .from('permohonan')
      .update({ status: 'diproses' })
      .eq('id', id)

    if (error) {
      showToast('Gagal memperbarui status: ' + error.message, 'error')
    } else {
      showToast('Status permohonan diubah menjadi DIPROSES.', 'info')
      fetchPermohonan()
    }
    setUpdatingId(null)
  }

  // Jawab permohonan (Dijawab)
  const openJawabModal = (item: Permohonan) => {
    setSelectedItem(item)
    setInputText(item.jawaban_admin || '')
    setActiveModal('jawab')
  }

  const submitJawab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !inputText.trim()) return

    setUpdatingId(selectedItem.id)
    const { error } = await supabase
      .from('permohonan')
      .update({
        status: 'dijawab',
        jawaban_admin: inputText.trim(),
      })
      .eq('id', selectedItem.id)

    if (error) {
      showToast('Gagal mengirim jawaban: ' + error.message, 'error')
    } else {
      showToast('Jawaban resmi berhasil dikirimkan ke pemohon!')
      setActiveModal(null)
      fetchPermohonan()
    }
    setUpdatingId(null)
  }

  // Tolak permohonan (Ditolak)
  const openTolakModal = (item: Permohonan) => {
    setSelectedItem(item)
    setInputText('')
    setActiveModal('tolak')
  }

  const submitTolak = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !inputText.trim()) return

    setUpdatingId(selectedItem.id)
    const { error } = await supabase
      .from('permohonan')
      .update({
        status: 'ditolak',
        jawaban_admin: `[DITOLAK] Alasan: ${inputText.trim()}`,
      })
      .eq('id', selectedItem.id)

    if (error) {
      showToast('Gagal menolak permohonan: ' + error.message, 'error')
    } else {
      showToast('Permohonan informasi telah ditolak.', 'info')
      setActiveModal(null)
      fetchPermohonan()
    }
    setUpdatingId(null)
  }

  // Perpanjang SLA (+7 Hari Kerja)
  const openPerpanjangModal = (item: Permohonan) => {
    setSelectedItem(item)
    setInputText('')
    setActiveModal('perpanjang')
  }

  const submitPerpanjang = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !inputText.trim()) return

    setUpdatingId(selectedItem.id)

    const baseDate = new Date(selectedItem.deadline_awal || selectedItem.created_at)
    let count = 0
    const newDeadline = new Date(baseDate)
    while (count < 7) {
      newDeadline.setDate(newDeadline.getDate() + 1)
      const day = newDeadline.getDay()
      if (day !== 0 && day !== 6) count++
    }
    const deadlineAkhirStr = newDeadline.toISOString().split('T')[0]

    const { error } = await supabase
      .from('permohonan')
      .update({
        diperpanjang: true,
        alasan_perpanjangan: inputText.trim(),
        deadline_akhir: deadlineAkhirStr,
      })
      .eq('id', selectedItem.id)

    if (error) {
      showToast('Gagal memperpanjang SLA: ' + error.message, 'error')
    } else {
      showToast('Batas waktu SLA berhasil diperpanjang +7 Hari Kerja!')
      setActiveModal(null)
      fetchPermohonan()
    }
    setUpdatingId(null)
  }

  // Hitung statistik ringkas
  const countDiajukan = listPermohonan.filter((p) => p.status === 'diajukan').length
  const countDiproses = listPermohonan.filter((p) => p.status === 'diproses').length

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

  // Filter & Pagination Logic
  const filteredList = listPermohonan.filter((item) => {
    if (filterStatus === 'menunggu') {
      return item.status === 'diajukan' || item.status === 'diproses'
    }
    if (filterStatus === 'selesai') {
      return item.status === 'dijawab' || item.status === 'ditolak'
    }
    return true // 'semua'
  })

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE)
  const paginatedList = filteredList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="font-plus-jakarta pb-12">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* HEADER DASHBOARD */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-black text-2xl md:text-3xl tracking-tight text-slate-900">Kelola Permohonan Informasi</h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Tinjau permohonan masuk, berikan jawaban resmi, dan kelola batas waktu SLA.
          </p>
        </div>
        <button
          onClick={fetchPermohonan}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* STATS BADGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Permohonan</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{listPermohonan.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#0e4891]">Perlu Diproses</p>
          <p className="text-3xl font-black text-[#0e4891] mt-2">{countDiajukan}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Sedang Diproses</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{countDiproses}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Selesai / Dijawab</p>
          <p className="text-3xl font-black text-slate-900 mt-2">
            {listPermohonan.filter((p) => p.status === 'dijawab').length}
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4 overflow-x-auto">
        <button
          onClick={() => { setFilterStatus('menunggu'); setCurrentPage(1); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${filterStatus === 'menunggu' ? 'bg-[#0e4891] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          Menunggu Tindakan
        </button>
        <button
          onClick={() => { setFilterStatus('selesai'); setCurrentPage(1); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${filterStatus === 'selesai' ? 'bg-[#0e4891] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          Selesai (Dijawab/Ditolak)
        </button>
        <button
          onClick={() => { setFilterStatus('semua'); setCurrentPage(1); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${filterStatus === 'semua' ? 'bg-[#0e4891] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          Semua Permohonan
        </button>
      </div>

      {/* LIST PERMOHONAN */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-slate-500 bg-white rounded-2xl border border-slate-200">Memuat data permohonan...</div>
      ) : filteredList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-500">
          Tidak ada permohonan di kategori ini.
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedList.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
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
                    {item.deskripsi}
                  </p>
                </div>
                <p className="text-xs text-slate-500 font-medium">
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
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                      ⏱️ Perpanjang SLA (+7 Hari)
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.status === 'diajukan' && (
                    <button
                      disabled={updatingId === item.id}
                      onClick={() => handleSetDiproses(item.id)}
                      className="rounded-xl bg-slate-800 hover:bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all"
                    >
                      Proses Permohonan
                    </button>
                  )}

                  {item.status !== 'dijawab' && item.status !== 'ditolak' && (
                    <>
                      <button
                        disabled={updatingId === item.id}
                        onClick={() => openJawabModal(item)}
                        className="rounded-xl bg-[#0e4891] hover:bg-[#0a366f] px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all"
                      >
                        💬 Jawab Permohonan
                      </button>

                      <button
                        disabled={updatingId === item.id}
                        onClick={() => openTolakModal(item)}
                        className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all"
                      >
                        ❌ Tolak
                      </button>
                    </>
                  )}

                  {item.status === 'dijawab' && (
                    <button
                      disabled={updatingId === item.id}
                      onClick={() => openJawabModal(item)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                    >
                      ✏️ Edit Jawaban
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-500">
            Halaman {currentPage} dari {totalPages} <span className="font-medium">({filteredList.length} Total Data)</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm"
            >
              ← Sebelumnya
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}

      {/* MODAL JAWAB */}
      <Modal
        isOpen={activeModal === 'jawab'}
        onClose={() => setActiveModal(null)}
        title="💬 Jawab Permohonan Informasi"
      >
        <form onSubmit={submitJawab} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              Teks Jawaban / Link Dokumen Google Drive
            </label>
            <textarea
              required
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tuliskan jawaban resmi atau cantumkan tautan Google Drive dokumen yang diminta..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null}
              className="px-5 py-2 rounded-xl bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all"
            >
              Kirim Jawaban
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL TOLAK */}
      <Modal
        isOpen={activeModal === 'tolak'}
        onClose={() => setActiveModal(null)}
        title="❌ Tolak Permohonan Informasi"
      >
        <form onSubmit={submitTolak} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              Alasan Penolakan Permohonan
            </label>
            <textarea
              required
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Jelaskan alasan mengapa permohonan informasi ini ditolak..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all"
            >
              Tolak Permohonan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL PERPANJANG SLA */}
      <Modal
        isOpen={activeModal === 'perpanjang'}
        onClose={() => setActiveModal(null)}
        title="⏱️ Perpanjang SLA (+7 Hari Kerja)"
      >
        <form onSubmit={submitPerpanjang} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
              Alasan Perpanjangan Waktu SLA
            </label>
            <textarea
              required
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Jelaskan alasan teknis perpanjangan batas waktu respon..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updatingId !== null}
              className="px-5 py-2 rounded-xl bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all"
            >
              Simpan Perpanjangan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}