import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import {
  buildPermohonanReportWorkbook,
  getWitaDateYmd,
  PermohonanExportRow,
} from '@/app/lib/excel-export'

export const dynamic = 'force-dynamic'

interface RawPermohonanProfile {
  nama: string | null
  nik: string | null
  email: string | null
  telepon: string | null
}

interface RawPermohonanDbRow {
  id: number
  created_at: string
  jenis_informasi: string
  deskripsi: string
  cara_memperoleh: string
  status: string
  deadline_awal: string | null
  deadline_akhir: string | null
  diperpanjang: boolean
  profiles: RawPermohonanProfile | RawPermohonanProfile[] | null
}

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

    const { data, error } = await supabase
      .from('permohonan')
      .select(`
        id,
        created_at,
        jenis_informasi,
        deskripsi,
        cara_memperoleh,
        status,
        deadline_awal,
        deadline_akhir,
        diperpanjang,
        profiles (
          nama,
          nik,
          email,
          telepon
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/admin/export-permohonan DB Error]', error)
      return NextResponse.json(
        { error: 'Gagal memuat data permohonan untuk laporan Excel.' },
        { status: 500 }
      )
    }

    const normalizedRows: PermohonanExportRow[] = ((data || []) as RawPermohonanDbRow[]).map(
      (row) => {
        const prof = Array.isArray(row.profiles) ? row.profiles[0] || null : row.profiles
        return {
          id: row.id,
          created_at: row.created_at,
          jenis_informasi: row.jenis_informasi,
          deskripsi: row.deskripsi,
          cara_memperoleh: row.cara_memperoleh,
          status: row.status,
          deadline_awal: row.deadline_awal,
          deadline_akhir: row.deadline_akhir,
          diperpanjang: row.diperpanjang,
          profiles: prof,
        }
      }
    )

    const buffer = await buildPermohonanReportWorkbook(normalizedRows)
    const filename = `Laporan_Permohonan_PPID_${getWitaDateYmd()}.xlsx`

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
    console.error('[GET /api/admin/export-permohonan Error]', err)
    return NextResponse.json(
      { error: 'Gagal menghasilkan berkas Excel laporan permohonan.' },
      { status: 500 }
    )
  }
}
