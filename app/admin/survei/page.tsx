'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Star,
  ArrowsClockwise,
  Printer,
  Users,
  ChartLineUp,
  CheckCircle,
  WarningCircle,
  MagnifyingGlass,
  CalendarBlank,
  ChatTeardropText,
  Clock,
  FileText,
  SlidersHorizontal,
  ArrowUpRight,
} from '@phosphor-icons/react'
import {
  getStatistikIKMAdmin,
  StatistikIKM,
  SurveiKepuasanRow,
} from '@/app/actions/survei'

export default function AdminSurveiPage() {
  const [data, setData] = useState<StatistikIKM | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRating, setFilterRating] = useState<string>('all')

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)
    setErrorMsg(null)

    try {
      const res = await getStatistikIKMAdmin()
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setErrorMsg(res.error || 'Gagal memuat rekapitulasi data survei IKM.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem saat memuat data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter reviews
  const filteredReviews = (data?.reviews || []).filter((r) => {
    // Rating filter
    if (filterRating !== 'all') {
      const targetRating = parseInt(filterRating, 10)
      if (r.skor_keseluruhan !== targetRating) return false
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      const regNo = r.permohonan?.nomor_registrasi?.toLowerCase() || ''
      const nama = r.profiles?.nama?.toLowerCase() || ''
      const email = r.profiles?.email?.toLowerCase() || ''
      const kritik = r.kritik_saran?.toLowerCase() || ''

      return (
        regNo.includes(query) ||
        nama.includes(query) ||
        email.includes(query) ||
        kritik.includes(query)
      )
    }

    return true
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 print:p-0 print:space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 print:border-b-2">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-[#0e4891] text-white rounded-2xl shadow-sm print:hidden">
            <Star weight="fill" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Rekapitulasi Indeks Kepuasan Masyarakat (IKM)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0e4891] border border-blue-200 text-[11px] font-bold tracking-wide uppercase">
                PermenPAN-RB No. 14 / 2017
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Hasil pengukuran mutu pelayanan publik dan evaluasi kepuasan pemohon informasi PPID Dinas CIKASDA Provinsi Sulawesi Tengah.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
          >
            <ArrowsClockwise
              size={15}
              weight="bold"
              className={refreshing ? 'animate-spin' : ''}
            />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors shadow-2xs"
          >
            <Printer size={15} weight="bold" />
            <span>Cetak Rekapitulasi</span>
          </button>
        </div>
      </div>

      {/* Migration Notice Banner if Table Missing */}
      {data?.isTableMissing && (
        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 text-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <WarningCircle weight="fill" size={20} className="text-amber-600" />
            <span>Tabel Survei Belum Aktif di Database Supabase</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Struktur tabel <code className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-900 font-mono text-[11px]">survei_kepuasan</code> belum dieksekusi di database Supabase Anda. Silakan jalankan file SQL migrasi <code className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-900 font-mono text-[11px]">supabase/migrations/0004_survei_kepuasan.sql</code> melalui menu <strong>SQL Editor</strong> pada Supabase Dashboard untuk mengaktifkan fitur pencatatan IKM secara penuh.
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Nilai IKM Konversi (Skala 25-100) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Nilai IKM Konversi
            </span>
            <ChartLineUp size={20} className="text-[#0e4891]" weight="duotone" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : (data?.ikmKonversi || 0) > 0 ? data?.ikmKonversi.toFixed(2) : '-'}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Standar PermenPAN-RB (Skala 25 - 100)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-[#0e4891]" />
        </div>

        {/* Card 2: Mutu Pelayanan & Predikat */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Mutu Pelayanan
            </span>
            <CheckCircle size={20} className="text-emerald-600" weight="duotone" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : data?.mutu?.nilai || '-'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
                data?.mutu?.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {loading ? 'Memuat...' : data?.mutu?.kategori || 'Belum Ada Data'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Predikat Kinerja Pelayanan Publik
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
        </div>

        {/* Card 3: Total Responden */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Responden
            </span>
            <Users size={20} className="text-indigo-600" weight="duotone" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : data?.totalResponden || 0}
            </span>
            <span className="text-xs font-semibold text-slate-400">Pemohon</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Wajib 1 Survei per 1 Tiket Dijawab
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600" />
        </div>

        {/* Card 4: Indeks Rata-rata 4 Unsur (Skala 1-5) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Indeks Rata-rata
            </span>
            <Star size={20} className="text-amber-500" weight="fill" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {loading ? '...' : (data?.indeksIKM || 0) > 0 ? data?.indeksIKM.toFixed(2) : '-'}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 5.00</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Rata-rata Kumulatif 4 Aspek Layanan
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
        </div>
      </div>

      {/* Grid: 4 Unsur Pelayanan & Distribusi Bintang */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1-2: Rincian 4 Unsur Layanan PermenPAN-RB */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Rincian Skor Tiap Unsur Pelayanan IKM
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai rerata per unsur (skala 1.00 s.d. 5.00)
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              4 Unsur Standar
            </span>
          </div>

          <div className="space-y-5">
            {/* Unsur 1: Kepuasan Umum */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0e4891] flex items-center justify-center font-bold text-[10px]">
                    U1
                  </span>
                  Kepuasan Umum Layanan Informasi Publik
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {loading ? '...' : (data?.rataRataKeseluruhan || 0).toFixed(2)} / 5.00
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0e4891] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((data?.rataRataKeseluruhan || 0) / 5) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Unsur 2: Kecepatan Layanan & SLA */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0e4891] flex items-center justify-center font-bold text-[10px]">
                    U2
                  </span>
                  Kecepatan Respons & Ketepatan SLA
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {loading ? '...' : (data?.rataRataKecepatan || 0).toFixed(2)} / 5.00
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((data?.rataRataKecepatan || 0) / 5) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Unsur 3: Kesesuaian & Kualitas Informasi */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0e4891] flex items-center justify-center font-bold text-[10px]">
                    U3
                  </span>
                  Kesesuaian & Kelengkapan Dokumen Informasi
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {loading ? '...' : (data?.rataRataKesesuaian || 0).toFixed(2)} / 5.00
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((data?.rataRataKesesuaian || 0) / 5) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Unsur 4: Kemudahan Prosedur & Akses Portal */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0e4891] flex items-center justify-center font-bold text-[10px]">
                    U4
                  </span>
                  Kemudahan Prosedur & Navigasi Portal PPID
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {loading ? '...' : (data?.rataRataKemudahan || 0).toFixed(2)} / 5.00
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((data?.rataRataKemudahan || 0) / 5) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 3: Distribusi Bintang Responden */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Distribusi Penilaian
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Frekuensi skor kepuasan keseluruhan
            </p>
          </div>

          <div className="space-y-3.5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = data?.distribusiSkor?.[rating] || 0
              const total = data?.totalResponden || 0
              const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : '0'

              return (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 w-16 text-slate-700 font-bold shrink-0">
                    <span>{rating}</span>
                    <Star size={13} weight="fill" className="text-amber-500" />
                  </div>

                  <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="w-16 text-right font-mono font-bold text-slate-700 shrink-0">
                    {count} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Skala Kinerja Legend */}
          <div className="mt-8 pt-4 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
              Kategori Mutu (PermenPAN-RB):
            </div>
            <div className="flex justify-between">
              <span>88.31 - 100.00:</span>
              <span className="font-bold text-emerald-700">A (Sangat Baik)</span>
            </div>
            <div className="flex justify-between">
              <span>76.61 - 88.30:</span>
              <span className="font-bold text-blue-700">B (Baik)</span>
            </div>
            <div className="flex justify-between">
              <span>65.00 - 76.60:</span>
              <span className="font-bold text-amber-700">C (Kurang Baik)</span>
            </div>
            <div className="flex justify-between">
              <span>25.00 - 64.99:</span>
              <span className="font-bold text-rose-700">D (Tidak Baik)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Umpan Balik & Masukan Pemohon */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 print:hidden">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Daftar Ulasan & Masukan Pemohon
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {filteredReviews.length} dari {data?.reviews?.length || 0} hasil survei
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari no. reg, nama, saran..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white placeholder-slate-400 focus:border-[#0e4891] focus:ring-1 focus:ring-[#0e4891] outline-none"
              />
            </div>

            {/* Rating Filter Dropdown */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-700 focus:border-[#0e4891] focus:ring-1 focus:ring-[#0e4891] outline-none"
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
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Registrasi</th>
                <th className="py-3 px-4">Tanggal Survei</th>
                <th className="py-3 px-4">Pemohon</th>
                <th className="py-3 px-4 text-center">Kepuasan</th>
                <th className="py-3 px-4 text-center">SLA / Kualitas / Akses</th>
                <th className="py-3 px-4">Kritik, Saran & Aspirasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <ArrowsClockwise size={22} className="animate-spin mx-auto mb-2 text-[#0e4891]" />
                    <span>Memuat data ulasan...</span>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ChatTeardropText size={36} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">Belum ada masukan survei yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery || filterRating !== 'all'
                        ? 'Coba ubah kata kunci pencarian atau filter rating.'
                        : 'Hasil survei kepuasan masyarakat akan otomatis muncul di sini begitu pemohon mengisi survei.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* No. Registrasi */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.permohonan?.nomor_registrasi || `#${row.permohonan_id}`}
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {new Date(row.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Pemohon */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {row.profiles?.nama || 'Pemohon'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {row.profiles?.email || '-'}
                      </div>
                    </td>

                    {/* Skor Keseluruhan */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs">
                        <span>{row.skor_keseluruhan}</span>
                        <Star size={13} weight="fill" className="text-amber-500" />
                      </div>
                    </td>

                    {/* 3 Aspek Detail */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold">
                        <span
                          title="Kecepatan SLA"
                          className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100"
                        >
                          SLA: {row.kecepatan_layanan}
                        </span>
                        <span
                          title="Kesesuaian Informasi"
                          className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100"
                        >
                          Info: {row.kesesuaian_informasi}
                        </span>
                        <span
                          title="Kemudahan Prosedur"
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          Akses: {row.kemudahan_prosedur}
                        </span>
                      </div>
                    </td>

                    {/* Kritik & Saran */}
                    <td className="py-3.5 px-4 max-w-md">
                      {row.kritik_saran ? (
                        <p className="text-slate-700 italic leading-relaxed">
                          &ldquo;{row.kritik_saran}&rdquo;
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px]">- Tidak ada catatan -</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
