'use client'

import { useEffect, useState, useMemo } from 'react'
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
  WarningCircle,
  FolderOpen
} from '@phosphor-icons/react'
import {
  getDaftarInformasiTables,
  createDaftarInformasiTable,
  updateDaftarInformasiTable,
  deleteDaftarInformasiTable,
  createDaftarInformasiItem,
  updateDaftarInformasiItem,
  deleteDaftarInformasiItem,
  seedInitialDaftarInformasi
} from '@/app/actions/daftar-informasi'
import {
  DaftarInformasiTable,
  DaftarInformasiItem,
  TAHUN_LIST
} from '@/app/informasi/data/daftarInformasiDefault'

export default function AdminDaftarInformasiPage() {
  const [tables, setTables] = useState<DaftarInformasiTable[]>([])
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [activeTableIndex, setActiveTableIndex] = useState(0)

  // Toast & Modals
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [modalType, setModalType] = useState<'addTable' | 'editTable' | 'addItem' | 'editItem' | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Delete Confirmations
  const [deleteTableConfirm, setDeleteTableConfirm] = useState<DaftarInformasiTable | null>(null)
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<DaftarInformasiItem | null>(null)

  // Form State - Table
  const [tableJudul, setTableJudul] = useState('')
  const [tableDeskripsi, setTableDeskripsi] = useState('Tahun 2022 - 2026')
  const [tableActionType, setTableActionType] = useState<'unduh' | 'klik'>('unduh')

  // Form State - Item
  const [itemNama, setItemNama] = useState('')
  const [itemLinks, setItemLinks] = useState<Record<string, string>>({
    '2022': '#',
    '2023': '#',
    '2024': '#',
    '2025': '#',
    '2026': '#'
  })
  const [selectedItem, setSelectedItem] = useState<DaftarInformasiItem | null>(null)

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

  const activeTable = tables[activeTableIndex] || null

  // Handler: 1-Klik Inisialisasi Data Awal ke Supabase
  const handleSeedData = async () => {
    setSeeding(true)
    const res = await seedInitialDaftarInformasi()
    setSeeding(false)
    if (res.success) {
      showToast('Seluruh 10 tabel data awal berhasil diimpor ke database Supabase!')
      loadData()
    } else {
      showToast('Gagal inisialisasi: ' + res.error, 'error')
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
    setItemLinks({
      '2022': '#',
      '2023': '#',
      '2024': '#',
      '2025': '#',
      '2026': '#'
    })
    setSelectedItem(null)
    setModalType('addItem')
  }

  const openEditItemModal = (item: DaftarInformasiItem) => {
    setItemNama(item.nama)
    const currentLinks: Record<string, string> = {}
    TAHUN_LIST.forEach((th) => {
      currentLinks[th] = item.links?.[th] || '#'
    })
    setItemLinks(currentLinks)
    setSelectedItem(item)
    setModalType('editItem')
  }

  const handleLinkChange = (tahun: string, val: string) => {
    setItemLinks((prev) => ({ ...prev, [tahun]: val }))
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

      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100/70 text-[#0e4891] border border-blue-200">
              CMS Matriks KIP
            </span>
          </div>
          <h1 className="font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
            Kelola Matriks Daftar Informasi Publik
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
            Kelola tabel tematik dan perbarui tautan dokumen per tahun (2022 s.d. 2026) secara dinamis.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ArrowsClockwise weight="bold" size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Data
          </button>
          <button
            onClick={openAddTableModal}
            className="rounded-xl bg-[#0e4891] hover:bg-[#0a366f] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus weight="bold" size={16} />
            Tambah Tabel Baru
          </button>
        </div>
      </div>

      {/* FALLBACK BANNER (JIKA DATABASE BELUM DIMIGRASI/DIISI) */}
      {isFallback && (
        <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Database size={20} weight="bold" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Data Menggunakan Dataset Bawaan (10 Tabel)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Tabel database Supabase belum diisi. Klik tombol inisialisasi di samping untuk mengimpor 10 tabel & 47 baris data bawaan rekan Anda ke database dalam 1 klik.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2.5 text-xs shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Database size={16} weight="bold" />
            {seeding ? 'Mengimpor Data...' : 'Inisialisasi Data Awal (1-Klik)'}
          </button>
        </div>
      )}

      {/* TABEL SELECTOR (TABS / PILLS) */}
      {loading ? (
        <div className="h-14 bg-white rounded-2xl border border-slate-200 animate-pulse mb-8" />
      ) : (
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Pilih Tabel Tematik yang Dikelola ({tables.length} Tabel):
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {tables.map((tbl, idx) => {
              const isActive = idx === activeTableIndex
              return (
                <button
                  key={tbl.id ? tbl.id.toString() : `tab-${idx}`}
                  onClick={() => setActiveTableIndex(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-[#0e4891] text-white border-[#0e4891] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="max-w-[200px] truncate">{tbl.judul}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tbl.items?.length || 0}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ACTIVE TABLE PANEL */}
      {activeTable && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-8">
          {/* Active Table Header Banner */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-amber-400">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0e4891] text-white font-mono">
                  Tabel {String(activeTableIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  {activeTable.deskripsi || 'Tahun 2022 - 2026'}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100/70 text-[#0e4891] border border-blue-200">
                  Aksi: {activeTable.action_type === 'klik' ? 'Klik Tautan' : 'Unduh File'}
                </span>
              </div>
              <h2 className="font-black text-xl text-slate-900 tracking-tight uppercase">
                {activeTable.judul}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEditTableModal(activeTable)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Edit judul/opsi tabel"
              >
                <PencilSimple size={15} weight="bold" />
                Edit Tabel
              </button>
              <button
                onClick={() => setDeleteTableConfirm(activeTable)}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                title="Hapus tabel ini"
              >
                <Trash size={15} weight="bold" />
                Hapus Tabel
              </button>
            </div>
          </div>

          {/* Table Data Rows Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Rincian Baris Dokumen & Tautan Tahun
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total {activeTable.items?.length || 0} baris dokumen terdaftar pada tabel ini.
              </p>
            </div>
            <button
              onClick={openAddItemModal}
              className="bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} weight="bold" />
              Tambah Baris Data
            </button>
          </div>

          {/* Table Data Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                  <th className="py-3.5 px-6 font-bold text-xs uppercase tracking-wider w-[40%]">
                    Nama Data / Dokumen
                  </th>
                  {TAHUN_LIST.map((th) => (
                    <th
                      key={th}
                      className="py-3.5 px-3 font-bold text-xs text-center font-mono w-[8%]"
                    >
                      {th}
                    </th>
                  ))}
                  <th className="py-3.5 px-6 font-bold text-xs uppercase tracking-wider text-right w-[15%]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {activeTable.items && activeTable.items.length > 0 ? (
                  activeTable.items.map((row, idx) => (
                    <tr key={row.id ? row.id.toString() : `row-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 text-xs font-semibold text-slate-800 leading-relaxed">
                        <div className="flex items-start gap-2.5">
                          <span className="text-slate-400 font-mono text-[11px] shrink-0 mt-0.5">
                            {idx + 1}.
                          </span>
                          <span>{row.nama}</span>
                        </div>
                      </td>

                      {/* Year Indicators */}
                      {TAHUN_LIST.map((th) => {
                        const linkVal = (row.links as Record<string, string>)[th]
                        const hasLink = linkVal && linkVal !== '#'

                        return (
                          <td key={th} className="py-4 px-3 text-center">
                            {hasLink ? (
                              <a
                                href={linkVal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                                title={`Buka link (${linkVal})`}
                              >
                                <LinkSimple size={12} weight="bold" />
                                <span>Ada</span>
                              </a>
                            ) : (
                              <span
                                className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-400 text-[11px] font-medium"
                                title="Belum ada link (#)"
                              >
                                -
                              </span>
                            )}
                          </td>
                        )
                      })}

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditItemModal(row)}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#0e4891] hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Edit baris dokumen & link"
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                          <button
                            onClick={() => setDeleteItemConfirm(row)}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus baris dokumen"
                          >
                            <Trash size={15} weight="bold" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={TAHUN_LIST.length + 2}
                      className="py-10 text-center text-xs text-slate-500 italic"
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Tautan Dokumen / URL per Tahun (Isi '#' jika belum tersedia):
            </label>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {TAHUN_LIST.map((th) => (
                <div key={th} className="flex items-center gap-3">
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
                </div>
              ))}
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
    </div>
  )
}
