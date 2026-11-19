'use client'

import { useCallback, useEffect, useState } from 'react'
import { CaretLeft, CaretRight, WarningCircle, ArrowsClockwise } from '@phosphor-icons/react'
import Toast, { ToastType } from '@/components/Toast'
import SkeletonCard from '@/components/SkeletonCard'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminPermohonanTable, { Permohonan } from '@/components/admin/AdminPermohonanTable'
import AdminPermohonanModals from '@/components/admin/AdminPermohonanModals'
import {
  getAdminPermohonan,
  setPermohonanDiproses,
  setPermohonanJawab,
  setPermohonanTolak,
  setPermohonanPerpanjang,
} from '@/app/actions/admin'
import { createClient } from '@/app/lib/supabase/client'

const ITEMS_PER_PAGE = 10

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

export default function AdminDashboardPage() {
  const [listPermohonan, setListPermohonan] = useState<Permohonan[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  // State Filter, Search & Pagination
  const [filterStatus, setFilterStatus] = useState<'menunggu' | 'selesai' | 'semua'>('menunggu')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({})

  // State Toast, Confirm Modal & Laporan
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [confirmProcessItem, setConfirmProcessItem] = useState<Permohonan | null>(null)
  const [showLaporanModal, setShowLaporanModal] = useState(false)

  // State Modals
  const [activeModal, setActiveModal] = useState<'jawab' | 'tolak' | 'perpanjang' | null>(null)
  const [selectedItem, setSelectedItem] = useState<Permohonan | null>(null)
  const [inputText, setInputText] = useState('')

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }, [])

  const fetchPermohonan = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsRefreshing(true)
        setFetchError(null)
      }

      try {
        const result = await getAdminPermohonan()
        if (result.success && result.data) {
          setListPermohonan(result.data as Permohonan[])
          setFetchError(null)
        } else {
          const message = result.error || 'Gagal memuat daftar permohonan informasi.'
          if (!isBackground) {
            setFetchError(message)
            showToast(message, 'error')
          }
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Terjadi gangguan koneksi saat memuat data permohonan.'
        if (!isBackground) {
          setFetchError(message)
          showToast(message, 'error')
        }
      } finally {
        if (!isBackground) {
          setLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [showToast]
  )

  useEffect(() => {
    let ignore = false

    getAdminPermohonan()
      .then((result) => {
        if (ignore) return
        if (result.success && result.data) {
          setListPermohonan(result.data as Permohonan[])
          setFetchError(null)
        } else {
          setFetchError(result.error || 'Gagal memuat daftar permohonan informasi.')
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (ignore) return
        setFetchError(
          err instanceof Error
            ? err.message
            : 'Terjadi gangguan koneksi saat memuat data permohonan.'
        )
        setLoading(false)
      })

    const supabase = createClient()

    const channel = supabase
      .channel('admin-permohonan-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'permohonan',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            showToast('Ada permohonan informasi publik baru masuk.', 'info')
          }
          void fetchPermohonan(true)
        }
      )
      .subscribe()

    const handleFocus = () => {
      void fetchPermohonan(true)
    }
    window.addEventListener('focus', handleFocus)

    const intervalId = setInterval(() => {
      void fetchPermohonan(true)
    }, 20000)

    return () => {
      ignore = true
      supabase.removeChannel(channel)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalId)
    }
  }, [fetchPermohonan, showToast])

  // Update status (Diproses)
  const openProcessModal = (item: Permohonan) => {
    setConfirmProcessItem(item)
  }

  const executeSetDiproses = async () => {
    if (!confirmProcessItem) return
    setUpdatingId(confirmProcessItem.id)

    try {
      const result = await setPermohonanDiproses(confirmProcessItem.id)
      setConfirmProcessItem(null)
      if (!result.success) {
        showToast('Gagal memperbarui status: ' + (result.error || 'Kesalahan sistem'), 'error')
      } else {
        showToast('Status permohonan berhasil diubah menjadi Diproses.', 'info')
        await fetchPermohonan(true)
      }
    } catch {
      showToast('Terjadi gangguan koneksi saat memperbarui status permohonan.', 'error')
    } finally {
      setUpdatingId(null)
    }
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
    try {
      const result = await setPermohonanJawab(selectedItem.id, inputText.trim())
      if (!result.success) {
        showToast('Gagal mengirim jawaban: ' + (result.error || 'Kesalahan sistem'), 'error')
      } else {
        showToast('Jawaban resmi berhasil dikirimkan ke pemohon.')
        setActiveModal(null)
        if (filterStatus === 'menunggu') {
          const remainingCount = Math.max(0, filteredList.length - 1)
          const nextMaxPage = Math.max(1, Math.ceil(remainingCount / ITEMS_PER_PAGE))
          setCurrentPage((prev) => Math.min(prev, nextMaxPage))
        }
        await fetchPermohonan(true)
      }
    } catch {
      showToast('Terjadi gangguan koneksi saat mengirim jawaban resmi.', 'error')
    } finally {
      setUpdatingId(null)
    }
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
    try {
      const result = await setPermohonanTolak(selectedItem.id, inputText.trim())
      if (!result.success) {
        showToast('Gagal menolak permohonan: ' + (result.error || 'Kesalahan sistem'), 'error')
      } else {
        showToast('Permohonan informasi telah ditolak.', 'info')
        setActiveModal(null)
        if (filterStatus === 'menunggu') {
          const remainingCount = Math.max(0, filteredList.length - 1)
          const nextMaxPage = Math.max(1, Math.ceil(remainingCount / ITEMS_PER_PAGE))
          setCurrentPage((prev) => Math.min(prev, nextMaxPage))
        }
        await fetchPermohonan(true)
      }
    } catch {
      showToast('Terjadi gangguan koneksi saat menolak permohonan.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Perpanjang SLA (+7 Hari Kerja WITA dihitung server)
  const openPerpanjangModal = (item: Permohonan) => {
    setSelectedItem(item)
    setInputText('')
    setActiveModal('perpanjang')
  }

  const submitPerpanjang = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !inputText.trim()) return

    setUpdatingId(selectedItem.id)
    try {
      const result = await setPermohonanPerpanjang(selectedItem.id, inputText.trim())
      if (!result.success) {
        showToast('Gagal memperpanjang SLA: ' + (result.error || 'Kesalahan sistem'), 'error')
      } else {
        showToast('Batas waktu SLA berhasil diperpanjang +7 Hari Kerja WITA.')
        setActiveModal(null)
        await fetchPermohonan(true)
      }
    } catch {
      showToast('Terjadi gangguan koneksi saat memperpanjang batas waktu SLA.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Statistik operasional
  const todayWitaYmd = getTodayWitaYmd()
  const totalCount = listPermohonan.length
  const countDiajukan = listPermohonan.filter((p) => p.status === 'diajukan').length
  const countDiproses = listPermohonan.filter((p) => p.status === 'diproses').length
  const countDijawab = listPermohonan.filter((p) => p.status === 'dijawab').length
  const countDitolak = listPermohonan.filter((p) => p.status === 'ditolak').length
  const countMenunggu = countDiajukan + countDiproses
  const countSelesai = countDijawab + countDitolak
  const countOverdue = listPermohonan.filter((p) => {
    if (p.status === 'dijawab' || p.status === 'ditolak') return false
    const ymd = extractDeadlineYmd(p.deadline_akhir || p.deadline_awal)
    return ymd !== null && ymd < todayWitaYmd
  }).length

  // Chained Filter (Status + Search Query)
  const filteredList = listPermohonan.filter((item) => {
    if (filterStatus === 'menunggu' && item.status !== 'diajukan' && item.status !== 'diproses') {
      return false
    }
    if (filterStatus === 'selesai' && item.status !== 'dijawab' && item.status !== 'ditolak') {
      return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const ticketId = `#${item.id}`
      const nama = (item.profiles?.nama || '').toLowerCase()
      const nik = (item.profiles?.nik || '').toLowerCase()
      const deskripsi = (item.deskripsi || '').toLowerCase()
      const jenis = (item.jenis_informasi || '').toLowerCase()
      return (
        ticketId.includes(q) ||
        item.id.toString().includes(q) ||
        nama.includes(q) ||
        nik.includes(q) ||
        deskripsi.includes(q) ||
        jenis.includes(q)
      )
    }

    return true
  })

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

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const paginatedList = filteredList.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  )

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

      {/* ADMIN HEADER + OPERATIONAL SLA LEDGER */}
      <AdminHeader
        totalCount={totalCount}
        countDiajukan={countDiajukan}
        countDiproses={countDiproses}
        countDijawab={countDijawab}
        countDitolak={countDitolak}
        countOverdue={countOverdue}
        countMenunggu={countMenunggu}
        countSelesai={countSelesai}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setCurrentPage={setCurrentPage}
        setShowLaporanModal={setShowLaporanModal}
        fetchPermohonan={() => {
          void fetchPermohonan(false)
        }}
        isRefreshing={isRefreshing}
      />

      {/* FETCH ERROR ALERT WITH RETRY */}
      {fetchError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <WarningCircle
              weight="fill"
              size={22}
              className="text-rose-600 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-bold text-rose-900">
                Gagal Memuat Data Permohonan
              </p>
              <p className="text-xs text-rose-800 font-medium mt-0.5 leading-relaxed">
                {fetchError}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              void fetchPermohonan(false)
            }}
            disabled={isRefreshing}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            <ArrowsClockwise
              weight="bold"
              size={15}
              className={isRefreshing ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* LIST PERMOHONAN */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : fetchError && listPermohonan.length === 0 ? null : filteredList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs font-bold text-slate-600 leading-relaxed">
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
      {!loading && filteredList.length > ITEMS_PER_PAGE && (
        <nav
          aria-label="Navigasi halaman daftar permohonan"
          className="flex flex-wrap items-center justify-between gap-4 mt-6 bg-white p-4 rounded-xl border border-slate-200"
        >
          <p className="text-xs font-bold text-slate-600 tabular-nums">
            Halaman {safeCurrentPage} dari {totalPages}{' '}
            <span className="font-medium text-slate-500">
              ({filteredList.length} Total Data)
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(Math.max(safeCurrentPage - 1, 1))}
              aria-label="Halaman sebelumnya"
              className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              <CaretLeft weight="bold" size={14} aria-hidden="true" /> Sebelumnya
            </button>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(Math.min(safeCurrentPage + 1, totalPages))}
              aria-label="Halaman berikutnya"
              className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
            >
              Selanjutnya <CaretRight weight="bold" size={14} aria-hidden="true" />
            </button>
          </div>
        </nav>
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
        selectedItem={selectedItem}
      />
    </div>
  )
}
