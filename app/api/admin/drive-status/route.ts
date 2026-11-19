import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import {
  getGoogleDriveAuthMethod,
  isGoogleDriveConfigured,
} from '@/app/lib/gdrive'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Sesi tidak ditemukan.' },
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
        { error: 'Forbidden: Akses hanya untuk Administrator.' },
        { status: 403 }
      )
    }

    const configured = isGoogleDriveConfigured()
    const method = getGoogleDriveAuthMethod()
    return NextResponse.json({
      configured,
      method,
      folderConfigured: Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID),
    })
  } catch (err: unknown) {
    console.error('[GET /api/admin/drive-status Error]', err)
    return NextResponse.json(
      { error: 'Gagal memeriksa status koneksi Google Drive.' },
      { status: 500 }
    )
  }
}
