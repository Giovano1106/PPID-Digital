'use client'
 
import { useEffect } from 'react'
import Link from 'next/link'
import { WarningCircle, ArrowCounterClockwise, House } from '@phosphor-icons/react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application Error:', error)
  }, [error])
 
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-plus-jakarta">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center p-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100">
            <WarningCircle weight="duotone" size={48} className="text-rose-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Terjadi Kesalahan</h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          Maaf, terjadi kendala saat memuat halaman ini. Silakan coba muat ulang atau kembali ke beranda.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <ArrowCounterClockwise weight="bold" size={18} />
            Coba Muat Ulang
          </button>
          
          <Link
            href="/"
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl border border-slate-200 transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
          >
            <House weight="bold" size={18} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
