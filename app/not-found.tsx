'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { WarningCircle, House, ArrowLeft } from '@phosphor-icons/react'

export default function NotFound() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-50 font-plus-jakarta flex items-center justify-center p-6 selection:bg-amber-400 selection:text-slate-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-amber-100 p-4 rounded-full">
            <WarningCircle weight="fill" size={64} className="text-amber-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Halaman Tidak Ditemukan
        </h1>
        
        <p className="text-slate-600 font-medium mb-8 leading-relaxed">
          Maaf, halaman yang Anda cari tidak ada atau mungkin telah dipindahkan. Silakan periksa kembali URL yang Anda masukkan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 bg-white text-slate-700 font-bold border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft weight="bold" size={18} />
            Kembali
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-[#0e4891] text-white font-bold rounded-xl hover:bg-[#0a366f] hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <House weight="fill" size={18} />
            Ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}
