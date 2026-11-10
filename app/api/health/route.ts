import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          message: 'Konfigurasi environment Supabase belum disetel.',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Kueri database ringan untuk mencatat aktivitas resmi pada database Supabase
    // Sekaligus menjaga connection pool dan instance database tetap aktif (keep-alive)
    const { error } = await supabase
      .from('konten_landing')
      .select('id')
      .limit(1)

    const latencyMs = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        {
          status: 'degraded',
          database: {
            status: 'error',
            message: error.message,
            latencyMs,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        status: 'healthy',
        service: 'PPID Digital CIKASDA Sulteng',
        database: {
          status: 'connected',
          latencyMs,
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error'

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMessage,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

