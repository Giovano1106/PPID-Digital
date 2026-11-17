import { NextResponse } from 'next/server'
import { isGoogleDriveConfigured } from '@/app/lib/gdrive'

export const dynamic = 'force-dynamic'

export async function GET() {
  const configured = isGoogleDriveConfigured()
  return NextResponse.json({
    configured,
    folderConfigured: Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID),
  })
}
