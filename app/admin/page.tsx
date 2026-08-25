'use client'

import { useEffect, useState } from 'react'
import Toast, { ToastType } from '@/components/Toast'
import SkeletonCard from '@/components/SkeletonCard'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminPermohonanTable from '@/components/admin/AdminPermohonanTable'
import AdminPermohonanModals from '@/components/admin/AdminPermohonanModals'

import {
  getAdminPermohonan,
  setPermohonanDiproses,
  setPermohonanJawab,
  setPermohonanTolak,
  setPermohonanPerpanjang
} from '@/app/actions/admin'

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
  const [listPermohonan, setListPermohonan] = useState<Permohonan[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // State Filter, Search & Pagination
  const [filterStatus, setFilterStatus] = useState<'menunggu' | 'selesai' | 'semua'>('menunggu')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({})
  const ITEMS_PER_PAGE = 10

  // State Toast, Confirm Modal & Laporan
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [confirmProcessItem, setConfirmProcessItem] = useState<Permohonan | null>(null)
  const [showLaporanModal, setShowLaporanModal] = useState(false)

  // State Modals
  const [activeModal, setActiveModal] = useState<'jawab' | 'tolak' | 'perpanjang' | null>(null)
  const [selectedItem, setSelectedItem] = useState<Permohonan | null>(null)
  const [inputText, setInputText] = useState('')

  // Fetch semua permohonan menggunakan Server Actions
  const fetchPermohonan = async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    const result = await getAdminPermohonan()

    if (result.success && result.data) {
      setListPermohonan(result.data as Permohonan[])
    } else {
      if (!isBackground) showToast('Gagal memuat data: ' + result.error, 'error')
    }
    if (!isBackground) setLoading(false)
  }

  useEffect(() => {
    fetchPermohonan()

    // Auto-refresh data setiap 1 menit secara senyap (tanpa indikator loading agar tidak mengganggu)
    const intervalId = setInterval(() => {
      fetchPermohonan(true)
    }, 60000)

    return () => clearInterval(intervalId)
  }, [])

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  // Update status (Diproses)
  const openProcessModal = (item: Permohonan) => {
    setConfirmProcessItem(item)
  }

  const executeSetDiproses = async () => {
    if (!confirmProcessItem) return
    setUpdatingId(confirmProcessItem.id)
    
    const result = await setPermohonanDiproses(confirmProcessItem.id)

    setConfirmProcessItem(null)
    if (!result.success) {
      showToast('Gagal memperbarui status: ' + result.error, 'error')
    } else {
      showToast('Status permohonan berhasil diubah menjadi DIPROSES.', 'info')
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
    
    const result = await setPermohonanJawab(selectedItem.id, inputText.trim())

    if (!result.success) {
      showToast('Gagal mengirim jawaban: ' + result.error, 'error')
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
    
    const alasanLengkap = `[DITOLAK] Alasan: ${inputText.trim()}`
    const result = await setPermohonanTolak(selectedItem.id, alasanLengkap)

    if (!result.success) {
      showToast('Gagal menolak permohonan: ' + result.error, 'error')
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

    const result = await setPermohonanPerpanjang(
      selectedItem.id,
      inputText.trim(),
      deadlineAkhirStr
    )

    if (!result.success) {
      showToast('Gagal memperpanjang SLA: ' + result.error, 'error')
    } else {
      showToast('Batas waktu SLA berhasil diperpanjang +7 Hari Kerja!')
      setActiveModal(null)
      fetchPermohonan()
    }
    setUpdatingId(null)
  }

  // Toggle Expand Deskripsi
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Hitung statistik ringkas
  const totalCount = listPermohonan.length
  const countDiajukan = listPermohonan.filter((p) => p.status === 'diajukan').length
  const countDiproses = listPermohonan.filter((p) => p.status === 'diproses').length
  const countDijawab = listPermohonan.filter((p) => p.status === 'dijawab').length
  const countDitolak = listPermohonan.filter((p) => p.status === 'ditolak').length
  const countMenunggu = countDiajukan + countDiproses
  const countSelesai = countDijawab + countDitolak

  // Chained Filter (Status + Search Query)
  const filteredList = listPermohonan.filter((item) => {
    if (filterStatus === 'menunggu' && (item.status !== 'diajukan' && item.status !== 'diproses')) {
      return false
    }
    if (filterStatus === 'selesai' && (item.status !== 'dijawab' && item.status !== 'ditolak')) {
      return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const nama = (item.profiles?.nama || '').toLowerCase()
      const nik = (item.profiles?.nik || '').toLowerCase()
      const deskripsi = (item.deskripsi || '').toLowerCase()
      const jenis = (item.jenis_informasi || '').toLowerCase()
      return nama.includes(q) || nik.includes(q) || deskripsi.includes(q) || jenis.includes(q)
    }

    return true
  })

  // Pesan empty state yang kontekstual
  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return `Tidak ditemukan permohonan yang cocok dengan kata kunci "${searchQuery}".`
    }
    if (filterStatus === 'menunggu') {
      return 'Semua permohonan sudah ditangani. Tidak ada permohonan yang menunggu tindakan saat ini.'
    }
    if (filterStatus === 'selesai') {
      return 'Belum ada permohonan yang selesai diproses atau dijawab.'
    }
    return 'Belum ada permohonan informasi publik yang masuk ke sistem.'
  }

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

      {/* ADMIN HEADER */}
      <AdminHeader
        totalCount={totalCount}
        countMenunggu={countMenunggu}
        countSelesai={countSelesai}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setCurrentPage={setCurrentPage}
        setShowLaporanModal={setShowLaporanModal}
        fetchPermohonan={fetchPermohonan}
      />

      {/* STATS BADGES WITH RELATIVE PROGRESS BARS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Permohonan</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{totalCount}</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-slate-900 h-full rounded-full w-full" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0e4891]">Perlu Diproses</p>
            <p className="text-3xl font-black text-[#0e4891] mt-2">{countDiajukan}</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#0e4891] h-full rounded-full transition-all"
              style={{ width: `${totalCount > 0 ? (countDiajukan / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Sedang Diproses</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{countDiproses}</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-slate-600 h-full rounded-full transition-all"
              style={{ width: `${totalCount > 0 ? (countDiproses / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Selesai / Dijawab</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{countDijawab}</p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${totalCount > 0 ? (countDijawab / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* LIST PERMOHONAN */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-500 leading-relaxed">
          {getEmptyMessage()}
        </div>
      ) : (
        <AdminPermohonanTable
          paginatedList={paginatedList}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          updatingId={updatingId}
          openProcessModal={openProcessModal}
          openJawabModal={openJawabModal}
          openTolakModal={openTolakModal}
          openPerpanjangModal={openPerpanjangModal}
        />
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
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
              ← Sebelumnya
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}

      {/* SEMUA MODAL DISATUKAN */}
      <AdminPermohonanModals
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        inputText={inputText}
        setInputText={setInputText}
        submitJawab={submitJawab}
        submitTolak={submitTolak}
        submitPerpanjang={submitPerpanjang}
        updatingId={updatingId}
        confirmProcessItem={confirmProcessItem}
        setConfirmProcessItem={setConfirmProcessItem}
        executeSetDiproses={executeSetDiproses}
        showLaporanModal={showLaporanModal}
        setShowLaporanModal={setShowLaporanModal}
      />
    </div>
  )
}