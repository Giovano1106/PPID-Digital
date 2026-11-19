import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { uploadFileToGoogleDrive, isGoogleDriveConfigured } from '@/app/lib/gdrive'
import { revalidatePath } from 'next/cache'
import { validateUploadedDocument } from '@/app/lib/security'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Autentikasi Admin
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi tidak ditemukan. Silakan login kembali.' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Hanya Administrator yang berhak mengunggah berkas.' },
        { status: 403 }
      )
    }

    // 2. Cek apakah Google Drive API sudah dikonfigurasi
    if (!isGoogleDriveConfigured()) {
      return NextResponse.json(
        {
          error:
            'Kredensial Service Account Google Drive belum disetel di .env.local (GOOGLE_SERVICE_ACCOUNT_EMAIL dan GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY). Gunakan tab Tautkan Link Manual atau lengkapi kredensial tersebut.',
        },
        { status: 400 }
      )
    }

    // 3. Baca form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const kategoriKey = (formData.get('kategori_key') as string)?.trim()
    const customNamaDokumen = (formData.get('nama_dokumen') as string)?.trim()
    const rawOnly = formData.get('raw_only') === 'true' || kategoriKey === 'raw_upload'
    const folderScope = ((formData.get('folder_scope') as string) || '').trim().toLowerCase()
    const tableTitle = ((formData.get('table_title') as string) || '').trim()
    const tahun = ((formData.get('tahun') as string) || '').trim()
    const permohonanId = ((formData.get('permohonan_id') as string) || '').trim()

    if (!file) {
      return NextResponse.json(
        { error: 'File dokumen wajib dipilih.' },
        { status: 400 }
      )
    }

    if (!rawOnly && !kategoriKey) {
      return NextResponse.json(
        { error: 'Kategori dokumen wajib ditentukan.' },
        { status: 400 }
      )
    }

    // Validasi ukuran, ekstensi allowlist, MIME type, dan magic bytes berkas
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const validation = validateUploadedDocument(file, buffer)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Format berkas dokumen tidak valid.' },
        { status: 400 }
      )
    }

    // Tentukan struktur subfolder otomatis sesuai bagian asal unggahan
    let folderPathSegments: string[] = []
    if (folderScope === 'informasi' || (!folderScope && !rawOnly && kategoriKey)) {
      let categoryLabel = kategoriKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
      if (kategoriKey) {
        const { data: kontenRow } = await supabase
          .from('konten_landing')
          .select('judul')
          .eq('section_key', kategoriKey)
          .maybeSingle()
        if (kontenRow?.judul?.trim()) {
          categoryLabel = kontenRow.judul.trim()
        }
      }
      folderPathSegments = ['Informasi Publik', categoryLabel]
    } else if (folderScope === 'daftar_informasi') {
      folderPathSegments = ['Daftar Informasi Publik']
      if (tableTitle) {
        folderPathSegments.push(tableTitle.slice(0, 70))
      }
      if (tahun && /^[a-zA-Z0-9\s\-]{2,20}$/.test(tahun)) {
        folderPathSegments.push(tahun)
      }
    } else if (folderScope === 'jawaban_permohonan') {
      const witaYear = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Makassar',
        year: 'numeric',
      }).format(new Date())
      folderPathSegments = ['Jawaban Permohonan', witaYear]
      if (/^\d+$/.test(permohonanId)) {
        folderPathSegments.push(`Tiket #${permohonanId}`)
      }
    }

    // 4. Unggah ke Google Drive
    const driveResult = await uploadFileToGoogleDrive({
      buffer,
      fileName: validation.safeFileName,
      mimeType: validation.safeMimeType,
      folderPathSegments,
    })

    if (rawOnly) {
      return NextResponse.json({
        success: true,
        fileUrl: driveResult.webViewLink,
        fileName: driveResult.fileName,
        fileId: driveResult.fileId,
        folderPath: driveResult.folderPath,
      })
    }

    // 5. Simpan catatan ke tabel dokumen_publik
    const namaDokumen = customNamaDokumen || validation.safeFileName.replace(/\.[^/.]+$/, '')

    const { data: newDoc, error: insertErr } = await supabase
      .from('dokumen_publik')
      .insert({
        kategori_key: kategoriKey,
        nama_dokumen: namaDokumen,
        file_url: driveResult.webViewLink,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (insertErr) {
      throw insertErr
    }

    revalidatePath('/admin/konten')
    revalidatePath('/', 'layout')
    revalidatePath('/informasi/[kategori]', 'page')

    return NextResponse.json({
      success: true,
      data: newDoc,
      fileUrl: driveResult.webViewLink,
      folderPath: driveResult.folderPath,
    })
  } catch (err: unknown) {
    console.error('[Upload to Drive Error]', err)
    return NextResponse.json(
      { error: 'Gagal mengunggah berkas ke Google Drive. Silakan coba kembali.' },
      { status: 500 }
    )
  }
}
