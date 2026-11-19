import { google, drive_v3 } from 'googleapis'
import { Readable } from 'stream'

export type GoogleDriveAuthMethod = 'apps_script' | 'oauth2' | 'service_account' | 'none'

/**
 * Mengidentifikasi metode otorisasi Google Drive aktif dari environment variable.
 */
export function getGoogleDriveAuthMethod(): GoogleDriveAuthMethod {
  if (process.env.GOOGLE_DRIVE_SCRIPT_URL?.trim()) {
    return 'apps_script'
  }
  if (
    process.env.GOOGLE_CLIENT_ID?.trim() &&
    process.env.GOOGLE_CLIENT_SECRET?.trim() &&
    process.env.GOOGLE_REFRESH_TOKEN?.trim()
  ) {
    return 'oauth2'
  }
  if (
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim()
  ) {
    return 'service_account'
  }
  return 'none'
}

/**
 * Memeriksa apakah kredensial Google Drive sudah disetel (mendukung Google Apps Script, OAuth2, atau Service Account).
 */
export function isGoogleDriveConfigured(): boolean {
  return getGoogleDriveAuthMethod() !== 'none'
}

export interface UploadDriveResult {
  fileId: string
  fileName: string
  webViewLink: string
  webContentLink?: string
  folderPath?: string
}

function sanitizeDriveFolderSegment(segment: string): string {
  const cleaned = String(segment || '')
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[/\\:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)

  if (!cleaned || cleaned === '.' || cleaned === '..') {
    return ''
  }
  return cleaned
}

function escapeDriveQueryLiteral(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

async function ensureDriveFolderPath(
  drive: drive_v3.Drive,
  rootFolderId: string | undefined,
  segments: string[]
): Promise<{ folderId?: string; folderPath?: string }> {
  const cleanSegments = segments
    .map(sanitizeDriveFolderSegment)
    .filter(Boolean)
    .slice(0, 3)

  let currentParentId = rootFolderId?.trim() || undefined
  if (cleanSegments.length === 0) {
    return { folderId: currentParentId, folderPath: undefined }
  }

  for (const seg of cleanSegments) {
    const escapedName = escapeDriveQueryLiteral(seg)
    const parentFilter = currentParentId
      ? ` and '${escapeDriveQueryLiteral(currentParentId)}' in parents`
      : ''
    const query = `mimeType = 'application/vnd.google-apps.folder' and name = '${escapedName}' and trashed = false${parentFilter}`

    const listRes = await drive.files.list({
      q: query,
      spaces: 'drive',
      pageSize: 1,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    const existingId = listRes.data.files?.[0]?.id
    if (existingId) {
      currentParentId = existingId
      continue
    }

    const createFolderRes = await drive.files.create({
      requestBody: {
        name: seg,
        mimeType: 'application/vnd.google-apps.folder',
        ...(currentParentId ? { parents: [currentParentId] } : {}),
      },
      fields: 'id, name',
      supportsAllDrives: true,
    })

    const createdId = createFolderRes.data.id
    if (!createdId) {
      throw new Error(`Gagal membuat subfolder Google Drive "${seg}".`)
    }
    currentParentId = createdId
  }

  return {
    folderId: currentParentId,
    folderPath: cleanSegments.join(' / '),
  }
}

/**
 * Mengunggah file buffer langsung ke Google Drive.
 * Mendukung 3 metode secara fleksibel:
 * 1. Google Apps Script Web App (Paling Simpel & Cepat untuk Gmail biasa tanpa Google Cloud Console)
 * 2. OAuth 2.0 User Credentials (Client ID, Secret, Refresh Token)
 * 3. Service Account JWT (Google Workspace / Shared Drive)
 */
export async function uploadFileToGoogleDrive({
  buffer,
  fileName,
  mimeType,
  folderId,
  folderPathSegments,
}: {
  buffer: Buffer
  fileName: string
  mimeType: string
  folderId?: string
  folderPathSegments?: string[]
}): Promise<UploadDriveResult> {
  const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID

  // METODE 1: Google Apps Script Web App (Metode 1-URL tanpa ribet)
  if (process.env.GOOGLE_DRIVE_SCRIPT_URL) {
    const base64Data = buffer.toString('base64')
    const scriptUrl = process.env.GOOGLE_DRIVE_SCRIPT_URL.trim()
    const cleanSegments = (folderPathSegments || [])
      .map(sanitizeDriveFolderSegment)
      .filter(Boolean)
      .slice(0, 3)

    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        mimeType: mimeType || 'application/pdf',
        base64: base64Data,
        folderId: targetFolderId ? targetFolderId.trim() : '',
        folderPathSegments: cleanSegments,
      }),
    })

    const data = await res.json()
    if (data.error || (!data.success && !data.fileUrl && !data.fileId)) {
      throw new Error(data.error || 'Gagal mengunggah file via Google Apps Script.')
    }

    const fileId = data.fileId || ''
    const webViewLink =
      data.fileUrl ||
      `https://drive.google.com/file/d/${fileId}/view?usp=sharing`

    return {
      fileId,
      fileName,
      webViewLink,
      folderPath: typeof data.folderPath === 'string' ? data.folderPath : undefined,
    }
  }

  // METODE 2: OAuth 2.0 (Google Cloud Console)
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  ) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID.trim(),
      process.env.GOOGLE_CLIENT_SECRET.trim()
    )

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim(),
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    return uploadViaDriveApi(
      drive,
      buffer,
      fileName,
      mimeType,
      targetFolderId,
      folderPathSegments
    )
  }

  // METODE 3: Service Account JWT
  if (
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  ) {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim()
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.trim().replace(/\\n/g, '\n')

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive'],
    })

    const drive = google.drive({ version: 'v3', auth })
    return uploadViaDriveApi(
      drive,
      buffer,
      fileName,
      mimeType,
      targetFolderId,
      folderPathSegments
    )
  }

  throw new Error(
    'Kredensial Google Drive belum disetel di .env.local. Masukkan GOOGLE_DRIVE_SCRIPT_URL (paling simpel), kredensial OAuth2, atau Service Account.'
  )
}

async function uploadViaDriveApi(
  drive: drive_v3.Drive,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  targetFolderId?: string,
  folderPathSegments?: string[]
): Promise<UploadDriveResult> {
  const { folderId: resolvedFolderId, folderPath } = await ensureDriveFolderPath(
    drive,
    targetFolderId,
    folderPathSegments || []
  )

  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)

  const requestBody: { name: string; parents?: string[] } = {
    name: fileName,
  }

  if (resolvedFolderId) {
    requestBody.parents = [resolvedFolderId]
  }

  const createRes = await drive.files.create({
    requestBody,
    media: {
      mimeType: mimeType || 'application/pdf',
      body: stream,
    },
    fields: 'id, name, webViewLink, webContentLink',
    supportsAllDrives: true,
  })

  const fileId = createRes.data.id
  if (!fileId) {
    throw new Error('Gagal mendapatkan ID file setelah unggah ke Google Drive.')
  }

  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    })
  } catch (permErr: unknown) {
    const errMsg = permErr instanceof Error ? permErr.message : String(permErr)
    console.warn('[Google Drive Permission Notice]:', errMsg)
  }

  const webViewLink =
    createRes.data.webViewLink ||
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`

  return {
    fileId,
    fileName: createRes.data.name || fileName,
    webViewLink,
    webContentLink: createRes.data.webContentLink || undefined,
    folderPath,
  }
}
