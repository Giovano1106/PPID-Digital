'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import Toast, { ToastType } from '@/components/Toast'
import { isSafePublicUrl } from '@/app/lib/security'
import {
  Plus,
  PencilSimple,
  Trash,
  ArrowsClockwise,
  ArrowSquareOut,
  Database,
  LinkSimple,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  Info,
  Calendar,
  Check,
  X,
  UploadSimple,
  CircleNotch,
  WarningCircle,
} from '@phosphor-icons/react'
import {
  getDaftarInformasiTables,
  createDaftarInformasiTable,
  updateDaftarInformasiTable,
  deleteDaftarInformasiTable,
  createDaftarInformasiItem,
  updateDaftarInformasiItem,
  deleteDaftarInformasiItem,
  seedInitialDaftarInformasi,
  addTahunToTable,
  editTahunInTable,
  deleteTahunFromTable,
} from '@/app/actions/daftar-informasi'
import {
  DaftarInformasiTable,
  DaftarInformasiItem,
  getTableYears,
} from '@/app/informasi/data/daftarInformasiDefault'

const FOCUS_RING_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2'

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors'

const DEFAULT_YEAR_DESCRIPTION_PATTERN = /^Tahun\s+[a-zA-Z0-9]+\s*[-\u2013]\s*[a-zA-Z0-9]+$/i

function sortYears(years: string[]): string[] {
  return [...years].sort((a, b) => {
    const numA = parseInt(a, 10)
    const numB = parseInt(b, 10)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return a.localeCompare(b)
  })
}

function formatYearRangeLabel(years: string[]): string {
  if (years.length === 0) return 'Belum ada kolom tahun'
  if (years.length === 1) return `Tahun ${years[0]}`
  return `Tahun ${years[0]} - ${years[years.length - 1]}`
}

export default function AdminDaftarInformasiPage() {
  const [tables, setTables] = useState<DaftarInformasiTable[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [activeTableIndex, setActiveTableIndex] = useState(0)
  const [tableSearch, setTableSearch] = useState('')

  // Toast & Modals
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalType, setModalType] = useState<
    'addTable' | 'editTable' | 'addItem' | 'editItem' | 'manageYears' | null
  >(null)
  const [seeding, setSeeding] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Delete Confirmations
  const [deleteTableConfirm, setDeleteTableConfirm] = useState<DaftarInformasiTable | null>(null)
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<DaftarInformasiItem | null>(null)
  const [deleteYearConfirm, setDeleteYearConfirm] = useState<string | null>(null)

  // Year Column Management State
  const [newYearInput, setNewYearInput] = useState('')
  const [editingYear, setEditingYear] = useState<{ oldYear: string; newYear: string } | null>(null)
  const [applyToAllTables, setApplyToAllTables] = useState(false)
  const [inlineNewYear, setInlineNewYear] = useState('')

  // Form State - Table
  const [tableJudul, setTableJudul] = useState('')
  const [tableDeskripsi, setTableDeskripsi] = useState('')
  const [tableActionType, setTableActionType] = useState<'unduh' | 'klik'>('unduh')

  // Form State - Item
  const [itemNama, setItemNama] = useState('')
  const [itemLinks, setItemLinks] = useState<Record<string, string>>({})
  const [selectedItem, setSelectedItem] = useState<DaftarInformasiItem | null>(null)
  const [uploadingYear, setUploadingYear] = useState<string | null>(null)

  const closeToast = useCallback(() => {
    setToast(null)
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await getDaftarInformasiTables()
      if (res.success && res.data) {
        setTables(res.data)
        setIsFallback(res.isFallback)
        setFallbackNotice(res.isFallback && res.error ? res.error : null)
        setActiveTableIndex((prev) => (prev >= res.data.length ? 0 : prev))
      } else {
        const msg = res.error || 'Gagal memuat data matriks daftar informasi.'
        setFetchError(msg)
        showToast(`Gagal memuat data: ${msg}`, 'error')
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi server.'
      setFetchError(msg)
      showToast(`Gagal memuat data: ${msg}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const res = await getDaftarInformasiTables()
        if (!active) return

        if (res.success && res.data) {
          setTables(res.data)
          setIsFallback(res.isFallback)
          setFallbackNotice(res.isFallback && res.error ? res.error : null)
          setFetchError(null)
        } else {
          const msg = res.error || 'Gagal memuat data matriks daftar informasi.'
          setFetchError(msg)
          setToast({ message: `Gagal memuat data: ${msg}`, type: 'error' })
        }
      } catch (err: unknown) {
        if (!active) return
        const msg =
          err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi server.'
        setFetchError(msg)
        setToast({ message: `Gagal memuat data: ${msg}`, type: 'error' })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void init()

    return () => {
      active = false
    }
  }, [])

  const filteredTables = useMemo(() => {
    if (!tableSearch.trim()) return tables
    const q = tableSearch.toLowerCase()
    return tables.filter(
      (t) =>
        t.judul.toLowerCase().includes(q) ||
        (t.deskripsi && t.deskripsi.toLowerCase().includes(q))
    )
  }, [tables, tableSearch])

  const activeTable = tables[activeTableIndex] || null
  const activeYears = useMemo(() => getTableYears(activeTable), [activeTable])
  const activeYearRangeLabel = useMemo(() => formatYearRangeLabel(activeYears), [activeYears])

  const overallYears = useMemo(() => {
    const yearSet = new Set<string>()
    tables.forEach((tbl) => {
      tbl.items?.forEach((item) => {
        if (item.links && typeof item.links === 'object') {
          Object.keys(item.links).forEach((yr) => {
            const trimmed = yr.trim()
            if (trimmed) yearSet.add(trimmed)
          })
        }
      })
    })
    if (yearSet.size > 0) {
      return sortYears(Array.from(yearSet))
    }
    return activeTable ? getTableYears(activeTable) : []
  }, [tables, activeTable])

  const overallYearRangeLabel = useMemo(
    () => formatYearRangeLabel(overallYears),
    [overallYears]
  )

  const activeCustomDescription = useMemo(() => {
    const raw = activeTable?.deskripsi?.trim() || ''
    if (!raw || DEFAULT_YEAR_DESCRIPTION_PATTERN.test(raw)) {
      return null
    }
    return raw
  }, [activeTable])

  const handleYearFileUpload = async (th: string, file?: File | null) => {
    if (!file) return
    setUploadingYear(th)
    setModalError(null)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('raw_only', 'true')
    formData.append('kategori_key', 'raw_upload')
    formData.append('folder_scope', 'daftar_informasi')
    formData.append('table_title', activeTable?.judul || '')
    formData.append('tahun', th)

    try {
      const res = await fetch('/api/admin/upload-drive', {
        method: 'POST',
        body: formData,
      })
      const data: { error?: string; fileUrl?: string; folderPath?: string } = await res.json()
      if (!res.ok || data.error) {
        const msg = data.error || 'Gagal mengunggah file ke Google Drive.'
        setModalError(msg)
        showToast(msg, 'error')
      } else if (data.fileUrl) {
        const uploadedUrl = data.fileUrl
        setItemLinks((prev) => ({
          ...prev,
          [th]: uploadedUrl,
        }))
        showToast(
          data.folderPath
            ? `Berkas tahun ${th} berhasil diunggah ke folder Drive "${data.folderPath}".`
            : `Berkas tahun ${th} berhasil diunggah langsung ke Google Drive.`
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah file ke Google Drive.'
      setModalError(msg)
      showToast(`Error: ${msg}`, 'error')
    } finally {
      setUploadingYear(null)
    }
  }

  const handleSeedData = async () => {
    setSeeding(true)
    try {
      const res = await seedInitialDaftarInformasi()
      if (res.success) {
        showToast('Seluruh tabel data awal berhasil diimpor ke database Supabase.')
        await loadData()
      } else {
        showToast(res.error || 'Gagal menginisialisasi data.', 'error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menginisialisasi data.'
      showToast(msg, 'error')
    } finally {
      setSeeding(false)
    }
  }

  const openAddTableModal = () => {
    setTableJudul('')
    setTableDeskripsi(overallYears.length > 0 ? overallYearRangeLabel : '')
    setTableActionType('unduh')
    setModalError(null)
    setModalType('addTable')
  }

  const openEditTableModal = (tbl: DaftarInformasiTable) => {
    setTableJudul(tbl.judul)
    setTableDeskripsi(tbl.deskripsi || activeYearRangeLabel)
    setTableActionType(tbl.action_type || 'unduh')
    setModalError(null)
    setModalType('editTable')
  }

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableJudul.trim()) {
      const msg = 'Judul tabel tidak boleh kosong.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }

    setModalError(null)
    setSubmitting(true)
    try {
      if (modalType === 'addTable') {
        const res = await createDaftarInformasiTable({
          judul: tableJudul.trim(),
          deskripsi: tableDeskripsi.trim(),
          action_type: tableActionType,
          urutan: tables.length + 1,
        })
        if (res.success) {
          showToast('Tabel baru berhasil ditambahkan ke CMS.')
          setModalType(null)
          await loadData()
        } else {
          const msg = res.error || 'Gagal menambahkan tabel.'
          setModalError(msg)
          showToast(`Gagal: ${msg}`, 'error')
        }
      } else if (modalType === 'editTable' && activeTable?.id) {
        const res = await updateDaftarInformasiTable(activeTable.id, {
          judul: tableJudul.trim(),
          deskripsi: tableDeskripsi.trim(),
          action_type: tableActionType,
          urutan: activeTable.urutan,
        })
        if (res.success) {
          showToast('Header tabel berhasil diperbarui.')
          setModalType(null)
          await loadData()
        } else {
          const msg = res.error || 'Gagal memperbarui tabel.'
          setModalError(msg)
          showToast(`Gagal: ${msg}`, 'error')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan tabel.'
      setModalError(msg)
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDeleteTable = async () => {
    if (!deleteTableConfirm?.id) return
    setSubmitting(true)
    try {
      const res = await deleteDaftarInformasiTable(deleteTableConfirm.id)
      setDeleteTableConfirm(null)
      if (res.success) {
        showToast('Tabel beserta seluruh isinya telah dihapus.')
        await loadData()
      } else {
        showToast(`Gagal menghapus tabel: ${res.error || 'Terjadi kesalahan.'}`, 'error')
      }
    } catch (err: unknown) {
      setDeleteTableConfirm(null)
      const msg = err instanceof Error ? err.message : 'Gagal menghapus tabel.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const openAddItemModal = () => {
    setItemNama('')
    const initialLinks: Record<string, string> = {}
    activeYears.forEach((th) => {
      initialLinks[th] = '#'
    })
    setItemLinks(initialLinks)
    setSelectedItem(null)
    setInlineNewYear('')
    setModalError(null)
    setModalType('addItem')
  }

  const openEditItemModal = (item: DaftarInformasiItem) => {
    setItemNama(item.nama)
    const currentLinks: Record<string, string> = {}
    const itemYears = Object.keys(item.links || {})
    const mergedYears = sortYears(Array.from(new Set([...activeYears, ...itemYears])))
    mergedYears.forEach((th) => {
      currentLinks[th] = item.links?.[th] || '#'
    })
    setItemLinks(currentLinks)
    setSelectedItem(item)
    setInlineNewYear('')
    setModalError(null)
    setModalType('editItem')
  }

  const handleLinkChange = (tahun: string, val: string) => {
    setModalError(null)
    setItemLinks((prev) => ({ ...prev, [tahun]: val }))
  }

  const handleAddYearToItem = () => {
    const yr = inlineNewYear.trim()
    if (!yr) return
    setItemLinks((prev) => ({ ...prev, [yr]: '#' }))
    setInlineNewYear('')
  }

  const handleRemoveYearFromItem = (yr: string) => {
    setItemLinks((prev) => {
      const copy = { ...prev }
      delete copy[yr]
      return copy
    })
  }

  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault()
    const yr = newYearInput.trim()
    if (!yr) {
      const msg = 'Masukkan angka atau label tahun.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }
    if (!activeTable?.id) {
      const msg = 'Tabel belum tersimpan di database.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }

    setModalError(null)
    setSubmitting(true)
    try {
      const res = await addTahunToTable(activeTable.id, yr, applyToAllTables)
      if (res.success) {
        showToast(
          `Tahun ${yr} berhasil ditambahkan ${
            applyToAllTables ? 'ke semua tabel' : 'ke tabel ini'
          }.`
        )
        setNewYearInput('')
        await loadData()
      } else {
        const msg = res.error || 'Gagal menambahkan tahun.'
        setModalError(msg)
        showToast(`Gagal menambahkan tahun: ${msg}`, 'error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan tahun.'
      setModalError(msg)
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditYear = async (oldYear: string, newYear: string) => {
    const yr = newYear.trim()
    if (!yr) {
      const msg = 'Tahun tidak boleh kosong.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }
    if (yr === oldYear) {
      setEditingYear(null)
      return
    }
    if (!activeTable?.id) return

    setModalError(null)
    setSubmitting(true)
    try {
      const res = await editTahunInTable(activeTable.id, oldYear, yr, applyToAllTables)
      if (res.success) {
        showToast(
          `Tahun ${oldYear} berhasil diubah menjadi ${yr} ${
            applyToAllTables ? 'di semua tabel' : 'di tabel ini'
          }.`
        )
        setEditingYear(null)
        await loadData()
      } else {
        const msg = res.error || 'Gagal mengubah tahun.'
        setModalError(msg)
        showToast(`Gagal mengubah tahun: ${msg}`, 'error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah tahun.'
      setModalError(msg)
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteYear = async (yearToDelete: string) => {
    if (!activeTable?.id) return

    setSubmitting(true)
    try {
      const res = await deleteTahunFromTable(activeTable.id, yearToDelete, applyToAllTables)
      setDeleteYearConfirm(null)
      if (res.success) {
        showToast(
          `Kolom tahun ${yearToDelete} berhasil dihapus ${
            applyToAllTables ? 'dari semua tabel' : 'dari tabel ini'
          }.`
        )
        await loadData()
      } else {
        const msg = res.error || 'Gagal menghapus tahun.'
        setModalError(msg)
        showToast(`Gagal menghapus tahun: ${msg}`, 'error')
      }
    } catch (err: unknown) {
      setDeleteYearConfirm(null)
      const msg = err instanceof Error ? err.message : 'Gagal menghapus tahun.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemNama.trim()) {
      const msg = 'Nama data/dokumen tidak boleh kosong.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }

    if (!activeTable?.id) {
      const msg =
        'Silakan simpan atau inisialisasi tabel terlebih dahulu sebelum menambah data ke database.'
      setModalError(msg)
      showToast(msg, 'error')
      return
    }

    for (const [tahun, url] of Object.entries(itemLinks)) {
      const cleaned = url.trim()
      if (
        cleaned &&
        cleaned !== '#' &&
        !isSafePublicUrl(cleaned, { allowRelativePath: true, allowHashPlaceholder: true })
      ) {
        const msg = `Tautan untuk tahun "${tahun}" tidak valid. Gunakan URL http://, https://, path /, atau #.`
        setModalError(msg)
        showToast(msg, 'error')
        return
      }
    }

    setModalError(null)
    setSubmitting(true)
    try {
      if (modalType === 'addItem') {
        const res = await createDaftarInformasiItem({
          tabel_id: activeTable.id,
          nama: itemNama.trim(),
          links: itemLinks,
          urutan: (activeTable.items?.length || 0) + 1,
        })
        if (res.success) {
          showToast('Baris data baru berhasil ditambahkan.')
          setModalType(null)
          await loadData()
        } else {
          const msg = res.error || 'Gagal menambahkan baris data.'
          setModalError(msg)
          showToast(`Gagal: ${msg}`, 'error')
        }
      } else if (modalType === 'editItem' && selectedItem?.id) {
        const res = await updateDaftarInformasiItem(selectedItem.id, {
          nama: itemNama.trim(),
          links: itemLinks,
          urutan: selectedItem.urutan,
        })
        if (res.success) {
          showToast('Baris data dan tautan berhasil diperbarui.')
          setModalType(null)
          await loadData()
        } else {
          const msg = res.error || 'Gagal memperbarui baris data.'
          setModalError(msg)
          showToast(`Gagal: ${msg}`, 'error')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan baris data.'
      setModalError(msg)
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDeleteItem = async () => {
    if (!deleteItemConfirm?.id) return
    setSubmitting(true)
    try {
      const res = await deleteDaftarInformasiItem(deleteItemConfirm.id)
      setDeleteItemConfirm(null)
      if (res.success) {
        showToast('Baris data berhasil dihapus.')
        await loadData()
      } else {
        showToast(`Gagal menghapus baris data: ${res.error || 'Terjadi kesalahan.'}`, 'error')
      }
    } catch (err: unknown) {
      setDeleteItemConfirm(null)
      const msg = err instanceof Error ? err.message : 'Gagal menghapus baris data.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrevTable = () => {
    if (activeTableIndex > 0) {
      setActiveTableIndex(activeTableIndex - 1)
    }
  }

  const handleNextTable = () => {
    if (activeTableIndex < tables.length - 1) {
      setActiveTableIndex(activeTableIndex + 1)
    }
  }

  return (
    <div className="pb-16 font-plus-jakarta">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* CONFIRM MODAL HAPUS TABEL */}
      <ConfirmModal
        isOpen={!!deleteTableConfirm}
        title="Hapus Kategori Tabel?"
        message={`Apakah Anda yakin ingin menghapus tabel "${deleteTableConfirm?.judul || ''}" beserta seluruh ${deleteTableConfirm?.items?.length || 0} baris dokumen di dalamnya? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Tabel"
        cancelText="Batal"
        onConfirm={confirmDeleteTable}
        onClose={() => {
          if (!submitting) setDeleteTableConfirm(null)
        }}
        loading={submitting}
        variant="danger"
      />

      {/* CONFIRM MODAL HAPUS ITEM */}
      <ConfirmModal
        isOpen={!!deleteItemConfirm}
        title="Hapus Baris Data Dokumen?"
        message={`Apakah Anda yakin ingin menghapus baris data "${deleteItemConfirm?.nama || ''}"?`}
        confirmText="Ya, Hapus Baris"
        cancelText="Batal"
        onConfirm={confirmDeleteItem}
        onClose={() => {
          if (!submitting) setDeleteItemConfirm(null)
        }}
        loading={submitting}
        variant="danger"
      />

      {/* CONFIRM MODAL HAPUS TAHUN */}
      <ConfirmModal
        isOpen={!!deleteYearConfirm}
        title={`Hapus Kolom Tahun ${deleteYearConfirm || ''}?`}
        message={`Apakah Anda yakin ingin menghapus kolom tahun ${deleteYearConfirm || ''} ${
          applyToAllTables ? 'dari SEMUA tabel kategori' : 'dari tabel ini'
        }? Seluruh tautan dokumen pada kolom tahun tersebut akan dibersihkan.`}
        confirmText="Ya, Hapus Kolom Tahun"
        cancelText="Batal"
        onConfirm={() => {
          if (deleteYearConfirm) void handleDeleteYear(deleteYearConfirm)
        }}
        onClose={() => {
          if (!submitting) setDeleteYearConfirm(null)
        }}
        loading={submitting}
        variant="danger"
      />

      {/* HEADER PAGE */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kelola Matriks Daftar Informasi Publik
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Pilih tabel tematik untuk mengelola rincian baris data dan tautan per tahun
            {!loading && tables.length > 0 ? ` (${overallYearRangeLabel}).` : '.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap sm:flex-nowrap shrink-0">
          <Link
            href="/informasi/daftar_informasi_publik"
            target="_blank"
            rel="noopener noreferrer"
            className={`min-h-[44px] whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 ${FOCUS_RING_CLASS}`}
          >
            <span>Lihat di Portal</span>
            <ArrowSquareOut size={14} weight="bold" />
          </Link>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className={`min-h-[44px] whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            title="Muat ulang data"
          >
            <ArrowsClockwise weight="bold" size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {isFallback && (
            <button
              type="button"
              onClick={() => void handleSeedData()}
              disabled={seeding || loading}
              className={`min-h-[44px] whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
              title="Impor tabel data awal ke Supabase"
            >
              <Database size={15} weight="bold" />
              <span>{seeding ? 'Mengimpor...' : 'Sinkronkan Data Awal'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={openAddTableModal}
            className={`min-h-[44px] whitespace-nowrap shrink-0 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] px-4 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer ${FOCUS_RING_CLASS}`}
          >
            <Plus weight="bold" size={15} />
            <span>Tambah Tabel Baru</span>
          </button>
        </div>
      </div>

      {/* INLINE FALLBACK NOTICE WHEN DATABASE READ RETURNED AN ERROR */}
      {!loading && fallbackNotice && !fetchError && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <WarningCircle size={18} weight="bold" className="text-amber-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                Menampilkan data standar sementara
              </p>
              <p className="text-xs text-amber-800 mt-0.5">{fallbackNotice}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className={`min-h-[44px] px-4 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto cursor-pointer ${FOCUS_RING_CLASS}`}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* INLINE FETCH ERROR BANNER WHEN DATA ALREADY EXISTS */}
      {!loading && fetchError && tables.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <WarningCircle size={18} weight="bold" className="text-rose-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900">Gagal memuat pembaruan matriks</p>
              <p className="text-xs text-rose-800 mt-0.5">{fetchError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            className={`min-h-[44px] px-4 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors shrink-0 self-start sm:self-auto cursor-pointer ${FOCUS_RING_CLASS}`}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* MOBILE DROPDOWN SELECTOR */}
      {!loading && tables.length > 0 && (
        <div className="lg:hidden mb-6 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <label
            htmlFor="mobile-table-select"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Pilih Tabel Tematik:
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevTable}
              disabled={activeTableIndex === 0}
              className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-40 cursor-pointer ${FOCUS_RING_CLASS}`}
              title="Tabel sebelumnya"
              aria-label="Tabel sebelumnya"
            >
              <CaretLeft size={16} weight="bold" />
            </button>

            <select
              id="mobile-table-select"
              value={activeTableIndex}
              onChange={(e) => setActiveTableIndex(Number(e.target.value))}
              className="flex-1 min-w-0 min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none"
            >
              {tables.map((t, idx) => (
                <option key={t.id ? t.id.toString() : `mobile-tab-${idx}`} value={idx}>
                  {String(idx + 1).padStart(2, '0')}. {t.judul} ({t.items?.length || 0} data)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextTable}
              disabled={activeTableIndex >= tables.length - 1}
              className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-40 cursor-pointer ${FOCUS_RING_CLASS}`}
              title="Tabel selanjutnya"
              aria-label="Tabel selanjutnya"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-8">
            <div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      ) : fetchError && tables.length === 0 ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-white p-8 text-center max-w-xl mx-auto"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto mb-3">
            <WarningCircle size={24} weight="bold" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Gagal Memuat Matriks Daftar Informasi
          </h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{fetchError}</p>
          <button
            type="button"
            onClick={() => void loadData()}
            className={`mt-5 inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
          >
            <ArrowsClockwise size={15} weight="bold" />
            <span>Coba Lagi</span>
          </button>
        </div>
      ) : (
        /* MASTER-DETAIL 2-COLUMN LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KOLOM KIRI: DAFTAR TABEL VERTIKAL (DESKTOP) */}
          <div className="hidden lg:block lg:col-span-4 min-w-0 bg-white rounded-xl border border-slate-200 p-4 sticky top-6">
            <div className="flex items-center justify-between mb-3 px-1 gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Daftar Tabel Tematik ({tables.length})
              </span>
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                Pilih tabel
              </span>
            </div>

            {/* Pencarian Tabel */}
            <div className="relative mb-3">
              <MagnifyingGlass
                size={14}
                weight="bold"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"
              />
              <input
                type="text"
                aria-label="Cari tabel"
                placeholder="Cari tabel..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-600 focus:bg-white focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
              />
            </div>

            {/* List Tabel Tersusun Vertikal */}
            <div className="space-y-1.5">
              {filteredTables.map((tbl) => {
                const originalIndex = tables.indexOf(tbl)
                const isSelected = originalIndex === activeTableIndex

                return (
                  <button
                    key={tbl.id ? tbl.id.toString() : `tab-${originalIndex}`}
                    type="button"
                    onClick={() => setActiveTableIndex(originalIndex)}
                    className={`w-full min-h-[44px] text-left p-3 rounded-lg transition-colors flex items-center justify-between gap-3 border cursor-pointer ${FOCUS_RING_CLASS} ${
                      isSelected
                        ? 'bg-[#0e4891] text-white border-[#0e4891]'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {String(originalIndex + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs block leading-tight truncate">
                          {tbl.judul}
                        </span>
                        <span
                          className={`text-[10px] block mt-0.5 ${
                            isSelected ? 'text-blue-100' : 'text-slate-600'
                          }`}
                        >
                          Aksi: {tbl.action_type === 'klik' ? 'Klik' : 'Unduh'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tbl.items?.length || 0} data
                    </span>
                  </button>
                )
              })}

              {filteredTables.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  Tidak ada tabel yang cocok dengan pencarian.
                </p>
              )}
            </div>

            {/* Tombol Tambah Tabel di Bawah Sidebar Kiri */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={openAddTableModal}
                className={`w-full min-h-[44px] py-2 px-3 rounded-lg border border-dashed border-slate-300 hover:border-[#0e4891] text-slate-700 hover:text-[#0e4891] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${FOCUS_RING_CLASS}`}
              >
                <Plus size={14} weight="bold" />
                <span>Tambah Tabel Baru</span>
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: DETAIL TABEL AKTIF & MATRIKS DOKUMEN */}
          {activeTable ? (
            <div className="lg:col-span-8 min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
              {/* Header Tabel Aktif */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0e4891] text-white">
                      Tabel {String(activeTableIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                      {activeYearRangeLabel}
                    </span>
                    {activeCustomDescription && (
                      <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                        {activeCustomDescription}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      Aksi: {activeTable.action_type === 'klik' ? 'Klik Tautan' : 'Unduh File'}
                    </span>
                  </div>
                  <h2 className="font-bold text-lg md:text-xl text-slate-900 tracking-tight uppercase break-words">
                    {activeTable.judul}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openEditTableModal(activeTable)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${FOCUS_RING_CLASS}`}
                    title="Edit judul atau opsi tabel"
                  >
                    <PencilSimple size={14} weight="bold" />
                    <span>Edit Tabel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTableConfirm(activeTable)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 hover:border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${FOCUS_RING_CLASS}`}
                    title="Hapus tabel ini"
                  >
                    <Trash size={14} weight="bold" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* Sub-header: Rincian Dokumen & Tombol Tambah Baris */}
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Rincian Baris Dokumen &amp; Tautan Tahun
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total {activeTable.items?.length || 0} baris dokumen terdaftar pada tabel ini ({activeYears.length} kolom tahun).
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setNewYearInput('')
                      setEditingYear(null)
                      setApplyToAllTables(false)
                      setModalError(null)
                      setModalType('manageYears')
                    }}
                    className={`min-h-[44px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${FOCUS_RING_CLASS}`}
                    title="Kelola kolom tahun pada tabel ini"
                  >
                    <Calendar size={15} weight="bold" />
                    <span>Kelola Kolom Tahun ({activeYears.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={openAddItemModal}
                    className={`min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${FOCUS_RING_CLASS}`}
                  >
                    <Plus size={15} weight="bold" />
                    <span>Tambah Baris Data</span>
                  </button>
                </div>
              </div>

              {/* Matriks Tabel Interaktif */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <th className="py-3 px-5 font-bold text-xs uppercase tracking-wider w-[40%]">
                        Nama Data / Dokumen
                      </th>
                      {activeYears.map((th) => (
                        <th
                          key={th}
                          className="py-3 px-2 font-bold text-xs text-center font-mono w-[8%]"
                        >
                          {th}
                        </th>
                      ))}
                      <th className="py-3 px-5 font-bold text-xs uppercase tracking-wider text-right w-[15%]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {activeTable.items && activeTable.items.length > 0 ? (
                      activeTable.items.map((row, idx) => (
                        <tr
                          key={row.id ? row.id.toString() : `row-${idx}`}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-5 text-xs font-semibold text-slate-900 leading-relaxed">
                            <div className="flex items-start gap-2.5">
                              <span className="text-slate-600 font-mono text-[11px] shrink-0 mt-0.5">
                                {idx + 1}.
                              </span>
                              <span>{row.nama}</span>
                            </div>
                          </td>

                          {activeYears.map((th) => {
                            const rawLink = (row.links as Record<string, string> | undefined)?.[th]
                            const trimmedLink = typeof rawLink === 'string' ? rawLink.trim() : ''
                            const isPlaceholder = !trimmedLink || trimmedLink === '#'
                            const isValidLink =
                              !isPlaceholder &&
                              isSafePublicUrl(trimmedLink, { allowRelativePath: true })

                            return (
                              <td key={th} className="py-4 px-2 text-center">
                                {isPlaceholder ? (
                                  <span
                                    className="text-slate-600 font-mono text-xs select-none"
                                    title="Belum ada tautan (#)"
                                  >
                                    -
                                  </span>
                                ) : isValidLink ? (
                                  <a
                                    href={trimmedLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0e4891] border border-slate-200 hover:border-blue-200 text-[11px] font-semibold transition-colors ${FOCUS_RING_CLASS}`}
                                    title={`Buka tautan (${trimmedLink})`}
                                  >
                                    <LinkSimple size={12} weight="bold" className="text-slate-600" />
                                    <span>Tersedia</span>
                                  </a>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold"
                                    title="Tautan tidak valid atau skema URL tidak diizinkan"
                                  >
                                    <WarningCircle size={12} weight="bold" />
                                    <span>URL Invalid</span>
                                  </span>
                                )}
                              </td>
                            )
                          })}

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditItemModal(row)}
                                className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:text-[#0e4891] hover:bg-slate-50 transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                                title="Edit baris dokumen dan tautan"
                                aria-label={`Edit ${row.nama}`}
                              >
                                <PencilSimple size={14} weight="bold" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteItemConfirm(row)}
                                className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                                title="Hapus baris dokumen"
                                aria-label={`Hapus ${row.nama}`}
                              >
                                <Trash size={14} weight="bold" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={activeYears.length + 2}
                          className="py-12 text-center text-xs text-slate-500 italic"
                        >
                          Belum ada baris data pada tabel ini. Klik tombol &quot;Tambah Baris Data&quot; untuk menambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 min-w-0 rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-xs font-semibold text-slate-500">
                Belum ada tabel terdaftar. Klik &quot;Tambah Tabel Baru&quot; untuk membuat tabel pertama.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT TABEL */}
      <Modal
        isOpen={modalType === 'addTable' || modalType === 'editTable'}
        onClose={() => {
          if (!submitting) {
            setModalType(null)
            setModalError(null)
          }
        }}
        title={modalType === 'addTable' ? 'Tambah Kategori Tabel Baru' : 'Edit Kategori Tabel'}
      >
        <form onSubmit={handleTableSubmit} className="space-y-4">
          {modalError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
            >
              {modalError}
            </div>
          )}

          <div>
            <label
              htmlFor="table-judul-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Judul Tabel <span className="text-rose-600">*</span>
            </label>
            <input
              id="table-judul-input"
              type="text"
              required
              placeholder="Contoh: DOKUMEN TENTANG KEPEGAWAIAN"
              value={tableJudul}
              onChange={(e) => {
                setTableJudul(e.target.value)
                setModalError(null)
              }}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="table-desc-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Periode / Deskripsi Sub-Header
            </label>
            <input
              id="table-desc-input"
              type="text"
              placeholder={
                overallYears.length > 0
                  ? `Contoh: ${overallYearRangeLabel}`
                  : 'Contoh: Keterangan periode atau kategori'
              }
              value={tableDeskripsi}
              onChange={(e) => {
                setTableDeskripsi(e.target.value)
                setModalError(null)
              }}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="table-action-select"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Tipe Label Aksi
            </label>
            <select
              id="table-action-select"
              value={tableActionType}
              onChange={(e) => setTableActionType(e.target.value as 'unduh' | 'klik')}
              className={INPUT_CLASS}
            >
              <option value="unduh">Unduh (Untuk Dokumen / Berkas PDF)</option>
              <option value="klik">Klik (Untuk Tautan Website / Aplikasi)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setModalType(null)}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Tabel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: TAMBAH / EDIT BARIS DOKUMEN & LINK TAHUN */}
      <Modal
        isOpen={modalType === 'addItem' || modalType === 'editItem'}
        onClose={() => {
          if (!submitting && uploadingYear === null) {
            setModalType(null)
            setModalError(null)
          }
        }}
        title={modalType === 'addItem' ? 'Tambah Baris Dokumen Baru' : 'Edit Baris Dokumen & Tautan'}
      >
        <form onSubmit={handleItemSubmit} className="space-y-4">
          {modalError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
            >
              {modalError}
            </div>
          )}

          <div>
            <label
              htmlFor="item-nama-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Nama Dokumen / Data <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="item-nama-input"
              rows={2}
              required
              placeholder="Contoh: Daftar Urut Kepangkatan ASN (DUK)"
              value={itemNama}
              onChange={(e) => {
                setItemNama(e.target.value)
                setModalError(null)
              }}
              className={`${INPUT_CLASS} leading-relaxed`}
            />
          </div>

          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                Tautan Dokumen / URL per Tahun (Isi # jika belum tersedia):
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {sortYears(Object.keys(itemLinks)).map((th) => (
                <div key={th} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="w-14 text-xs font-mono font-bold text-slate-700 shrink-0">
                    {th}:
                  </span>
                  <input
                    type="text"
                    aria-label={`Tautan tahun ${th}`}
                    placeholder="https://drive.google.com/... atau #"
                    value={itemLinks[th] ?? '#'}
                    onChange={(e) => handleLinkChange(th, e.target.value)}
                    className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
                  />

                  <label
                    className={`min-h-[44px] px-3 py-2 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 focus-within:ring-2 focus-within:ring-[#0e4891] focus-within:ring-offset-2 ${
                      uploadingYear === th
                        ? 'bg-blue-50 text-[#0e4891] border-blue-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                    title={`Unggah file ${th} langsung ke Google Drive`}
                  >
                    {uploadingYear === th ? (
                      <>
                        <CircleNotch size={14} weight="bold" className="animate-spin text-[#0e4891]" />
                        <span className="text-[11px]">Unggah...</span>
                      </>
                    ) : (
                      <>
                        <UploadSimple size={14} weight="bold" className="text-[#0e4891]" />
                        <span className="text-[11px]">Unggah</span>
                      </>
                    )}
                    <input
                      type="file"
                      disabled={uploadingYear !== null}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                      className="sr-only"
                      onChange={(e) => void handleYearFileUpload(th, e.target.files?.[0])}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveYearFromItem(th)}
                    className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0 ${FOCUS_RING_CLASS}`}
                    title={`Hapus tahun ${th} dari baris ini`}
                    aria-label={`Hapus tahun ${th} dari baris ini`}
                  >
                    <Trash size={14} weight="bold" />
                  </button>
                </div>
              ))}
            </div>

            {/* Tambah Tahun Cepat di Modal Item */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex items-center gap-2">
              <input
                type="text"
                aria-label="Tambah tahun baru pada baris ini"
                placeholder="Tambah tahun baru (misal: 2027)"
                value={inlineNewYear}
                onChange={(e) => setInlineNewYear(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddYearToItem()
                  }
                }}
                className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-600 focus:bg-white focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddYearToItem}
                className={`min-h-[44px] px-3 py-2 rounded-lg bg-slate-100 hover:bg-[#0e4891] text-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${FOCUS_RING_CLASS}`}
              >
                <Plus size={13} weight="bold" />
                <span>Tambah Tahun</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting || uploadingYear !== null}
              onClick={() => setModalType(null)}
              className={`min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingYear !== null}
              className={`min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Baris Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: KELOLA KOLOM TAHUN */}
      <Modal
        isOpen={modalType === 'manageYears'}
        onClose={() => {
          if (!submitting) {
            setModalType(null)
            setEditingYear(null)
            setModalError(null)
          }
        }}
        title={`Kelola Kolom Tahun: ${activeTable?.judul || ''}`}
      >
        <div className="space-y-6">
          {modalError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"
            >
              {modalError}
            </div>
          )}

          {/* DAFTAR KOLOM TAHUN SAAT INI */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Kolom Tahun Terdaftar ({activeYears.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Ubah atau hapus label kolom tahun
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
              {activeYears.map((th) => {
                const isEditing = editingYear?.oldYear === th

                return (
                  <div
                    key={th}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          aria-label={`Ubah tahun ${th}`}
                          value={editingYear.newYear}
                          onChange={(e) =>
                            setEditingYear({ ...editingYear, newYear: e.target.value })
                          }
                          className="w-full min-w-0 px-2.5 py-1.5 text-xs font-mono font-bold bg-white text-slate-900 border border-[#0e4891] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0e4891]/20"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              void handleEditYear(editingYear.oldYear, editingYear.newYear)
                            } else if (e.key === 'Escape') {
                              setEditingYear(null)
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() =>
                            void handleEditYear(editingYear.oldYear, editingYear.newYear)
                          }
                          className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg bg-[#0e4891] text-white hover:bg-[#0a366f] transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                          title="Simpan perubahan"
                          aria-label="Simpan perubahan tahun"
                        >
                          <Check size={14} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingYear(null)}
                          className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                          title="Batal"
                          aria-label="Batal ubah tahun"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center font-mono font-bold text-xs border border-blue-200 shrink-0">
                          {th.slice(-2)}
                        </span>
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-sm text-slate-900 block truncate">
                            {th}
                          </span>
                          <span className="text-[10px] block text-slate-600 font-medium">
                            Kolom aktif
                          </span>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingYear({ oldYear: th, newYear: th })}
                          className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-slate-600 hover:text-[#0e4891] hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                          title={`Ubah label tahun ${th}`}
                          aria-label={`Ubah label tahun ${th}`}
                        >
                          <PencilSimple size={14} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteYearConfirm(th)}
                          className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-slate-600 hover:text-rose-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer ${FOCUS_RING_CLASS}`}
                          title={`Hapus kolom tahun ${th}`}
                          aria-label={`Hapus kolom tahun ${th}`}
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* FORM TAMBAH TAHUN BARU */}
          <form onSubmit={handleAddYear} className="p-4 rounded-xl border border-blue-200 bg-blue-50 space-y-3">
            <label
              htmlFor="new-year-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-900"
            >
              Tambah Kolom Tahun Baru
            </label>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                id="new-year-input"
                type="text"
                placeholder="Contoh: 2027 atau 2021"
                value={newYearInput}
                onChange={(e) => {
                  setNewYearInput(e.target.value)
                  setModalError(null)
                }}
                className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-medium text-slate-900 placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={submitting || !newYearInput.trim()}
                className={`min-h-[44px] bg-[#0e4891] hover:bg-[#0a366f] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 ${FOCUS_RING_CLASS}`}
              >
                <Plus size={14} weight="bold" />
                <span>{submitting ? 'Menyimpan...' : 'Tambah Tahun'}</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="applyAllTables"
                checked={applyToAllTables}
                onChange={(e) => setApplyToAllTables(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0e4891] focus:ring-[#0e4891] cursor-pointer"
              />
              <label htmlFor="applyAllTables" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Terapkan juga ke seluruh {tables.length} kategori tabel (Sinkronkan semua tabel)
              </label>
            </div>
          </form>

          {/* PETUNJUK INFORMASI */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
            <Info size={16} weight="bold" className="text-slate-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Menambahkan kolom tahun baru akan otomatis menyediakan slot pengisian tautan dokumen (default bernilai <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">#</code>) pada setiap baris dokumen. Menghapus tahun akan menghapus data tautan untuk tahun tersebut.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setModalType(null)
                setEditingYear(null)
                setModalError(null)
              }}
              className={`min-h-[44px] px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING_CLASS}`}
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
