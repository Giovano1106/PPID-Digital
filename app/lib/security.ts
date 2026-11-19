const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * Meng-escape karakter khusus HTML untuk mencegah XSS / HTML injection
 * pada email HTML, pratinjau template, maupun ekspor tabel Excel.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] || ch)
}

/**
 * Menetralkan formula injection Excel (=, +, -, @, tab, CR) untuk sel teks biasa (.xlsx).
 */
export function sanitizePlainExcelCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const raw = String(value).replace(/\r\n/g, '\n').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  if (raw === '' || raw === '-') return raw
  return /^[\s]*[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw
}

/**
 * Menetralkan formula injection Excel (=, +, -, @, tab, CR) lalu meng-escape HTML.
 */
export function sanitizeExcelCell(value: unknown): string {
  return escapeHtml(sanitizePlainExcelCell(value))
}

/**
 * Memvalidasi bahwa URL menggunakan skema aman (http/https), atau path lokal/placeholder jika diizinkan.
 */
export function isSafePublicUrl(
  rawUrl: string,
  options?: { allowRelativePath?: boolean; allowHashPlaceholder?: boolean }
): boolean {
  if (typeof rawUrl !== 'string') return false
  const trimmed = rawUrl.trim()
  if (!trimmed) return false

  if (options?.allowHashPlaceholder && trimmed === '#') {
    return true
  }

  if (options?.allowRelativePath) {
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
      return true
    }
  }

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

/**
 * Memvalidasi URL Google Drive dan mengonversinya ke URL /preview yang aman.
 */
export function sanitizeDrivePreviewUrl(rawUrl: string): string | null {
  if (typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'drive.google.com') {
      return null
    }
    const match = parsed.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]{10,120})(?:\/|$)/)
    if (!match) return null
    return `https://drive.google.com/file/d/${match[1]}/preview`
  } catch {
    return null
  }
}

/**
 * Mengekstrak daftar URL Google Drive valid dari teks bebas tanpa duplikat.
 */
export function extractSafeDriveUrls(text: string | null | undefined): string[] {
  if (!text) return []
  const matches = text.match(/(https?:\/\/[^\s]+)/g) || []
  const seen = new Set<string>()
  const validUrls: string[] = []

  for (const raw of matches) {
    const cleaned = raw.replace(/[.,);:\]]+$/g, '')
    if (!seen.has(cleaned) && sanitizeDrivePreviewUrl(cleaned)) {
      seen.add(cleaned)
      validUrls.push(cleaned)
    }
  }

  return validUrls
}

/**
 * Membersihkan nama berkas dari karakter kontrol dan path traversal.
 */
export function sanitizeFileName(name: string): string {
  const withoutPath = String(name || '').split(/[/\\]/).pop() || ''
  const cleaned = withoutPath
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)

  return cleaned || 'dokumen.pdf'
}

const ALLOWED_DOCUMENT_TYPES: Record<string, { mimes: string[]; magic?: 'pdf' | 'zip' }> = {
  '.pdf': { mimes: ['application/pdf'], magic: 'pdf' },
  '.doc': { mimes: ['application/msword', 'application/octet-stream'] },
  '.docx': {
    mimes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/octet-stream',
    ],
    magic: 'zip',
  },
  '.xls': { mimes: ['application/vnd.ms-excel', 'application/octet-stream'] },
  '.xlsx': {
    mimes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/octet-stream',
    ],
    magic: 'zip',
  },
  '.ppt': { mimes: ['application/vnd.ms-powerpoint', 'application/octet-stream'] },
  '.pptx': {
    mimes: [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/octet-stream',
    ],
    magic: 'zip',
  },
  '.zip': {
    mimes: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'],
    magic: 'zip',
  },
}

/**
 * Memvalidasi ukuran, ekstensi allowlist, MIME type, dan magic bytes berkas dokumen unggahan.
 */
export function validateUploadedDocument(
  file: File,
  buffer: Buffer
): { valid: boolean; error?: string; safeFileName: string; safeMimeType: string } {
  const safeFileName = sanitizeFileName(file.name)
  const MAX_SIZE = 25 * 1024 * 1024

  if (file.size <= 0 || buffer.length <= 0) {
    return {
      valid: false,
      error: 'Berkas kosong tidak dapat diunggah.',
      safeFileName,
      safeMimeType: 'application/octet-stream',
    }
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'Ukuran berkas melebihi batas maksimal 25 MB.',
      safeFileName,
      safeMimeType: 'application/octet-stream',
    }
  }

  const dotIndex = safeFileName.lastIndexOf('.')
  const ext = dotIndex >= 0 ? safeFileName.slice(dotIndex).toLowerCase() : ''
  const rule = ALLOWED_DOCUMENT_TYPES[ext]

  if (!rule) {
    return {
      valid: false,
      error: 'Format berkas tidak diizinkan. Gunakan PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, atau ZIP.',
      safeFileName,
      safeMimeType: 'application/octet-stream',
    }
  }

  const normalizedMime = (file.type || '').toLowerCase().trim()
  if (normalizedMime && !rule.mimes.includes(normalizedMime)) {
    return {
      valid: false,
      error: 'Tipe MIME berkas tidak sesuai dengan ekstensi dokumen yang diizinkan.',
      safeFileName,
      safeMimeType: rule.mimes[0],
    }
  }

  if (rule.magic === 'pdf') {
    if (buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return {
        valid: false,
        error: 'Isi berkas bukan dokumen PDF yang valid.',
        safeFileName,
        safeMimeType: rule.mimes[0],
      }
    }
  } else if (rule.magic === 'zip') {
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      return {
        valid: false,
        error: 'Struktur berkas dokumen atau arsip tidak valid.',
        safeFileName,
        safeMimeType: rule.mimes[0],
      }
    }
  }

  return {
    valid: true,
    safeFileName,
    safeMimeType: rule.mimes[0],
  }
}

/**
 * Menghitung tanggal batas akhir SLA berdasarkan hari kerja (Senin sampai Jumat) di zona waktu WITA.
 */
export function addWorkingDaysWita(
  baseDateStr: string | null | undefined,
  workingDays: number
): string {
  let ymd = ''
  const trimmed = baseDateStr?.trim()

  if (trimmed) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      ymd = trimmed
    } else {
      const parsed = new Date(trimmed)
      if (!Number.isNaN(parsed.getTime())) {
        ymd = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Makassar',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(parsed)
      }
    }
  }

  if (!ymd) {
    ymd = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Makassar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  }

  const [y, m, d] = ymd.split('-').map(Number)
  const cursor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))

  let added = 0
  while (added < workingDays) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    const day = cursor.getUTCDay()
    if (day !== 0 && day !== 6) {
      added++
    }
  }

  const yyyy = cursor.getUTCFullYear()
  const mm = String(cursor.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(cursor.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Menyaring pesan error agar detail internal database/SDK tidak bocor ke klien.
 */
export function sanitizeUserError(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    if (error.message.startsWith('Unauthorized') || error.message.startsWith('Forbidden')) {
      return error.message
    }
  }
  return fallbackMessage
}
