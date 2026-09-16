'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  DaftarInformasiTable,
  TAHUN_LIST,
} from '@/app/informasi/data/daftarInformasiDefault'
import {
  MagnifyingGlass,
  ArrowSquareOut,
  DownloadSimple,
  Table as TableIcon,
  XCircle,
} from '@phosphor-icons/react'

interface DaftarInformasiPublikViewProps {
  tables: DaftarInformasiTable[]
}

export default function DaftarInformasiPublikView({
  tables,
}: DaftarInformasiPublikViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter data berdasarkan kata kunci pencarian
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables

    const q = searchQuery.toLowerCase()
    return tables
      .map((tbl) => {
        const matchingItems = tbl.items.filter((it) =>
          it.nama.toLowerCase().includes(q)
        )
        // Tetap tampilkan tabel jika judul tabel cocok atau ada item di dalamnya yang cocok
        if (tbl.judul.toLowerCase().includes(q)) {
          return tbl
        }
        if (matchingItems.length > 0) {
          return { ...tbl, items: matchingItems }
        }
        return null
      })
      .filter(Boolean) as DaftarInformasiTable[]
  }, [tables, searchQuery])

  const totalItemsCount = useMemo(() => {
    return tables.reduce((acc, t) => acc + (t.items?.length || 0), 0)
  }, [tables])

  return (
    <div className="space-y-10 mb-16">
      {/* PENCARIAN & STATISTIK MATRIKS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0e4891] flex items-center justify-center shrink-0">
            <TableIcon size={22} weight="bold" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Matriks Daftar Informasi Publik
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Total {tables.length} Kategori Tematik • {totalItemsCount} Baris Dokumen Resmi
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <MagnifyingGlass
            size={16}
            weight="bold"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama dokumen atau informasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              title="Hapus pencarian"
            >
              <XCircle size={16} weight="fill" />
            </button>
          )}
        </div>
      </div>

      {/* HASIL KOSONG PENCARIAN */}
      {filteredTables.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <MagnifyingGlass size={24} weight="bold" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">
            Informasi Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Tidak ditemukan dokumen atau informasi yang cocok dengan kata kunci{' '}
            <span className="font-bold text-slate-800 font-mono">"{searchQuery}"</span>.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-xs font-bold text-[#0e4891] hover:underline"
          >
            Reset Pencarian
          </button>
        </div>
      )}

      {/* TABEL LIST */}
      {filteredTables.map((table, tIdx) => {
        const isActionKlik = table.action_type === 'klik'
        const actionLabel = isActionKlik ? 'Klik' : 'Unduh'

        return (
          <div
            key={table.id ? table.id.toString() : `tbl-${tIdx}`}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
          >
            {/* Table Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 border-l-4 border-l-amber-400 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#0e4891] text-white flex items-center justify-center font-extrabold text-xs font-mono">
                  {String(tIdx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-black text-base md:text-lg text-slate-900 tracking-wide uppercase">
                  {table.judul}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 font-mono bg-white px-3 py-1 rounded-full border border-slate-200">
                {table.deskripsi || 'Tahun 2022 - 2026'}
              </span>
            </div>

            {/* Table Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#0e4891] text-white">
                    <th className="py-4 px-6 font-bold text-sm w-1/2">Data</th>
                    {TAHUN_LIST.map((th) => (
                      <th
                        key={th}
                        className="py-4 px-4 font-bold text-sm text-center font-mono w-[10%]"
                      >
                        {th}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {table.items && table.items.length > 0 ? (
                    table.items.map((row, rIdx) => (
                      <tr
                        key={row.id ? row.id.toString() : `row-${rIdx}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-4 px-6 text-xs md:text-sm font-medium text-slate-800 leading-relaxed">
                          {row.nama}
                        </td>
                        {TAHUN_LIST.map((th) => {
                          const targetUrl = (row.links as Record<string, string>)[th] || '#'
                          const isExternal = targetUrl.startsWith('http')
                          const isInternalRoute = targetUrl.startsWith('/')
                          const hasLink = targetUrl && targetUrl !== '#'

                          return (
                            <td key={th} className="py-4 px-4 text-center">
                              {hasLink ? (
                                isExternal ? (
                                  <a
                                    href={targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1 text-xs md:text-sm font-semibold text-[#0e4891] hover:text-[#0a366f] hover:underline transition-colors group"
                                    title={`${actionLabel} ${row.nama} (${th})`}
                                  >
                                    <span>{actionLabel}</span>
                                    <ArrowSquareOut
                                      size={12}
                                      weight="bold"
                                      className="opacity-70 group-hover:opacity-100"
                                    />
                                  </a>
                                ) : isInternalRoute ? (
                                  <Link
                                    href={targetUrl}
                                    className="inline-flex items-center justify-center gap-1 text-xs md:text-sm font-semibold text-[#0e4891] hover:text-[#0a366f] hover:underline transition-colors"
                                    title={`${actionLabel} ${row.nama} (${th})`}
                                  >
                                    <span>{actionLabel}</span>
                                  </Link>
                                ) : (
                                  <a
                                    href={targetUrl}
                                    className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline transition-colors"
                                    title={`${actionLabel} ${row.nama} (${th})`}
                                  >
                                    {actionLabel}
                                  </a>
                                )
                              ) : (
                                <span
                                  className="text-xs md:text-sm font-semibold text-[#0e4891] hover:underline cursor-pointer"
                                  title={`Link ${row.nama} (${th})`}
                                >
                                  {actionLabel}
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={TAHUN_LIST.length + 1}
                        className="py-6 text-center text-xs text-slate-500 italic"
                      >
                        Belum ada rincian baris data pada tabel ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
