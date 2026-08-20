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
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'ditolak':
        return 'bg-rose-50 text-rose-800 border-rose-200'
      case 'diproses':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      default:
        return 'bg-blue-50 text-[#0e4891] border-blue-200'
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
    <main className="min-h-screen bg-slate-50 font-plus-jakarta py-12 selection:bg-amber-400 selection:text-slate-900">
      <div className="mx-auto max-w-5xl px-6">
        {/* Top bar with back to home link */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-xs font-bold text-[#0e4891] hover:underline flex items-center gap-1.5">
            ← Kembali ke Beranda PPID
          </Link>
          <span className="text-xs text-slate-500 font-medium">Akun: <span className="text-slate-900 font-bold">{user.email}</span></span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Riwayat Permohonan Saya</h1>
            <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
              Pantau status permohonan informasi publik dan jawaban resmi dari Admin PPID CIKASDA.
            </p>
          </div>
          <Link
            href="/permohonan-saya/ajukan"
            className="rounded-xl bg-[#0e4891] px-5 py-3 text-xs font-bold text-white hover:bg-[#0a366f] transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0e4891]/20 whitespace-nowrap"
          >
            + Buat Permohonan Baru
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          {!listPermohonan || listPermohonan.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0e4891] flex items-center justify-center font-bold text-lg mx-auto mb-3">
                📄
              </div>
              <p className="text-sm font-bold text-slate-800">Belum Ada Permohonan</p>
              <p className="text-xs text-slate-500 font-medium mt-1 mb-6">Anda belum pernah mengajukan permohonan informasi publik.</p>
              <Link
                href="/permohonan-saya/ajukan"
                className="inline-block rounded-xl bg-[#0e4891] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0a366f] transition-all shadow-sm"
              >
                Ajukan Sekarang
              </Link>
            </div>
          ) : (
            listPermohonan.map((item) => {
              const activeDeadline = item.deadline_akhir || item.deadline_awal
              const sisaHari = calculateDaysRemaining(activeDeadline)

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                          {item.jenis_informasi}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Diajukan pada:{' '}
                        <span className="text-slate-900 font-bold">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </p>
                    </div>

                    {/* BADGE SLA / SISA WAKTU */}
                    {item.status !== 'dijawab' && item.status !== 'ditolak' && (
                      <div className="text-right">
                        {item.diperpanjang && (
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md mb-1.5">
                            ⏱️ Diperpanjang +7 Hari
                          </span>
                        )}
                        {sisaHari !== null && (
                          <span
                            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border ${
                              sisaHari <= 2
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-blue-50 text-[#0e4891] border-blue-200'
                            }`}
                          >
                            {sisaHari < 0
                              ? 'Lewat Masa SLA'
                              : `SLA: Sisa ±${sisaHari} Hari Kerja`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* DESKRIPSI PERMOHONAN */}
                  <div className="mt-4 text-xs md:text-sm">
                    <p className="font-bold text-slate-900">Rincian Kebutuhan Informasi:</p>
                    <p className="text-slate-700 mt-1.5 whitespace-pre-line leading-relaxed font-medium">
                      {item.deskripsi}
                    </p>
                    <p className="text-xs text-slate-500 mt-3 italic font-medium">
                      Bentuk Salinan / Cara Memperoleh: <span className="font-bold text-slate-800 not-italic">{item.cara_memperoleh}</span>
                    </p>
                  </div>

                  {/* JAWABAN ADMIN (Bila sudah dijawab) */}
                  {item.jawaban_admin && (
                    <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs md:text-sm">
                      <div className="flex items-center gap-2 text-[#0e4891] font-bold mb-1">
                        <span>💬</span> Jawaban Resmi Admin PPID:
                      </div>
                      <p className="text-slate-800 mt-1.5 whitespace-pre-line leading-relaxed font-medium">
                        {item.jawaban_admin}
                      </p>
                    </div>
                  )}

                  {/* ALASAN PERPANJANGAN (Bila ada) */}
                  {item.diperpanjang && item.alasan_perpanjangan && (
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
                      <strong className="font-bold">Catatan Perpanjangan SLA:</strong> {item.alasan_perpanjangan}
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