'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Star,
  ArrowsClockwise,
  Printer,
  WarningCircle,
  MagnifyingGlass,
  ChatTeardropText,
  MicrosoftExcelLogo,
  CaretLeft,
  CaretRight,
  X,
} from '@phosphor-icons/react'
import { getStatistikIKMAdmin, StatistikIKM } from '@/app/actions/survei'

const ITEMS_PER_PAGE = 10

interface UnsurMetric {
  code: string
  label: string
  score: number
}

export default function AdminSurveiPage() {
  const [data, setData] = useState<StatistikIKM | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filter, Search & Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRating, setFilterRating] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const handleManualRefresh = useCallback(async () => {
    setRefreshing(true)
    setErrorMsg(null)

    try {
      const res = await getStatistikIKMAdmin()
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setErrorMsg(res.error || 'Gagal memuat rekapitulasi data survei IKM.')
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memuat data.'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    getStatistikIKMAdmin()
      .then((res) => {
        if (ignore) return
        if (res.success && res.data) {
          setData(res.data)
          setErrorMsg(null)
        } else {
          setErrorMsg(res.error || 'Gagal memuat rekapitulasi data survei IKM.')
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (ignore) return
        setErrorMsg(
          err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat memuat data.'
        )
        setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // Filter reviews
  const filteredReviews = (data?.reviews || []).filter((r) => {
    if (filterRating !== 'all') {
      const targetRating = parseInt(filterRating, 10)
      if (r.skor_keseluruhan !== targetRating) return false
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim()
      const ticketId = `#${r.permohonan_id}`
      const jenisInfo = r.permohonan?.jenis_informasi?.toLowerCase() || ''
      const nama = r.profiles?.nama?.toLowerCase() || ''
      const email = r.profiles?.email?.toLowerCase() || ''
      const kritik = r.kritik_saran?.toLowerCase() || ''

      return (
        ticketId.includes(query) ||
        r.permohonan_id.toString().includes(query) ||
        jenisInfo.includes(query) ||
        nama.includes(query) ||
        email.includes(query) ||
        kritik.includes(query)
      )
    }

    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE
  const pageEnd = safeCurrentPage * ITEMS_PER_PAGE

  const handlePrint = () => {
    window.print()
  }

  const handleExportExcel = async () => {
    if (!data || data.totalResponden === 0 || exportingExcel) return
    setExportingExcel(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/admin/export-survei')
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(
          payload.error || 'Gagal mengunduh berkas Excel rekapitulasi survei IKM.'
        )
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const witaDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Makassar',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Rekapitulasi_IKM_PPID_${witaDate}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Terjadi gangguan saat mengunduh berkas Excel.'
      )
    } finally {
      setExportingExcel(false)
    }
  }

  const unsurMetrics: UnsurMetric[] = [
    {
      code: 'U1',
      label: 'Kepuasan Umum Layanan Informasi Publik',
      score: data?.rataRataKeseluruhan || 0,
    },
    {
      code: 'U2',
      label: 'Kecepatan Respons & Ketepatan SLA',
      score: data?.rataRataKecepatan || 0,
    },
    {
      code: 'U3',
      label: 'Kesesuaian & Kelengkapan Dokumen Informasi',
      score: data?.rataRataKesesuaian || 0,
    },
    {
      code: 'U4',
      label: 'Kemudahan Prosedur & Navigasi Portal PPID',
      score: data?.rataRataKemudahan || 0,
    },
  ]

  const ikmScoreText = loading
    ? '...'
    : (data?.ikmKonversi || 0) > 0
    ? data?.ikmKonversi.toFixed(2)
    : '-'

  const rataRataUnsurText = loading
    ? '...'
    : (data?.indeksIKM || 0) > 0
    ? data?.indeksIKM.toFixed(2)
    : '-'

  return (
    <div className="space-y-6 pb-12 print:p-0 print:space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200 print:border-b-2">
        <div className="min-w-0 max-w-xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rekapitulasi Indeks Kepuasan Masyarakat (IKM)
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            Pengukuran mutu pelayanan publik PPID Dinas CIKASDA Provinsi Sulawesi Tengah berdasarkan PermenPAN-RB No. 14 Tahun 2017.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 self-start lg:self-auto print:hidden">
          <button
            type="button"
            onClick={() => {
              void handleManualRefresh()
            }}
            disabled={refreshing || loading}
            aria-label="Segarkan data survei IKM"
            className="min-h-[44px] whitespace-nowrap shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            <ArrowsClockwise
              size={15}
              weight="bold"
              className={refreshing ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              void handleExportExcel()
            }}
            disabled={loading || exportingExcel || !data || data.totalResponden === 0}
            aria-label="Unduh rekapitulasi survei IKM dalam format Excel (.xlsx)"
            className="min-h-[44px] whitespace-nowrap shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            {exportingExcel ? (
              <ArrowsClockwise
                size={15}
                weight="bold"
                className="animate-spin text-[#0e4891]"
                aria-hidden="true"
              />
            ) : (
              <MicrosoftExcelLogo
                size={15}
                weight="fill"
                className="text-emerald-700"
                aria-hidden="true"
              />
            )}
            <span>{exportingExcel ? 'Menyiapkan...' : 'Unduh Excel'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            aria-label="Cetak rekapitulasi survei IKM"
            className="min-h-[44px] whitespace-nowrap shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            <Printer size={15} weight="bold" aria-hidden="true" />
            <span>Cetak Rekapitulasi</span>
          </button>
        </div>
      </div>

      {/* Migration Notice Banner if Table Missing */}
      {data?.isTableMissing && (
        <div className="p-5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <WarningCircle weight="bold" size={20} className="text-amber-600" aria-hidden="true" />
            <span>Tabel Survei Belum Aktif di Database Supabase</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Struktur tabel{' '}
            <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-900 font-mono text-[11px]">
              survei_kepuasan
            </code>{' '}
            belum dieksekusi di database Supabase Anda. Jalankan file SQL migrasi{' '}
            <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-900 font-mono text-[11px]">
              supabase/migrations/0004_survei_kepuasan.sql
            </code>{' '}
            melalui menu <strong>SQL Editor</strong> pada Supabase Dashboard untuk mengaktifkan fitur pencatatan IKM.
          </p>
        </div>
      )}

      {/* Error State + Retry */}
      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden"
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
                Gagal Memuat Rekapitulasi Survei IKM
              </p>
              <p className="text-xs text-rose-800 font-medium mt-0.5 leading-relaxed">
                {errorMsg}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleManualRefresh()
            }}
            disabled={refreshing}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
          >
            <ArrowsClockwise
              size={15}
              weight="bold"
              className={refreshing ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Asymmetric IKM Focal Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Focal Panel: Nilai Konversi & Mutu Pelayanan */}
        <section
          aria-label="Nilai Indeks Kepuasan Masyarakat"
          className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-6"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0e4891] block">
              Indeks Kepuasan Masyarakat (IKM)
            </span>

            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-5xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {ikmScoreText}
              </span>
              <span className="text-sm font-semibold text-slate-500 tabular-nums">/ 100</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold ${
                  data?.mutu?.badgeColor ||
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {loading
                  ? 'Memuat Mutu...'
                  : data?.mutu?.nilai && data.mutu.nilai !== '-'
                  ? `Mutu ${data.mutu.nilai} - ${data.mutu.kategori}`
                  : 'Belum Ada Data'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Skala Konversi 25.00 - 100.00
              </span>
            </div>
          </div>

          {/* Interval Mutu Note */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Interval Mutu Pelayanan (PermenPAN-RB 14/2017)
            </div>
            <div className="space-y-1 tabular-nums">
              <div className="flex justify-between">
                <span>88.31 - 100.00</span>
                <span className="font-bold text-[#0e4891]">A (Sangat Baik)</span>
              </div>
              <div className="flex justify-between">
                <span>76.61 - 88.30</span>
                <span className="font-bold text-slate-800">B (Baik)</span>
              </div>
              <div className="flex justify-between">
                <span>65.00 - 76.60</span>
                <span className="font-bold text-amber-800">C (Kurang Baik)</span>
              </div>
              <div className="flex justify-between">
                <span>25.00 - 64.99</span>
                <span className="font-bold text-rose-800">D (Tidak Baik)</span>
              </div>
            </div>
            <p className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              Nilai konversi dihitung dari rata-rata 4 unsur penilaian responden (skala 1 - 5) dikalikan faktor pengali 20.
            </p>
          </div>
        </section>

        {/* Right Breakdown: Summary + Unsur & Score Distribution */}
        <section
          aria-label="Rincian unsur dan distribusi penilaian IKM"
          className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-6"
        >
          {/* Compact Numeric Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50">
            <div className="p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Total Responden
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {loading ? '...' : data?.totalResponden ?? 0}
                </span>
                <span className="text-xs font-semibold text-slate-600">Pemohon</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                Maksimal 1 survei untuk setiap tiket dijawab
              </p>
            </div>

            <div className="p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Rata-Rata Unsur 1-4
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {rataRataUnsurText}
                </span>
                <span className="text-xs font-semibold text-slate-600 tabular-nums">/ 5.00</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                Rerata kumulatif empat unsur penilaian layanan
              </p>
            </div>
          </div>

          {/* Rincian 4 Unsur Pelayanan */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Skor Tiap Unsur Pelayanan
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">
                Skala 1.00 - 5.00
              </span>
            </div>

            <div className="space-y-4">
              {unsurMetrics.map((unsur) => {
                const widthPercent = Math.min(100, (unsur.score / 5) * 100)
                return (
                  <div key={unsur.code}>
                    <div className="flex justify-between items-center gap-3 text-xs mb-1.5">
                      <span className="font-bold text-slate-800 flex items-center gap-2 min-w-0">
                        <span className="w-6 h-5 rounded-md bg-blue-50 text-[#0e4891] border border-blue-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {unsur.code}
                        </span>
                        <span className="truncate">{unsur.label}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0">
                        {loading ? '...' : unsur.score.toFixed(2)} / 5.00
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0e4891] h-full rounded-full transition-all duration-300"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Distribusi Skor Keseluruhan (Bintang 5 -> 1) */}
          <div className="pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Distribusi Skor Responden
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">
                Berdasarkan kepuasan umum
              </span>
            </div>

            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = data?.distribusiSkor?.[rating] || 0
                const total = data?.totalResponden || 0
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0

                return (
                  <div key={rating} className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 w-12 text-slate-800 font-bold shrink-0 tabular-nums">
                      <span>{rating}</span>
                      <Star size={13} weight="fill" className="text-amber-600" aria-hidden="true" />
                    </div>

                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#0e4891] h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="w-20 text-right font-mono font-bold text-slate-800 shrink-0 tabular-nums">
                      {count}{' '}
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Tabel Umpan Balik & Masukan Pemohon */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 print:hidden">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Daftar Ulasan &amp; Masukan Pemohon
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 tabular-nums">
              Menampilkan {filteredReviews.length} dari {data?.reviews?.length || 0} hasil survei
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                aria-label="Cari ulasan berdasarkan ID tiket, nama pemohon, atau saran"
                placeholder="Cari ID tiket, nama, saran..."
                className="w-full min-h-[44px] pl-9 pr-9 py-2 text-xs font-medium text-slate-900 rounded-lg border border-slate-300 bg-white placeholder:text-slate-500 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setCurrentPage(1)
                  }}
                  aria-label="Hapus pencarian ulasan"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891]"
                >
                  <X size={13} weight="bold" />
                </button>
              )}
            </div>

            {/* Rating Filter Dropdown */}
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Filter berdasarkan rating bintang"
              className="w-full sm:w-auto min-h-[44px] px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Rating</option>
              <option value="5">Bintang 5 Saja</option>
              <option value="4">Bintang 4 Saja</option>
              <option value="3">Bintang 3 Saja</option>
              <option value="2">Bintang 2 Saja</option>
              <option value="1">Bintang 1 Saja</option>
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ID Permohonan</th>
                <th className="py-3 px-4">Tanggal Survei</th>
                <th className="py-3 px-4">Pemohon</th>
                <th className="py-3 px-4 text-center">Kepuasan</th>
                <th className="py-3 px-4 text-center">SLA / Kualitas / Akses</th>
                <th className="py-3 px-4">Kritik, Saran &amp; Aspirasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-600">
                    <ArrowsClockwise
                      size={22}
                      className="animate-spin mx-auto mb-2 text-[#0e4891]"
                      aria-hidden="true"
                    />
                    <span className="font-medium">Memuat data ulasan...</span>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-600">
                    <ChatTeardropText
                      size={32}
                      className="mx-auto mb-2 text-slate-500"
                      aria-hidden="true"
                    />
                    <p className="font-bold text-slate-800">
                      Belum ada masukan survei yang cocok.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery || filterRating !== 'all'
                        ? 'Coba ubah kata kunci pencarian atau filter rating.'
                        : 'Hasil survei kepuasan masyarakat akan muncul di sini setelah pemohon mengisi survei.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((row, index) => {
                  const isVisibleOnPage = index >= pageStart && index < pageEnd
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isVisibleOnPage ? '' : 'hidden print:table-row'
                      }`}
                    >
                      {/* ID Permohonan */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        #{row.permohonan_id}
                      </td>

                      {/* Tanggal */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 tabular-nums">
                        {new Date(row.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Pemohon */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="font-bold text-slate-900">
                          {row.profiles?.nama || 'Pemohon'}
                        </div>
                        <div className="text-[11px] text-slate-600 break-all">
                          {row.profiles?.email || '-'}
                        </div>
                      </td>

                      {/* Skor Keseluruhan */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs tabular-nums">
                          <span>{row.skor_keseluruhan}</span>
                          <Star
                            size={13}
                            weight="fill"
                            className="text-amber-600"
                            aria-hidden="true"
                          />
                        </div>
                      </td>

                      {/* 3 Aspek Detail */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tabular-nums">
                          <span
                            title="Kecepatan SLA"
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            SLA: {row.kecepatan_layanan}
                          </span>
                          <span
                            title="Kesesuaian Informasi"
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            Info: {row.kesesuaian_informasi}
                          </span>
                          <span
                            title="Kemudahan Prosedur"
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                          >
                            Akses: {row.kemudahan_prosedur}
                          </span>
                        </div>
                      </td>

                      {/* Kritik & Saran */}
                      <td className="py-3.5 px-4 max-w-md">
                        {row.kritik_saran ? (
                          <p className="text-slate-800 italic leading-relaxed break-words">
                            &ldquo;{row.kritik_saran}&rdquo;
                          </p>
                        ) : (
                          <span className="text-slate-600 text-[11px]">
                            - Tidak ada catatan -
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!loading && filteredReviews.length > ITEMS_PER_PAGE && (
          <nav
            aria-label="Navigasi halaman ulasan survei"
            className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-t border-slate-200 bg-white print:hidden"
          >
            <p className="text-xs font-bold text-slate-600 tabular-nums">
              Halaman {safeCurrentPage} dari {totalPages}{' '}
              <span className="font-medium text-slate-500">
                ({filteredReviews.length} Total Ulasan)
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(Math.max(safeCurrentPage - 1, 1))}
                aria-label="Halaman ulasan sebelumnya"
                className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
              >
                <CaretLeft weight="bold" size={14} aria-hidden="true" /> Sebelumnya
              </button>
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(Math.min(safeCurrentPage + 1, totalPages))}
                aria-label="Halaman ulasan berikutnya"
                className="min-h-[44px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
              >
                Selanjutnya <CaretRight weight="bold" size={14} aria-hidden="true" />
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
