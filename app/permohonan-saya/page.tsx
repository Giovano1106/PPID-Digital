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
      case 'dijawab':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'ditolak':
        return 'bg-rose-100 text-rose-800 border-rose-300'
      case 'diproses':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  // Fungsi menghitung sisa hari kerja dari hari ini ke deadline
  const calculateDaysRemaining = (deadlineStr: string | null) => {
    if (!deadlineStr) return null
    const deadline = new Date(deadlineStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    deadline.setHours(0, 0, 0, 0)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-6">
        {/* Top bar with back to home link */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xs font-bold text-[#0e4891] hover:underline">
            ← Beranda Utama PPID
          </Link>
          <span className="text-xs text-slate-500 font-medium">Akun: {user.email}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Riwayat Permohonan Saya</h1>
            <p className="text-sm text-slate-600 mt-1">
              Pantau status permohonan informasi publik dan jawaban dari Admin PPID.
            </p>
          </div>
          <Link
            href="/permohonan-saya/ajukan"
            className="rounded-xl bg-[#0e4891] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#0a366f] transition"
          >
            + Ajukan Permohonan Baru
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          {!listPermohonan || listPermohonan.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 font-medium">
              Belum ada permohonan yang diajukan. Klik tombol di atas untuk mengajukan.
            </div>
          ) : (
            listPermohonan.map((item) => {
              const activeDeadline = item.deadline_akhir || item.deadline_awal
              const sisaHari = calculateDaysRemaining(activeDeadline)

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs font-extrabold uppercase ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          {item.jenis_informasi}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Diajukan pada:{' '}
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* BADGE SLA / SISA WAKTU */}
                    {item.status !== 'dijawab' && item.status !== 'ditolak' && (
                      <div className="text-right">
                        {item.diperpanjang && (
                          <span className="block text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mb-1">
                            ⚠️ Diperpanjang +7 Hari Kerja
                          </span>
                        )}
                        {sisaHari !== null && (
                          <span
                            className={`inline-block text-xs font-bold px-3 py-1 rounded-lg border ${
                              sisaHari <= 2
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {sisaHari < 0
                              ? 'Lewat deadline SLA'
                              : `SLA: Sisa ±${sisaHari} Hari`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* DESKRIPSI PERMOHONAN */}
                  <div className="mt-4 text-sm">
                    <p className="font-bold text-slate-800">Deskripsi / Rincian Kebutuhan:</p>
                    <p className="text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                      {item.deskripsi}
                    </p>
                    <p className="text-xs text-slate-500 mt-3 italic">
                      Cara memperoleh: {item.cara_memperoleh}
                    </p>
                  </div>

                  {/* JAWABAN ADMIN (Bila sudah dijawab) */}
                  {item.jawaban_admin && (
                    <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm">
                      <p className="font-bold text-emerald-900">Jawaban Admin PPID:</p>
                      <p className="text-emerald-800 mt-1 whitespace-pre-line leading-relaxed">
                        {item.jawaban_admin}
                      </p>
                    </div>
                  )}

                  {/* ALASAN PERPANJANGAN (Bila ada) */}
                  {item.diperpanjang && item.alasan_perpanjangan && (
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                      <strong>Catatan Perpanjangan SLA:</strong> {item.alasan_perpanjangan}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}