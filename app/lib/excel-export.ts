import ExcelJS from 'exceljs'
import type { StatistikIKM } from '@/app/actions/survei'
import { sanitizePlainExcelCell } from '@/app/lib/security'

export interface PermohonanExportRow {
  id: number
  created_at: string
  jenis_informasi: string
  deskripsi: string
  cara_memperoleh: string
  status: 'diajukan' | 'diproses' | 'dijawab' | 'ditolak' | string
  deadline_awal: string | null
  deadline_akhir: string | null
  diperpanjang: boolean
  profiles?: {
    nama: string | null
    nik: string | null
    email: string | null
    telepon: string | null
  } | null
}

const BRAND_BLUE_ARGB = 'FF0E4891'
const SLATE_900_ARGB = 'FF0F172A'
const SLATE_700_ARGB = 'FF334155'
const SLATE_500_ARGB = 'FF64748B'
const ZEBRA_BG_ARGB = 'FFF8FAFC'
const WHITE_ARGB = 'FFFFFFFF'
const SUMMARY_HEADER_BG_ARGB = 'FFEFF6FF'

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
}

export function getWitaDateYmd(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatWitaDateLong(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatWitaDateShort(value: string | null | undefined): string {
  if (!value) return '-'
  const ymdMatch = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch
    return `${d}/${m}/${y}`
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return sanitizePlainExcelCell(value)
  }
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed)
}

function safeText(value: unknown, fallback = '-'): string {
  const cleaned = sanitizePlainExcelCell(value).trim()
  return cleaned || fallback
}

function estimateRowHeight(texts: string[], widths: number[], baseHeight = 22): number {
  let maxLines = 1
  for (let i = 0; i < texts.length; i++) {
    const colWidth = Math.max(widths[i] || 12, 8)
    const paragraphs = texts[i].split('\n')
    let totalLines = 0
    for (const para of paragraphs) {
      totalLines += Math.max(1, Math.ceil(para.length / Math.max(1, colWidth - 3)))
    }
    if (totalLines > maxLines) {
      maxLines = totalLines
    }
  }
  return Math.min(240, Math.max(baseHeight, maxLines * 14 + 8))
}

function applyKopHeader(
  sheet: ExcelJS.Worksheet,
  lastColLetter: string,
  title: string,
  metaLine: string
) {
  sheet.mergeCells(`A1:${lastColLetter}1`)
  const titleCell = sheet.getCell('A1')
  titleCell.value = title
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: BRAND_BLUE_ARGB } }
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' }
  sheet.getRow(1).height = 24

  sheet.mergeCells(`A2:${lastColLetter}2`)
  const subtitleCell = sheet.getCell('A2')
  subtitleCell.value =
    'PPID DIGITAL - DINAS CIPTA KARYA DAN SUMBER DAYA AIR PROVINSI SULAWESI TENGAH'
  subtitleCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: SLATE_700_ARGB } }
  subtitleCell.alignment = { horizontal: 'left', vertical: 'middle' }
  sheet.getRow(2).height = 18

  sheet.mergeCells(`A3:${lastColLetter}3`)
  const metaCell = sheet.getCell('A3')
  metaCell.value = metaLine
  metaCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: SLATE_500_ARGB } }
  metaCell.alignment = { horizontal: 'left', vertical: 'middle' }
  sheet.getRow(3).height = 16

  sheet.getRow(4).height = 8
}

function styleTableHeaderRow(row: ExcelJS.Row, colCount: number) {
  row.height = 28
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c)
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: WHITE_ARGB } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: BRAND_BLUE_ARGB },
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = THIN_BORDER
  }
}

function applyZebraCellStyle(
  cell: ExcelJS.Cell,
  isEvenRow: boolean,
  horizontal: 'left' | 'center' | 'right' = 'left',
  bold = false
) {
  cell.font = {
    name: 'Calibri',
    size: 10,
    bold,
    color: { argb: SLATE_900_ARGB },
  }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: isEvenRow ? WHITE_ARGB : ZEBRA_BG_ARGB },
  }
  cell.alignment = { horizontal, vertical: 'top', wrapText: true }
  cell.border = THIN_BORDER
}

function styleSectionBanner(row: ExcelJS.Row, colSpan: number, title: string) {
  const sheet = row.worksheet
  sheet.mergeCells(row.number, 1, row.number, colSpan)
  const cell = row.getCell(1)
  cell.value = title
  cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: BRAND_BLUE_ARGB } }
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: SUMMARY_HEADER_BG_ARGB },
  }
  cell.alignment = { horizontal: 'left', vertical: 'middle' }
  for (let c = 1; c <= colSpan; c++) {
    row.getCell(c).border = THIN_BORDER
  }
  row.height = 22
}

/**
 * Membangun workbook Excel (.xlsx) resmi untuk Rekapitulasi Survei IKM.
 */
export async function buildSurveiIkmWorkbook(stats: StatistikIKM): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'PPID Digital Dinas CIKASDA Provinsi Sulawesi Tengah'
  workbook.created = new Date()

  const downloadDateLabel = `Standar PermenPAN-RB No. 14 Tahun 2017 | Tanggal Unduh: ${formatWitaDateLong()} WITA`

  // =========================================================================
  // SHEET 1: RINGKASAN IKM
  // =========================================================================
  const summarySheet = workbook.addWorksheet('Ringkasan IKM', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  })
  summarySheet.columns = [{ width: 44 }, { width: 22 }, { width: 28 }]

  applyKopHeader(
    summarySheet,
    'C',
    'REKAPITULASI INDEKS KEPUASAN MASYARAKAT (IKM)',
    downloadDateLabel
  )

  styleSectionBanner(summarySheet.getRow(5), 3, 'A. RINGKASAN HASIL PENGUKURAN IKM')
  const kpiHeaderRow = summarySheet.getRow(6)
  kpiHeaderRow.values = ['Indikator Pengukuran', 'Nilai', 'Keterangan']
  styleTableHeaderRow(kpiHeaderRow, 3)

  const kpiRows: Array<{ label: string; value: number | string; numFmt?: string; note: string }> = [
    { label: 'Total Responden Survei', value: stats.totalResponden, numFmt: '#,##0', note: 'Responden terverifikasi' },
    { label: 'Nilai IKM Konversi (Skala 0 - 100)', value: Number(stats.ikmKonversi.toFixed(2)), numFmt: '0.00', note: 'Indeks x 20' },
    { label: 'Mutu Pelayanan', value: `${stats.mutu.nilai} (${stats.mutu.kategori})`, note: 'PermenPAN-RB No. 14/2017' },
    { label: 'Indeks Rata-rata Keseluruhan (1 - 5)', value: Number(stats.indeksIKM.toFixed(2)), numFmt: '0.00', note: 'Rata-rata 4 unsur layanan' },
  ]

  kpiRows.forEach((item, idx) => {
    const r = summarySheet.getRow(7 + idx)
    r.height = 22
    r.getCell(1).value = item.label
    r.getCell(2).value = item.value
    if (item.numFmt) r.getCell(2).numFmt = item.numFmt
    r.getCell(3).value = item.note
    applyZebraCellStyle(r.getCell(1), idx % 2 === 0, 'left', true)
    applyZebraCellStyle(r.getCell(2), idx % 2 === 0, 'center', true)
    applyZebraCellStyle(r.getCell(3), idx % 2 === 0, 'left', false)
  })

  summarySheet.getRow(11).height = 10
  styleSectionBanner(summarySheet.getRow(12), 3, 'B. NILAI RATA-RATA PER UNSUR PELAYANAN (SKALA 1 - 5)')
  const unsurHeaderRow = summarySheet.getRow(13)
  unsurHeaderRow.values = ['Unsur Layanan', 'Skor Rata-rata', 'Predikat Sederhana']
  styleTableHeaderRow(unsurHeaderRow, 3)

  const getPredikatSkor = (val: number) => {
    if (val >= 4.4) return 'Sangat Baik'
    if (val >= 3.8) return 'Baik'
    if (val >= 3.25) return 'Kurang Baik'
    return val > 0 ? 'Perlu Perbaikan' : 'Belum Ada Data'
  }

  const unsurList = [
    { label: 'U1 - Kepuasan Umum Layanan Informasi Publik', val: stats.rataRataKeseluruhan },
    { label: 'U2 - Kecepatan Respons & Ketepatan SLA', val: stats.rataRataKecepatan },
    { label: 'U3 - Kesesuaian & Kelengkapan Dokumen Informasi', val: stats.rataRataKesesuaian },
    { label: 'U4 - Kemudahan Prosedur & Navigasi Portal PPID', val: stats.rataRataKemudahan },
  ]

  unsurList.forEach((u, idx) => {
    const r = summarySheet.getRow(14 + idx)
    r.height = 22
    r.getCell(1).value = u.label
    r.getCell(2).value = Number(u.val.toFixed(2))
    r.getCell(2).numFmt = '0.00'
    r.getCell(3).value = getPredikatSkor(u.val)
    applyZebraCellStyle(r.getCell(1), idx % 2 === 0, 'left', false)
    applyZebraCellStyle(r.getCell(2), idx % 2 === 0, 'center', true)
    applyZebraCellStyle(r.getCell(3), idx % 2 === 0, 'center', false)
  })

  summarySheet.getRow(18).height = 10
  styleSectionBanner(summarySheet.getRow(19), 3, 'C. DISTRIBUSI PENILAIAN KESELURUHAN')
  const distHeaderRow = summarySheet.getRow(20)
  distHeaderRow.values = ['Tingkat Penilaian', 'Jumlah Responden', 'Persentase']
  styleTableHeaderRow(distHeaderRow, 3)

  const starLabels: Record<number, string> = {
    5: 'Skor 5 - Sangat Baik / Sangat Memuaskan',
    4: 'Skor 4 - Baik / Memuaskan',
    3: 'Skor 3 - Cukup',
    2: 'Skor 2 - Kurang Memuaskan',
    1: 'Skor 1 - Tidak Memuaskan',
  }

  ;[5, 4, 3, 2, 1].forEach((star, idx) => {
    const count = stats.distribusiSkor?.[star] || 0
    const pct = stats.totalResponden > 0 ? count / stats.totalResponden : 0
    const r = summarySheet.getRow(21 + idx)
    r.height = 21
    r.getCell(1).value = starLabels[star]
    r.getCell(2).value = count
    r.getCell(2).numFmt = '#,##0'
    r.getCell(3).value = pct
    r.getCell(3).numFmt = '0.0%'
    applyZebraCellStyle(r.getCell(1), idx % 2 === 0, 'left', false)
    applyZebraCellStyle(r.getCell(2), idx % 2 === 0, 'center', true)
    applyZebraCellStyle(r.getCell(3), idx % 2 === 0, 'center', false)
  })

  // =========================================================================
  // SHEET 2: DETAIL RESPONDEN
  // =========================================================================
  const detailSheet = workbook.addWorksheet('Detail Responden', {
    views: [{ state: 'frozen', ySplit: 5 }],
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: '5:5',
    },
  })

  const detailWidths = [6, 12, 16, 24, 28, 28, 15, 15, 15, 14, 44]
  detailSheet.columns = detailWidths.map((width) => ({ width }))

  applyKopHeader(
    detailSheet,
    'K',
    'DETAIL RESPONDEN SURVEI KEPUASAN MASYARAKAT (IKM)',
    downloadDateLabel
  )

  const detailHeaderRow = detailSheet.getRow(5)
  detailHeaderRow.values = [
    'No',
    'ID Tiket',
    'Tanggal Survei',
    'Nama Pemohon',
    'Email',
    'Jenis Layanan',
    'Kepuasan Umum',
    'Kecepatan SLA',
    'Kesesuaian Info',
    'Kemudahan',
    'Kritik, Saran & Aspirasi',
  ]
  styleTableHeaderRow(detailHeaderRow, 11)
  detailSheet.autoFilter = 'A5:K5'

  const reviews = stats.reviews || []
  if (reviews.length === 0) {
    detailSheet.mergeCells('A6:K6')
    const emptyCell = detailSheet.getCell('A6')
    emptyCell.value = 'Belum ada data ulasan responden survei IKM yang terekam.'
    emptyCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: SLATE_500_ARGB } }
    emptyCell.alignment = { horizontal: 'center', vertical: 'middle' }
    detailSheet.getRow(6).height = 28
    for (let c = 1; c <= 11; c++) {
      detailSheet.getRow(6).getCell(c).border = THIN_BORDER
    }
  } else {
    reviews.forEach((row, index) => {
      const r = detailSheet.getRow(6 + index)
      const isEven = index % 2 === 0
      const nama = safeText(row.profiles?.nama || 'Pemohon')
      const email = safeText(row.profiles?.email || '-')
      const jenis = safeText(row.permohonan?.jenis_informasi || '-')
      const kritik = safeText(row.kritik_saran || '-')
      const tanggal = formatWitaDateShort(row.created_at)

      r.getCell(1).value = index + 1
      r.getCell(2).value = `#${row.permohonan_id}`
      r.getCell(3).value = tanggal
      r.getCell(4).value = nama
      r.getCell(5).value = email
      r.getCell(6).value = jenis
      r.getCell(7).value = Number(row.skor_keseluruhan)
      r.getCell(8).value = Number(row.kecepatan_layanan)
      r.getCell(9).value = Number(row.kesesuaian_informasi)
      r.getCell(10).value = Number(row.kemudahan_prosedur)
      r.getCell(11).value = kritik

      applyZebraCellStyle(r.getCell(1), isEven, 'center', true)
      applyZebraCellStyle(r.getCell(2), isEven, 'center', true)
      applyZebraCellStyle(r.getCell(3), isEven, 'center', false)
      applyZebraCellStyle(r.getCell(4), isEven, 'left', true)
      applyZebraCellStyle(r.getCell(5), isEven, 'left', false)
      applyZebraCellStyle(r.getCell(6), isEven, 'left', false)
      applyZebraCellStyle(r.getCell(7), isEven, 'center', true)
      applyZebraCellStyle(r.getCell(8), isEven, 'center', false)
      applyZebraCellStyle(r.getCell(9), isEven, 'center', false)
      applyZebraCellStyle(r.getCell(10), isEven, 'center', false)
      applyZebraCellStyle(r.getCell(11), isEven, 'left', false)

      r.height = estimateRowHeight(
        [nama, email, jenis, kritik],
        [detailWidths[3], detailWidths[4], detailWidths[5], detailWidths[10]]
      )
    })
  }

  const out = await workbook.xlsx.writeBuffer()
  return Buffer.from(out)
}

/**
 * Membangun workbook Excel (.xlsx) resmi untuk Laporan Rekapitulasi Permohonan Informasi Publik.
 */
export async function buildPermohonanReportWorkbook(
  items: PermohonanExportRow[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'PPID Digital Dinas CIKASDA Provinsi Sulawesi Tengah'
  workbook.created = new Date()

  const metaText = `Rekapitulasi Resmi Layanan Informasi Publik | Tanggal Unduh: ${formatWitaDateLong()} WITA`

  const totalCount = items.length
  const diajukanCount = items.filter((p) => p.status === 'diajukan').length
  const diprosesCount = items.filter((p) => p.status === 'diproses').length
  const dijawabCount = items.filter((p) => p.status === 'dijawab').length
  const ditolakCount = items.filter((p) => p.status === 'ditolak').length
  const diperpanjangCount = items.filter((p) => p.diperpanjang).length

  // =========================================================================
  // SHEET 1: RINGKASAN LAPORAN
  // =========================================================================
  const summarySheet = workbook.addWorksheet('Ringkasan Laporan', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  })
  summarySheet.columns = [{ width: 40 }, { width: 18 }, { width: 32 }]

  applyKopHeader(
    summarySheet,
    'C',
    'LAPORAN REKAPITULASI PERMOHONAN INFORMASI PUBLIK',
    metaText
  )

  styleSectionBanner(summarySheet.getRow(5), 3, 'RINGKASAN STATUS LAYANAN PERMOHONAN')
  const sumHeader = summarySheet.getRow(6)
  sumHeader.values = ['Kategori Status Permohonan', 'Jumlah Tiket', 'Keterangan']
  styleTableHeaderRow(sumHeader, 3)

  const statusSummaryRows = [
    { label: 'Total Permohonan Tercatat', count: totalCount, note: 'Seluruh riwayat masuk portal PPID' },
    { label: 'Perlu Diproses (Diajukan)', count: diajukanCount, note: 'Menunggu verifikasi dan tindak lanjut awal' },
    { label: 'Sedang Diproses', count: diprosesCount, note: 'Dalam penelusuran / penyusunan dokumen' },
    { label: 'Dijawab Selesai', count: dijawabCount, note: 'Tanggapan / dokumen telah disampaikan' },
    { label: 'Ditolak', count: ditolakCount, note: 'Permohonan ditolak disertai dasar alasan' },
    { label: 'Menggunakan Perpanjangan SLA', count: diperpanjangCount, note: 'Tambahan waktu maksimal +7 hari kerja WITA' },
  ]

  statusSummaryRows.forEach((row, idx) => {
    const r = summarySheet.getRow(7 + idx)
    r.height = 22
    r.getCell(1).value = row.label
    r.getCell(2).value = row.count
    r.getCell(2).numFmt = '#,##0'
    r.getCell(3).value = row.note
    applyZebraCellStyle(r.getCell(1), idx % 2 === 0, 'left', idx === 0)
    applyZebraCellStyle(r.getCell(2), idx % 2 === 0, 'center', true)
    applyZebraCellStyle(r.getCell(3), idx % 2 === 0, 'left', false)
  })

  // =========================================================================
  // SHEET 2: DATA PERMOHONAN
  // =========================================================================
  const dataSheet = workbook.addWorksheet('Data Permohonan', {
    views: [{ state: 'frozen', ySplit: 5 }],
    pageSetup: {
      paperSize: 9,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: '5:5',
    },
  })

  const colWidths = [6, 11, 15, 24, 20, 26, 17, 26, 44, 22, 14, 16]
  dataSheet.columns = colWidths.map((width) => ({ width }))

  applyKopHeader(
    dataSheet,
    'L',
    'DATA PERMOHONAN INFORMASI PUBLIK PPID CIKASDA',
    metaText
  )

  const dataHeaderRow = dataSheet.getRow(5)
  dataHeaderRow.values = [
    'No',
    'ID Tiket',
    'Tanggal Masuk',
    'Nama Pemohon',
    'NIK',
    'Email',
    'Telepon / WA',
    'Jenis Informasi',
    'Rincian Kebutuhan',
    'Bentuk Salinan',
    'Status',
    'Deadline SLA',
  ]
  styleTableHeaderRow(dataHeaderRow, 12)
  dataSheet.autoFilter = 'A5:L5'

  const statusColorMap: Record<string, { bg: string; fg: string }> = {
    dijawab: { bg: 'FFDBEAFE', fg: BRAND_BLUE_ARGB },
    ditolak: { bg: 'FFFFE4E6', fg: 'FF9F1239' },
    diproses: { bg: 'FFF1F5F9', fg: SLATE_700_ARGB },
    diajukan: { bg: 'FFEFF6FF', fg: 'FF1E40AF' },
  }

  if (items.length === 0) {
    dataSheet.mergeCells('A6:L6')
    const emptyCell = dataSheet.getCell('A6')
    emptyCell.value = 'Belum ada data permohonan informasi publik yang tercatat.'
    emptyCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: SLATE_500_ARGB } }
    emptyCell.alignment = { horizontal: 'center', vertical: 'middle' }
    dataSheet.getRow(6).height = 28
    for (let c = 1; c <= 12; c++) {
      dataSheet.getRow(6).getCell(c).border = THIN_BORDER
    }
  } else {
    items.forEach((item, idx) => {
      const r = dataSheet.getRow(6 + idx)
      const isEven = idx % 2 === 0
      const nama = safeText(item.profiles?.nama || 'Pemohon')
      const nik = safeText(item.profiles?.nik || '-')
      const email = safeText(item.profiles?.email || '-')
      const telepon = safeText(item.profiles?.telepon || '-')
      const jenis = safeText(item.jenis_informasi)
      const deskripsi = safeText(item.deskripsi)
      const cara = safeText(item.cara_memperoleh)
      const statusStr = String(item.status || 'diajukan').toUpperCase()
      const deadlineStr = formatWitaDateShort(item.deadline_akhir || item.deadline_awal)

      r.getCell(1).value = idx + 1
      r.getCell(2).value = `#${item.id}`
      r.getCell(3).value = formatWitaDateShort(item.created_at)
      r.getCell(4).value = nama

      const nikCell = r.getCell(5)
      nikCell.value = nik
      nikCell.numFmt = '@'

      r.getCell(6).value = email

      const telCell = r.getCell(7)
      telCell.value = telepon
      telCell.numFmt = '@'

      r.getCell(8).value = jenis
      r.getCell(9).value = deskripsi
      r.getCell(10).value = cara
      r.getCell(11).value = statusStr
      r.getCell(12).value = deadlineStr

      applyZebraCellStyle(r.getCell(1), isEven, 'center', true)
      applyZebraCellStyle(r.getCell(2), isEven, 'center', true)
      applyZebraCellStyle(r.getCell(3), isEven, 'center', false)
      applyZebraCellStyle(r.getCell(4), isEven, 'left', true)
      applyZebraCellStyle(nikCell, isEven, 'center', false)
      applyZebraCellStyle(r.getCell(6), isEven, 'left', false)
      applyZebraCellStyle(telCell, isEven, 'center', false)
      applyZebraCellStyle(r.getCell(8), isEven, 'left', false)
      applyZebraCellStyle(r.getCell(9), isEven, 'left', false)
      applyZebraCellStyle(r.getCell(10), isEven, 'left', false)
      applyZebraCellStyle(r.getCell(12), isEven, 'center', false)

      const statusStyle = statusColorMap[String(item.status || '').toLowerCase()]
      const statusCell = r.getCell(11)
      applyZebraCellStyle(statusCell, isEven, 'center', true)
      if (statusStyle) {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusStyle.bg },
        }
        statusCell.font = {
          name: 'Calibri',
          size: 10,
          bold: true,
          color: { argb: statusStyle.fg },
        }
      }

      r.height = estimateRowHeight(
        [nama, email, jenis, deskripsi, cara],
        [colWidths[3], colWidths[5], colWidths[7], colWidths[8], colWidths[9]]
      )
    })
  }

  const out = await workbook.xlsx.writeBuffer()
  return Buffer.from(out)
}
