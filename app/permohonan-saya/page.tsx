import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

export default async function PermohonanSayaPage() {
  const supabase = await createClient()

  // 1. Cek User Logged In
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch Permohonan Milik User
  const { data: listPermohonan } = await supabase
    .from('permohonan')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'ditolak':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'diproses':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permohonan Saya</h1>
            <p className="text-sm text-gray-600">
              Pantau status riwayat permohonan informasi Anda.
            </p>
          </div>
          <Link
            href="/permohonan-saya/ajukan"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            + Buat Permohonan Baru
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {!listPermohonan || listPermohonan.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center text-gray-500">
              Belum ada permohonan yang diajukan.
            </div>
          ) : (
            listPermohonan.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      Status: {item.status}
                    </span>
                    <h2 className="mt-2 text-lg font-bold text-gray-900">
                      {item.rincian_informasi}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Tujuan: {item.tujuan_penggunaan}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                {/* Menampilkan alasan jika permohonan ditolak admin */}
                {item.alasan_penolakan && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                    <strong>Catatan Admin:</strong> {item.alasan_penolakan}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}