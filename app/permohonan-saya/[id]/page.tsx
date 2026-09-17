import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { ArrowLeft, Timer, ChatTeardropText, Info, FileText, ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import PermohonanRealtimeListener from '@/components/PermohonanRealtimeListener'

export default async function PermohonanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const permohonanId = resolvedParams.id
  
  const supabase = await createClient()

  // 1. Cek User Logged In
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch Permohonan spesifik
  const { data: permohonan } = await supabase
    .from('permohonan')
    .select('*')
    .eq('id', permohonanId)
    .single()

  if (!permohonan) {
    notFound()
  }

  // 3. Keamanan: Pastikan permohonan ini milik user yang sedang login
  if (permohonan.user_id !== user.id) {
    redirect('/permohonan-saya')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'diajukan':
        return 'bg-blue-50 text-[#0e4891] border-blue-200'
      case 'diproses':
        return 'bg-slate-100 text-slate-800 border-slate-300'
      case 'dijawab':
        return 'bg-[#0e4891] text-white border-[#0e4891]'
      case 'ditolak':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  // Fungsi menghitung sisa hari kerja (Senin s.d. Jumat) dari hari ini ke tanggal tenggat
  const calculateDaysRemaining = (deadlineStr: string | null) => {
    if (!deadlineStr) return null

    const parts = deadlineStr.split('T')[0].split('-').map(Number)
    if (parts.length !== 3) return null

    const deadline = new Date(parts[0], parts[1] - 1, parts[2])
    deadline.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (deadline.getTime() < today.getTime()) {
      let overdueCount = 0
      const cur = new Date(deadline)
      while (cur.getTime() < today.getTime()) {
        cur.setDate(cur.getDate() + 1)
        const day = cur.getDay()
        if (day !== 0 && day !== 6) overdueCount--
      }
      return overdueCount
    }

    let workingDays = 0
    const cur = new Date(today)
    while (cur.getTime() < deadline.getTime()) {
      cur.setDate(cur.getDate() + 1)
      const day = cur.getDay()
      if (day !== 0 && day !== 6) workingDays++
    }
    return workingDays
  }

  const activeDeadline = permohonan.deadline_akhir || permohonan.deadline_awal
  const sisaHari = calculateDaysRemaining(activeDeadline)

  // Fungsi mengekstrak URL Google Drive dari teks jawaban_admin
  const extractDriveUrls = (text: string | null) => {
    if (!text) return []
    // Deteksi url dengan http/https
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const urls = text.match(urlRegex) || []
    return urls.filter(url => url.includes('drive.google.com/file/d/'))
  }

  const driveUrls = extractDriveUrls(permohonan.jawaban_admin)

  // Fungsi mengonversi URL Google Drive ke format preview
  const getDrivePreviewUrl = (url: string) => {
    try {
      const id = url.split('/d/')[1].split('/')[0]
      return `https://drive.google.com/file/d/${id}/preview`
    } catch {
      return url
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 font-plus-jakarta py-12 selection:bg-[#0e4891] selection:text-white">
      <PermohonanRealtimeListener userId={user.id} permohonanId={permohonan.id} />
      <div className="mx-auto max-w-4xl px-6">
        
        {/* Navigasi Atas */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/permohonan-saya" className="text-xs font-bold text-[#0e4891] hover:underline flex items-center gap-1.5">
            <ArrowLeft weight="bold" size={14} /> Kembali ke Riwayat
          </Link>
          <span className="text-xs text-slate-500 font-medium">Akun: <span className="text-slate-900 font-bold">{user.email}</span></span>
        </div>

        {/* Card Utama Detail Permohonan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Card */}
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">Detail Permohonan</h1>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  ID: <span className="font-bold text-slate-800 tracking-wider">#{permohonan.id}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-widest ${getStatusBadge(permohonan.status)}`}>
                  {permohonan.status}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded">
                  {permohonan.jenis_informasi}
                </span>
              </div>
            </div>

            {/* SLA Info Panel */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tanggal Pengajuan</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(permohonan.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="w-px bg-slate-200 hidden md:block"></div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tenggat Waktu SLA</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(activeDeadline).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
              
              {permohonan.status !== 'dijawab' && permohonan.status !== 'ditolak' && sisaHari !== null && (
                <>
                  <div className="w-px bg-slate-200 hidden md:block"></div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className={`inline-block text-[11px] text-center font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
                        sisaHari <= 2 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-[#0e4891] border-blue-200'
                      }`}
                    >
                      {sisaHari < 0
                        ? `Lewat Masa SLA (${Math.abs(sisaHari)} Hari Kerja)`
                        : sisaHari === 0
                        ? 'Batas SLA: Hari Ini'
                        : `Sisa ${sisaHari} Hari Kerja`}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {permohonan.diperpanjang && (
              <div className="mt-3 flex items-start gap-2 bg-slate-100 text-slate-800 p-3 rounded-lg border border-slate-200 text-xs">
                <Timer weight="fill" size={16} className="shrink-0 mt-0.5 text-slate-600" />
                <div>
                  <strong className="font-bold block mb-0.5 text-slate-900">SLA Diperpanjang +7 Hari</strong>
                  {permohonan.alasan_perpanjangan}
                </div>
              </div>
            )}
          </div>

          {/* Body Card */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Rincian Permohonan */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Info weight="bold" size={18} className="text-[#0e4891]" /> Rincian Kebutuhan Informasi
              </h3>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-slate-700 whitespace-pre-line leading-relaxed font-medium text-sm">
                  {permohonan.deskripsi}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-medium text-slate-500">
                  Preferensi Salinan: <span className="font-bold text-slate-800">{permohonan.cara_memperoleh}</span>
                </div>
              </div>
            </div>

            {/* Jawaban Admin */}
            {permohonan.jawaban_admin && (
              <div className="scroll-mt-8" id="jawaban">
                <h3 className="text-sm font-bold text-[#0e4891] uppercase tracking-wider flex items-center gap-2 mb-3">
                  <ChatTeardropText weight="fill" size={18} /> Balasan / Keputusan Admin
                </h3>
                
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 shadow-sm mb-6">
                  <p className="text-slate-800 whitespace-pre-line leading-relaxed font-medium text-sm">
                    {permohonan.jawaban_admin}
                  </p>
                </div>

                {/* Google Drive Previews */}
                {driveUrls.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <FileText weight="fill" size={16} className="text-[#0e4891]" /> Pratinjau Dokumen Terlampir
                    </h4>
                    
                    <div className="grid gap-6">
                      {driveUrls.map((url: string, index: number) => (
                        <div key={index} className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[500px]">
                          <div className="bg-white p-3 border-b border-slate-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-600">Lampiran Dokumen {index + 1}</span>
                            <a 
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold bg-[#0e4891] hover:bg-[#0a366f] text-white px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1"
                            >
                              Buka di Tab Baru <ArrowUpRight weight="bold" size={12} />
                            </a>
                          </div>
                          <div className="flex-grow relative">
                            <iframe 
                              src={getDrivePreviewUrl(url)} 
                              className="absolute inset-0 w-full h-full border-0"
                              allow="autoplay"
                            ></iframe>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </main>
  )
}
