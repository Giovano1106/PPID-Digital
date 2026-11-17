'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import ConfirmModal from '@/components/ConfirmModal'
import Toast, { ToastType } from '@/components/Toast'
import {
  Table as TableIcon,
  Plus,
  PencilSimple,
  Trash,
  ArrowsClockwise,
  ArrowSquareOut,
  Database,
  LinkSimple,
  CheckCircle,
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  ArrowRight,
  Info,
  Calendar,
  Check,
  X,
  UploadSimple,
  CircleNotch,
  CloudArrowUp
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
  deleteTahunFromTable
} from '@/app/actions/daftar-informasi'
import {
  DaftarInformasiTable,
  DaftarInformasiItem,
  getTableYears
} from '@/app/informasi/data/daftarInformasiDefault'

export default function AdminDaftarInformasiPage() {
  const [tables, setTables] = useState<DaftarInformasiTable[]>([])
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [activeTableIndex, setActiveTableIndex] = useState(0)
  const [tableSearch, setTableSearch] = useState('')

  // Toast & Modals
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
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
  const [tableDeskripsi, setTableDeskripsi] = useState('Tahun 2022 - 2026')
  const [tableActionType, setTableActionType] = useState<'unduh' | 'klik'>('unduh')

  // Form State - Item
  const [itemNama, setItemNama] = useState('')
  const [itemLinks, setItemLinks] = useState<Record<string, string>>({})
  const [selectedItem, setSelectedItem] = useState<DaftarInformasiItem | null>(null)
  const [uploadingYear, setUploadingYear] = useState<string | null>(null)

  const handleYearFileUpload = async (th: string, file?: File | null) => {
    if (!file) return
    setUploadingYear(th)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('raw_only', 'true')
    formData.append('kategori_key', 'raw_upload')

    try {
      const res = await fetch('/api/admin/upload-drive', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        showToast(data.error || 'Gagal mengunggah file ke Google Drive.', 'error')
      } else if (data.fileUrl) {
        setItemLinks((prev) => ({
          ...prev,
          [th]: data.fileUrl,
        }))
        showToast(`Berkas tahun ${th} berhasil diunggah langsung ke Google Drive!`)
      }
    } catch (err: any) {
      showToast('Error: ' + err?.message, 'error')
    } finally {
      setUploadingYear(null)
    }
  }

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
  }

  const loadData = async () => {
    setLoading(true)
    const res = await getDaftarInformasiTables()
    if (res.success && res.data) {
      setTables(res.data)
      setIsFallback(res.isFallback)
      if (activeTableIndex >= res.data.length) {
        setActiveTableIndex(0)
      }
    } else {
      showToast('Gagal memuat data: ' + (res.error || 'Terjadi kesalahan.'), 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtered tables for search
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

  // Handler: Sinkronisasi / Inisialisasi Data Awal ke Supabase
  const handleSeedData = async () => {
    setSeeding(true)
    const res = await seedInitialDaftarInformasi()
    setSeeding(false)
    if (res.success) {
      showToast('Seluruh 10 tabel data awal berhasil diimpor ke database Supabase!')
      loadData()
    } else {
      showToast(res.error || 'Gagal inisialisasi.', 'error')
    }
  }

  // ==========================================
  // TABLE MODAL HANDLERS
  // ==========================================
  const openAddTableModal = () => {
    setTableJudul('')
    setTableDeskripsi('Tahun 2022 - 2026')
    setTableActionType('unduh')
    setModalType('addTable')
  }

  const openEditTableModal = (tbl: DaftarInformasiTable) => {
    setTableJudul(tbl.judul)
    setTableDeskripsi(tbl.deskripsi || 'Tahun 2022 - 2026')
    setTableActionType(tbl.action_type || 'unduh')
    setModalType('editTable')
  }

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableJudul.trim()) {
      showToast('Judul tabel tidak boleh kosong.', 'error')
      return
    }

    setSubmitting(true)
    if (modalType === 'addTable') {
      const res = await createDaftarInformasiTable({
        judul: tableJudul.trim(),
        deskripsi: tableDeskripsi.trim(),
        action_type: tableActionType,
        urutan: tables.length + 1
      })
      if (res.success) {
        showToast('Tabel baru berhasil ditambahkan ke CMS.')
        setModalType(null)
        loadData()
      } else {
        showToast('Gagal: ' + res.error, 'error')
      }
    } else if (modalType === 'editTable' && activeTable?.id) {
      const res = await updateDaftarInformasiTable(activeTable.id, {
        judul: tableJudul.trim(),
        deskripsi: tableDeskripsi.trim(),
        action_type: tableActionType,
        urutan: activeTable.urutan
      })
      if (res.success) {
        showToast('Header tabel berhasil diperbarui.')
        setModalType(null)
        loadData()
      } else {
        showToast('Gagal: ' + res.error, 'error')
      }
    }
    setSubmitting(false)
  }

  const confirmDeleteTable = async () => {
    if (!deleteTableConfirm?.id) return
    setSubmitting(true)
    const res = await deleteDaftarInformasiTable(deleteTableConfirm.id)
    setSubmitting(false)
    setDeleteTableConfirm(null)
    if (res.success) {
      showToast('Tabel beserta seluruh isinya telah dihapus.')
      loadData()
    } else {
      showToast('Gagal menghapus tabel: ' + res.error, 'error')
    }
  }

  // ==========================================
  // ITEM MODAL HANDLERS
  // ==========================================
  const openAddItemModal = () => {
    setItemNama('')
    const initialLinks: Record<string, string> = {}
    activeYears.forEach((th) => {
      initialLinks[th] = '#'
    })
    setItemLinks(initialLinks)
    setSelectedItem(null)
    setInlineNewYear('')
    setModalType('addItem')
  }

  const openEditItemModal = (item: DaftarInformasiItem) => {
    setItemNama(item.nama)
    const currentLinks: Record<string, string> = {}
    const itemYears = Object.keys(item.links || {})
    const mergedYears = Array.from(new Set([...activeYears, ...itemYears])).sort((a, b) => {
      const numA = parseInt(a, 10)
      const numB = parseInt(b, 10)
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      return a.localeCompare(b)
    })
    mergedYears.forEach((th) => {
      currentLinks[th] = item.links?.[th] || '#'
    })
    setItemLinks(currentLinks)
    setSelectedItem(item)
    setInlineNewYear('')
    setModalType('editItem')
  }

  const handleLinkChange = (tahun: string, val: string) => {
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

  // ==========================================
  // YEAR COLUMN MANAGEMENT HANDLERS
  // ==========================================
  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault()
    const yr = newYearInput.trim()
    if (!yr) {
      showToast('Masukkan angka atau label tahun.', 'error')
      return
    }
    if (!activeTable?.id) {
      showToast('Tabel belum tersimpan di database.', 'error')
      return
    }

    setSubmitting(true)
    const res = await addTahunToTable(activeTable.id, yr, applyToAllTables)
    setSubmitting(false)
    if (res.success) {
      showToast(
        `Tahun ${yr} berhasil ditambahkan ${
          applyToAllTables ? 'ke semua tabel' : 'ke tabel ini'
        }.`
      )
      setNewYearInput('')
      loadData()
    } else {
      showToast('Gagal menambahkan tahun: ' + res.error, 'error')
    }
  }

  const handleEditYear = async (oldYear: string, newYear: string) => {
    const yr = newYear.trim()
    if (!yr) {
      showToast('Tahun tidak boleh kosong.', 'error')
      return
    }
    if (yr === oldYear) {
      setEditingYear(null)
      return
    }
    if (!activeTable?.id) return

    setSubmitting(true)
    const res = await editTahunInTable(activeTable.id, oldYear, yr, applyToAllTables)
    setSubmitting(false)
    if (res.success) {
      showToast(
        `Tahun ${oldYear} berhasil diubah menjadi ${yr} ${
          applyToAllTables ? 'di semua tabel' : 'di tabel ini'
        }.`
      )
      setEditingYear(null)
      loadData()
    } else {
      showToast('Gagal mengubah tahun: ' + res.error, 'error')
    }
  }

  const handleDeleteYear = async (yearToDelete: string) => {
    if (!activeTable?.id) return

    setSubmitting(true)
    const res = await deleteTahunFromTable(activeTable.id, yearToDelete, applyToAllTables)
    setSubmitting(false)
    setDeleteYearConfirm(null)
    if (res.success) {
      showToast(
        `Kolom tahun ${yearToDelete} berhasil dihapus ${
          applyToAllTables ? 'dari semua tabel' : 'dari tabel ini'
        }.`
      )
      loadData()
    } else {
      showToast('Gagal menghapus tahun: ' + res.error, 'error')
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemNama.trim()) {
      showToast('Nama data/dokumen tidak boleh kosong.', 'error')
      return
    }

    if (!activeTable?.id) {
      showToast('Silakan simpan atau inisialisasi tabel terlebih dahulu sebelum menambah data ke database.', 'error')
      return
    }

    setSubmitting(true)
    if (modalType === 'addItem') {
      const res = await createDaftarInformasiItem({
        tabel_id: activeTable.id,
        nama: itemNama.trim(),
        links: itemLinks,
        urutan: (activeTable.items?.length || 0) + 1
      })
      if (res.success) {
        showToast('Baris data baru berhasil ditambahkan.')
        setModalType(null)
        loadData()
      } else {
        showToast('Gagal: ' + res.error, 'error')
      }
    } else if (modalType === 'editItem' && selectedItem?.id) {
      const res = await updateDaftarInformasiItem(selectedItem.id, {
        nama: itemNama.trim(),
        links: itemLinks,
        urutan: selectedItem.urutan
      })
      if (res.success) {
        showToast('Baris data dan tautan berhasil diperbarui.')
        setModalType(null)
        loadData()
      } else {
        showToast('Gagal: ' + res.error, 'error')
      }
    }
    setSubmitting(false)
  }

  const confirmDeleteItem = async () => {
    if (!deleteItemConfirm?.id) return
    setSubmitting(true)
    const res = await deleteDaftarInformasiItem(deleteItemConfirm.id)
    setSubmitting(false)
    setDeleteItemConfirm(null)
    if (res.success) {
      showToast('Baris data berhasil dihapus.')
      loadData()
    } else {
      showToast('Gagal menghapus baris data: ' + res.error, 'error')
    }
  }

  // Navigasi Prev/Next
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
      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* CONFIRM MODAL HAPUS TABEL */}
      <ConfirmModal
        isOpen={!!deleteTableConfirm}
        title="Hapus Kategori Tabel?"
        message={`Apakah Anda yakin ingin menghapus tabel "${deleteTableConfirm?.judul}" beserta seluruh ${deleteTableConfirm?.items?.length || 0} baris dokumen di dalamnya? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Tabel"
        cancelText="Batal"
        onConfirm={confirmDeleteTable}
        onClose={() => setDeleteTableConfirm(null)}
        loading={submitting}
        variant="danger"
      />

      {/* CONFIRM MODAL HAPUS ITEM */}
      <ConfirmModal
        isOpen={!!deleteItemConfirm}
        title="Hapus Baris Data Dokumen?"
        message={`Apakah Anda yakin ingin menghapus baris data "${deleteItemConfirm?.nama}"?`}
        confirmText="Ya, Hapus Baris"
        cancelText="Batal"
        onConfirm={confirmDeleteItem}
        onClose={() => setDeleteItemConfirm(null)}
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
        onConfirm={() => deleteYearConfirm && handleDeleteYear(deleteYearConfirm)}
        onClose={() => setDeleteYearConfirm(null)}
        loading={submitting}
        variant="danger"
      />

      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              CMS Matriks KIP
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              Periode 2022 – 2026
            </span>
          </div>
          <h1 className="font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            Kelola Matriks Daftar Informasi Publik
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Pilih tabel tematik di sebelah kiri untuk mengelola rincian baris data dan tautan per tahun.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <Link
            href="/informasi/daftar_informasi_publik"
            target="_blank"
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs flex items-center gap-1.5"
          >
            <span>Lihat di Portal</span>
            <ArrowSquareOut size={14} weight="bold" />
          </Link>

          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Muat ulang data"
          >
            <ArrowsClockwise weight="bold" size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {/* Opsi Sinkronisasi Sekunder (jika data belum di DB) */}
          {isFallback && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Impor 10 tabel data awal ke Supabase"
            >
              <Database size={15} weight="bold" />
              <span>{seeding ? 'Mengimpor...' : 'Sinkronkan Data Awal'}</span>
            </button>
          )}

          <button
            onClick={openAddTableModal}
            className="rounded-xl bg-[#0e4891] hover:bg-[#0a366f] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus weight="bold" size={15} />
            Tambah Tabel Baru
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN SELECTOR (HANYA MUNCUL DI LAYAR KECIL / TABLET) */}
      <div className="lg:hidden mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Pilih Tabel Tematik:
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevTable}
            disabled={activeTableIndex === 0}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-30 cursor-pointer"
            title="Tabel sebelumnya"
          >
            <CaretLeft size={16} weight="bold" />
          </button>

          <select
            value={activeTableIndex}
            onChange={(e) => setActiveTableIndex(Number(e.target.value))}
            className="flex-1 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-[#0e4891] focus:outline-none"
          >
            {tables.map((t, idx) => (
              <option key={idx} value={idx}>
                {String(idx + 1).padStart(2, '0')}. {t.judul} ({t.items?.length || 0} data)
              </option>
            ))}
          </select>

          <button
            onClick={handleNextTable}
            disabled={activeTableIndex === tables.length - 1}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-30 cursor-pointer"
            title="Tabel selanjutnya"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-8">
            <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          </div>
        </div>
      ) : (
        /* MASTER-DETAIL 2-COLUMN LAYOUT (ZERO HORIZONTAL SCROLL) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: DAFTAR TABEL VERTIKAL (DESKTOP) */}
          <div className="hidden lg:block lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sticky top-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Daftar Tabel Tematik ({tables.length})
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Pilih tabel
              </span>
            </div>

            {/* Pencarian Tabel */}
            <div className="relative mb-3">
              <MagnifyingGlass
                size={14}
                weight="bold"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari tabel..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
              />
            </div>

            {/* List Tabel Tersusun Vertikal */}
            <div className="space-y-1.5">
              {filteredTables.map((tbl) => {
                const originalIndex = tables.findIndex((t) => t.id === tbl.id || t.judul === tbl.judul)
                const isSelected = originalIndex === activeTableIndex

                return (
                  <button
                    key={tbl.id ? tbl.id.toString() : `tab-${originalIndex}`}
                    onClick={() => setActiveTableIndex(originalIndex)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#0e4891] text-white border-[#0e4891] shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {String(originalIndex + 1).padStart(2, '0')}
                      </span>
                      <div className="overflow-hidden">
                        <span className="font-extrabold text-xs block leading-tight truncate">
                          {tbl.judul}
                        </span>
                        <span
                          className={`text-[10px] block mt-0.5 ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
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
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tbl.items?.length || 0} data
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Tombol Tambah Tabel di Bawah Sidebar Kiri */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={openAddTableModal}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-[#0e4891] text-slate-600 hover:text-[#0e4891] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} weight="bold" />
                Tambah Tabel Baru
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: DETAIL TABEL AKTIF & MATRIKS DOKUMEN */}
          {activeTable && (
            <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              
              {/* Header Tabel Aktif */}
              <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0e4891] text-white">
                      Tabel {String(activeTableIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                      {activeTable.deskripsi || 'Tahun 2022 - 2026'}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Aksi: {activeTable.action_type === 'klik' ? 'Klik Tautan' : 'Unduh File'}
                    </span>
                  </div>
                  <h2 className="font-black text-lg md:text-xl text-slate-900 tracking-tight uppercase">
                    {activeTable.judul}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditTableModal(activeTable)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    title="Edit judul atau opsi tabel"
                  >
                    <PencilSimple size={14} weight="bold" />
                    Edit Tabel
                  </button>
                  <button
                    onClick={() => setDeleteTableConfirm(activeTable)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    title="Hapus tabel ini"
                  >
                    <Trash size={14} weight="bold" />
                    Hapus
                  </button>
                </div>
              </div>

              {/* Sub-header: Rincian Dokumen & Tombol Tambah Baris */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Rincian Baris Dokumen & Tautan Tahun
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total {activeTable.items?.length || 0} baris dokumen terdaftar pada tabel ini.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setNewYearInput('')
                      setEditingYear(null)
                      setApplyToAllTables(false)
                      setModalType('manageYears')
                    }}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Kelola kolom tahun pada tabel ini"
                  >
                    <Calendar size={15} weight="bold" />
                    <span>Kelola Kolom Tahun ({activeYears.length})</span>
                  </button>
                  <button
                    onClick={openAddItemModal}
                    className="bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus size={15} weight="bold" />
                    Tambah Baris Data
                  </button>
                </div>
              </div>

              {/* Matriks Tabel Interaktif */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
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
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {activeTable.items && activeTable.items.length > 0 ? (
                      activeTable.items.map((row, idx) => (
                        <tr
                          key={row.id ? row.id.toString() : `row-${idx}`}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-4 px-5 text-xs font-semibold text-slate-800 leading-relaxed">
                            <div className="flex items-start gap-2.5">
                              <span className="text-slate-400 font-mono text-[11px] shrink-0 mt-0.5">
                                {idx + 1}.
                              </span>
                              <span>{row.nama}</span>
                            </div>
                          </td>

                          {/* Year Indicators */}
                          {activeYears.map((th) => {
                            const linkVal = (row.links as Record<string, string>)[th]
                            const hasLink = linkVal && linkVal !== '#'

                            return (
                              <td key={th} className="py-4 px-2 text-center">
                                {hasLink ? (
                                  <a
                                    href={linkVal}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0e4891] border border-slate-200 hover:border-blue-200 text-[11px] font-semibold transition-colors"
                                    title={`Buka link (${linkVal})`}
                                  >
                                    <LinkSimple size={12} weight="bold" className="text-slate-400" />
                                    <span>Tersedia</span>
                                  </a>
                                ) : (
                                  <span
                                    className="text-slate-300 font-mono text-xs select-none"
                                    title="Belum ada link (#)"
                                  >
                                    -
                                  </span>
                                )}
                              </td>
                            )
                          })}

                          {/* Action Buttons */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditItemModal(row)}
                                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0e4891] hover:bg-slate-50 transition-colors cursor-pointer"
                                title="Edit baris dokumen & link"
                              >
                                <PencilSimple size={14} weight="bold" />
                              </button>
                              <button
                                onClick={() => setDeleteItemConfirm(row)}
                                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus baris dokumen"
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
                          Belum ada baris data pada tabel ini. Klik tombol "Tambah Baris Data" untuk menambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT TABEL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalType === 'addTable' || modalType === 'editTable'}
        onClose={() => setModalType(null)}
        title={modalType === 'addTable' ? 'Tambah Kategori Tabel Baru' : 'Edit Kategori Tabel'}
      >
        <form onSubmit={handleTableSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Judul Tabel <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: DOKUMEN TENTANG KEPEGAWAIAN"
              value={tableJudul}
              onChange={(e) => setTableJudul(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Periode / Deskripsi Sub-Header
            </label>
            <input
              type="text"
              placeholder="Contoh: Tahun 2022 - 2026"
              value={tableDeskripsi}
              onChange={(e) => setTableDeskripsi(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tipe Label Aksi
            </label>
            <select
              value={tableActionType}
              onChange={(e) => setTableActionType(e.target.value as 'unduh' | 'klik')}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
            >
              <option value="unduh">Unduh (Untuk Dokumen / Berkas PDF)</option>
              <option value="klik">Klik (Untuk Tautan Website / Aplikasi)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Tabel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH / EDIT BARIS DOKUMEN & LINK TAHUN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalType === 'addItem' || modalType === 'editItem'}
        onClose={() => setModalType(null)}
        title={modalType === 'addItem' ? 'Tambah Baris Dokumen Baru' : 'Edit Baris Dokumen & Tautan'}
      >
        <form onSubmit={handleItemSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Dokumen / Data <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="Contoh: Daftar Urut Kepangkatan ASN (DUK)"
              value={itemNama}
              onChange={(e) => setItemNama(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                Tautan Dokumen / URL per Tahun (Isi '#' jika belum tersedia):
              </label>
            </div>

            <div className="space-y-2.5">
              {Object.keys(itemLinks)
                .sort((a, b) => {
                  const numA = parseInt(a, 10)
                  const numB = parseInt(b, 10)
                  if (!isNaN(numA) && !isNaN(numB)) return numA - numB
                  return a.localeCompare(b)
                })
                .map((th) => (
                  <div key={th} className="flex items-center gap-2">
                    <span className="w-14 text-xs font-mono font-bold text-slate-700 shrink-0">
                      {th}:
                    </span>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/... atau #"
                      value={itemLinks[th] || '#'}
                      onChange={(e) => handleLinkChange(th, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
                    />

                    {/* Tombol Unggah Langsung ke Google Drive */}
                    <label
                      className={`px-2.5 py-2 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        uploadingYear === th
                          ? 'bg-blue-50 text-[#0e4891] border-blue-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
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
                        className="hidden"
                        onChange={(e) => handleYearFileUpload(th, e.target.files?.[0])}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveYearFromItem(th)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={`Hapus tahun ${th} dari baris ini`}
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
                placeholder="Tambah tahun baru (misal: 2027)"
                value={inlineNewYear}
                onChange={(e) => setInlineNewYear(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddYearToItem()
                  }
                }}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#0e4891] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddYearToItem}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0e4891] text-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus size={13} weight="bold" />
                <span>Tambah Tahun</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Baris Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: KELOLA KOLOM TAHUN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={modalType === 'manageYears'}
        onClose={() => {
          setModalType(null)
          setEditingYear(null)
        }}
        title={`Kelola Kolom Tahun: ${activeTable?.judul || ''}`}
      >
        <div className="space-y-6">
          {/* DAFTAR KOLOM TAHUN SAAT INI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Kolom Tahun Terdaftar ({activeYears.length})
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Klik ikon pensil untuk mengubah, atau tempat sampah untuk menghapus.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
              {activeYears.map((th) => {
                const isEditing = editingYear?.oldYear === th

                return (
                  <div
                    key={th}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingYear.newYear}
                          onChange={(e) =>
                            setEditingYear({ ...editingYear, newYear: e.target.value })
                          }
                          className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-[#0e4891] rounded-lg focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleEditYear(editingYear.oldYear, editingYear.newYear)
                            } else if (e.key === 'Escape') {
                              setEditingYear(null)
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleEditYear(editingYear.oldYear, editingYear.newYear)}
                          className="p-1 rounded-lg bg-[#0e4891] text-white hover:bg-[#0a366f] transition-colors cursor-pointer"
                          title="Simpan perubahan"
                        >
                          <Check size={14} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingYear(null)}
                          className="p-1 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors cursor-pointer"
                          title="Batal"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#0e4891] flex items-center justify-center font-mono font-bold text-xs border border-blue-100">
                          {th.slice(-2)}
                        </span>
                        <div>
                          <span className="font-mono font-extrabold text-sm text-slate-900">
                            {th}
                          </span>
                          <span className="text-[10px] block text-slate-500 font-medium">
                            Kolom aktif
                          </span>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingYear({ oldYear: th, newYear: th })}
                          className="p-1.5 text-slate-500 hover:text-[#0e4891] hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                          title={`Ubah label tahun ${th}`}
                        >
                          <PencilSimple size={14} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteYearConfirm(th)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                          title={`Hapus kolom tahun ${th}`}
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
          <form onSubmit={handleAddYear} className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Tambah Kolom Tahun Baru
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Contoh: 2027 atau 2021"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-mono font-medium text-slate-900 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all shadow-2xs"
              />
              <button
                type="submit"
                disabled={submitting || !newYearInput.trim()}
                className="bg-[#0e4891] hover:bg-[#0a366f] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Plus size={14} weight="bold" />
                <span>{submitting ? 'Menyimpan...' : 'Tambah Tahun'}</span>
              </button>
            </div>

            {/* CHECKBOX SINKRONKAN SEMUA TABEL */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="applyAllTables"
                checked={applyToAllTables}
                onChange={(e) => setApplyToAllTables(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0e4891] focus:ring-[#0e4891] cursor-pointer"
              />
              <label htmlFor="applyAllTables" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Terapkan juga ke seluruh 10 kategori tabel (Sinkronkan semua tabel)
              </label>
            </div>
          </form>

          {/* PETUNJUK INFORMASI */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-2.5">
            <Info size={16} weight="bold" className="text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Menambahkan kolom tahun baru akan otomatis menyediakan slot pengisian tautan dokumen (default bernilai <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800">#</code>) pada setiap baris dokumen. Menghapus tahun akan menghapus data tautan untuk tahun tersebut.
            </p>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setModalType(null)
                setEditingYear(null)
              }}
              className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
