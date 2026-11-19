import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { getStatistikIKMAdmin } from '@/app/actions/survei'
import { buildSurveiIkmWorkbook, getWitaDateYmd } from '@/app/lib/excel-export'

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

    const statsResult = await getStatistikIKMAdmin()
    if (!statsResult.success || !statsResult.data) {
      return NextResponse.json(
        { error: statsResult.error || 'Gagal mengambil data rekapitulasi IKM.' },
        { status: 500 }
      )
    }

    const buffer = await buildSurveiIkmWorkbook(statsResult.data)
    const filename = `Rekapitulasi_IKM_PPID_${getWitaDateYmd()}.xlsx`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (err: unknown) {
    console.error('[GET /api/admin/export-survei Error]', err)
    return NextResponse.json(
      { error: 'Gagal menghasilkan berkas Excel rekapitulasi IKM.' },
      { status: 500 }
    )
  }
}
