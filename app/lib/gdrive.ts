import { google } from 'googleapis'
import { Readable } from 'stream'

/**
 * Memeriksa apakah kredensial Google Drive sudah disetel (mendukung Google Apps Script, OAuth2, atau Service Account).
 */
export function isGoogleDriveConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_DRIVE_SCRIPT_URL ||
    (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) ||
    (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
  )
}

export interface UploadDriveResult {
  fileId: string
  fileName: string
  webViewLink: string
  webContentLink?: string
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
}: {
  buffer: Buffer
  fileName: string
  mimeType: string
  folderId?: string
}): Promise<UploadDriveResult> {
  const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID

  // METODE 1: Google Apps Script Web App (Metode 1-URL tanpa ribet)
  if (process.env.GOOGLE_DRIVE_SCRIPT_URL) {
    const base64Data = buffer.toString('base64')
    const scriptUrl = process.env.GOOGLE_DRIVE_SCRIPT_URL.trim()

    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        mimeType: mimeType || 'application/pdf',
        base64: base64Data,
        folderId: targetFolderId ? targetFolderId.trim() : '',
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
    return uploadViaDriveApi(drive, buffer, fileName, mimeType, targetFolderId)
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
    return uploadViaDriveApi(drive, buffer, fileName, mimeType, targetFolderId)
  }

  throw new Error(
    'Kredensial Google Drive belum disetel di .env.local. Masukkan GOOGLE_DRIVE_SCRIPT_URL (paling simpel), kredensial OAuth2, atau Service Account.'
  )
}

async function uploadViaDriveApi(
  drive: any,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  targetFolderId?: string
): Promise<UploadDriveResult> {
  const stream = new Readable()
  stream.push(buffer)
  stream.push(null)

  const requestBody: { name: string; parents?: string[] } = {
    name: fileName,
  }

  if (targetFolderId && targetFolderId.trim()) {
    requestBody.parents = [targetFolderId.trim()]
  }

  const createRes = await drive.files.create({
    requestBody,
    media: {
      mimeType: mimeType || 'application/pdf',
      body: stream,
    },
    fields: 'id, name, webViewLink, webContentLink',
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
    })
  } catch (permErr: any) {
    console.warn('[Google Drive Permission Notice]:', permErr?.message)
  }

  const webViewLink =
    createRes.data.webViewLink ||
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`

  return {
    fileId,
    fileName: createRes.data.name || fileName,
    webViewLink,
    webContentLink: createRes.data.webContentLink || undefined,
  }
}
