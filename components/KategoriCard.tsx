import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'

interface KategoriCardProps {
  title: string
  description: string
  badge: string
  count: number
  href: string
}

export default function KategoriCard({
  title,
  description,
  badge,
  count,
  href,
}: KategoriCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {badge}
          </span>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {count} Dokumen
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 mb-2">
          {title}
        </h3>

        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="w-full text-center bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
      >
        Lihat Dokumen <ArrowRight weight="bold" size={14} />
      </Link>
    </div>
  )
}
