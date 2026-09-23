'use client'

import React, { useState } from 'react'
import {
  Star,
  CheckCircle,
  ChatTeardropText,
  PaperPlaneRight,
  SpinnerGap,
  ShieldCheck,
  CalendarBlank,
} from '@phosphor-icons/react'
import { submitSurveiKepuasan } from '@/app/actions/survei'

interface SurveiData {
  id?: number
  permohonan_id?: number
  skor_keseluruhan: number
  kecepatan_layanan: number
  kesesuaian_informasi: number
  kemudahan_prosedur: number
  kritik_saran?: string | null
  created_at?: string
}

interface SurveiKepuasanCardProps {
  permohonanId: number
  initialSurvei: SurveiData | null
}

const SKOR_LABELS: Record<number, string> = {
  1: 'Sangat Tidak Puas',
  2: 'Tidak Puas',
  3: 'Cukup Puas',
  4: 'Puas',
  5: 'Sangat Puas',
}

const KECEPATAN_LABELS: Record<number, string> = {
  1: 'Sangat Lambat',
  2: 'Lambat',
  3: 'Cukup',
  4: 'Cepat',
  5: 'Sangat Cepat',
}

const KESESUAIAN_LABELS: Record<number, string> = {
  1: 'Sangat Tidak Sesuai',
  2: 'Tidak Sesuai',
  3: 'Cukup Sesuai',
  4: 'Sesuai',
  5: 'Sangat Sesuai',
}

const KEMUDAHAN_LABELS: Record<number, string> = {
  1: 'Sangat Sulit',
  2: 'Sulit',
  3: 'Cukup Mudah',
  4: 'Mudah',
  5: 'Sangat Mudah',
}

export default function SurveiKepuasanCard({
  permohonanId,
  initialSurvei,
}: SurveiKepuasanCardProps) {
  const [survei, setSurvei] = useState<SurveiData | null>(initialSurvei)
  const [skorKeseluruhan, setSkorKeseluruhan] = useState<number>(0)
  const [hoverSkor, setHoverSkor] = useState<number>(0)
  const [kecepatanLayanan, setKecepatanLayanan] = useState<number>(0)
  const [kesesuaianInformasi, setKesesuaianInformasi] = useState<number>(0)
  const [kemudahanProsedur, setKemudahanProsedur] = useState<number>(0)
  const [kritikSaran, setKritikSaran] = useState<string>('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (
      skorKeseluruhan === 0 ||
      kecepatanLayanan === 0 ||
      kesesuaianInformasi === 0 ||
      kemudahanProsedur === 0
    ) {
      setErrorMsg('Mohon lengkapi semua aspek penilaian (bintang 1 s.d. 5) sebelum mengirim.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await submitSurveiKepuasan({
        permohonanId,
        skorKeseluruhan,
        kecepatanLayanan,
        kesesuaianInformasi,
        kemudahanProsedur,
        kritikSaran: kritikSaran.trim() || undefined,
      })

      if (!res.success) {
        setErrorMsg(res.error || 'Terjadi kendala saat menyimpan survei.')
      } else {
        setSuccessMsg(res.message || 'Survei kepuasan berhasil dikirim.')
        setSurvei({
          permohonan_id: permohonanId,
          skor_keseluruhan: skorKeseluruhan,
          kecepatan_layanan: kecepatanLayanan,
          kesesuaian_informasi: kesesuaianInformasi,
          kemudahan_prosedur: kemudahanProsedur,
          kritik_saran: kritikSaran.trim() || null,
          created_at: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengirim survei. Silakan periksa koneksi Anda.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tampilan 1: Sudah Mengisi Survei (Bukti Partisipasi)
  if (survei) {
    const formattedDate = survei.created_at
      ? new Date(survei.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null

    return (
      <div className="mt-8 border border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Header Bukti Survei */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm mt-0.5">
              <CheckCircle weight="fill" size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-1">
                <ShieldCheck weight="bold" size={13} />
                Partisipasi Terverifikasi
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Survei Kepuasan Masyarakat (IKM) Telah Diisi
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Terima kasih atas kontribusi Anda dalam menilai mutu pelayanan informasi publik PPID Dinas CIKASDA.
              </p>
            </div>
          </div>

          {formattedDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-2xs self-start sm:self-auto">
              <CalendarBlank size={14} className="text-emerald-700" />
              <span>Diisi pada: {formattedDate}</span>
            </div>
          )}
        </div>

        {/* Ringkasan Skor Penilaian */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Skor Keseluruhan */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Kepuasan Umum
            </span>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  weight={star <= survei.skor_keseluruhan ? 'fill' : 'regular'}
                  className={star <= survei.skor_keseluruhan ? 'text-amber-500' : 'text-slate-300'}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-800">
              {SKOR_LABELS[survei.skor_keseluruhan] || `${survei.skor_keseluruhan} / 5`}
            </p>
          </div>

          {/* Kecepatan Layanan */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Kecepatan SLA
            </span>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  weight={star <= survei.kecepatan_layanan ? 'fill' : 'regular'}
                  className={star <= survei.kecepatan_layanan ? 'text-amber-500' : 'text-slate-300'}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-800">
              {KECEPATAN_LABELS[survei.kecepatan_layanan] || `${survei.kecepatan_layanan} / 5`}
            </p>
          </div>

          {/* Kesesuaian Informasi */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Kesesuaian Informasi
            </span>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  weight={star <= survei.kesesuaian_informasi ? 'fill' : 'regular'}
                  className={star <= survei.kesesuaian_informasi ? 'text-amber-500' : 'text-slate-300'}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-800">
              {KESESUAIAN_LABELS[survei.kesesuaian_informasi] || `${survei.kesesuaian_informasi} / 5`}
            </p>
          </div>

          {/* Kemudahan Prosedur */}
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Kemudahan Prosedur
            </span>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  weight={star <= survei.kemudahan_prosedur ? 'fill' : 'regular'}
                  className={star <= survei.kemudahan_prosedur ? 'text-amber-500' : 'text-slate-300'}
                />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-800">
              {KEMUDAHAN_LABELS[survei.kemudahan_prosedur] || `${survei.kemudahan_prosedur} / 5`}
            </p>
          </div>
        </div>

        {/* Catatan / Saran jika ada */}
        {survei.kritik_saran && (
          <div className="mt-4 bg-white/90 p-4 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1.5">
              <ChatTeardropText size={15} className="text-[#0e4891]" />
              Masukan / Saran yang Diberikan:
            </span>
            <p className="text-xs text-slate-700 italic leading-relaxed">
              &ldquo;{survei.kritik_saran}&rdquo;
            </p>
          </div>
        )}
      </div>
    )
  }

  // Tampilan 2: Form Penilaian Survei Baru
  return (
    <div className="mt-8 border border-slate-200 bg-white rounded-2xl p-6 md:p-8 shadow-sm">
      {/* Header Formulir */}
      <div className="flex items-start gap-3 pb-6 border-b border-slate-100">
        <div className="p-2.5 bg-[#0e4891] text-white rounded-xl shadow-sm mt-0.5">
          <Star weight="fill" size={24} />
        </div>
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0e4891] text-[11px] font-bold tracking-wide uppercase mb-1">
            Standar PermenPAN-RB No. 14 Tahun 2017
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Survei Kepuasan Masyarakat (IKM)
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            Permohonan informasi Anda telah selesai dijawab. Mohon kesediaan Anda memberikan penilaian secara objektif demi peningkatan mutu pelayanan publik Dinas CIKASDA Sulteng.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Aspek 1: Kepuasan Keseluruhan */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            1. Kepuasan Umum terhadap Layanan Informasi Publik <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Bagaimana kepuasan Anda secara keseluruhan atas penyelesaian permohonan informasi ini?
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const activeVal = hoverSkor || skorKeseluruhan
              const isFilled = star <= activeVal
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverSkor(star)}
                  onMouseLeave={() => setHoverSkor(0)}
                  onClick={() => setSkorKeseluruhan(star)}
                  className="p-1 rounded hover:scale-110 transition-transform focus:outline-none"
                  aria-label={`Skor ${star}`}
                >
                  <Star
                    size={28}
                    weight={isFilled ? 'fill' : 'regular'}
                    className={isFilled ? 'text-amber-500' : 'text-slate-300'}
                  />
                </button>
              )
            })}
            <span className="text-xs font-bold text-slate-700 ml-2">
              {hoverSkor
                ? SKOR_LABELS[hoverSkor]
                : skorKeseluruhan
                ? SKOR_LABELS[skorKeseluruhan]
                : 'Pilih 1 s.d. 5 Bintang'}
            </span>
          </div>
        </div>

        {/* Aspek 2: Kecepatan Layanan & SLA */}
        <div className="p-5 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            2. Kecepatan Respons & Ketepatan Waktu Pelayanan (SLA) <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Seberapa cepat dan tepat waktu petugas PPID dalam merespons dan menjawab permohonan Anda?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = kecepatanLayanan === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setKecepatanLayanan(val)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    isSelected
                      ? 'border-[#0e4891] bg-[#0e4891] text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span>{val} Bintang</span>
                    <Star size={13} weight={isSelected ? 'fill' : 'regular'} />
                  </div>
                  <div className={`text-[11px] font-normal truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {KECEPATAN_LABELS[val]}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Aspek 3: Kesesuaian & Kualitas Informasi */}
        <div className="p-5 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            3. Kesesuaian & Kualitas Dokumen Informasi <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Apakah dokumen/jawaban yang diberikan telah sesuai dengan rincian informasi yang Anda butuhkan?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = kesesuaianInformasi === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setKesesuaianInformasi(val)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    isSelected
                      ? 'border-[#0e4891] bg-[#0e4891] text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span>{val} Bintang</span>
                    <Star size={13} weight={isSelected ? 'fill' : 'regular'} />
                  </div>
                  <div className={`text-[11px] font-normal truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {KESESUAIAN_LABELS[val]}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Aspek 4: Kemudahan Prosedur & Portal */}
        <div className="p-5 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            4. Kemudahan Prosedur & Akses Portal PPID Digital <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Bagaimana kemudahan tata cara pengajuan serta kemudahan navigasi sistem PPID Digital Dinas CIKASDA?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((val) => {
              const isSelected = kemudahanProsedur === val
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setKemudahanProsedur(val)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    isSelected
                      ? 'border-[#0e4891] bg-[#0e4891] text-white shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span>{val} Bintang</span>
                    <Star size={13} weight={isSelected ? 'fill' : 'regular'} />
                  </div>
                  <div className={`text-[11px] font-normal truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {KEMUDAHAN_LABELS[val]}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Umpan Balik Kualitatif (Kritik & Saran) */}
        <div>
          <label
            htmlFor="kritik-saran"
            className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between"
          >
            <span>Kritik, Saran & Aspirasi (Opsional)</span>
            <span className="text-[11px] font-normal text-slate-400">
              {kritikSaran.length}/500 karakter
            </span>
          </label>
          <textarea
            id="kritik-saran"
            rows={3}
            maxLength={500}
            value={kritikSaran}
            onChange={(e) => setKritikSaran(e.target.value)}
            placeholder="Tuliskan pengalaman Anda atau saran perbaikan mutu pelayanan publik PPID..."
            className="w-full text-xs rounded-xl border border-slate-300 p-3.5 text-slate-800 placeholder-slate-400 focus:border-[#0e4891] focus:ring-1 focus:ring-[#0e4891] outline-none transition-colors"
          />
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle weight="fill" size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <SpinnerGap size={16} className="animate-spin" />
                <span>Menyimpan Penilaian...</span>
              </>
            ) : (
              <>
                <PaperPlaneRight weight="bold" size={16} />
                <span>Kirim Survei Kepuasan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
