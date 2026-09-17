import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'

interface KategoriCardProps {
  title: string
  description: string
  badge: string
  count?: number
  showCount?: boolean
  href: string
  buttonText?: string
}

export default function KategoriCard({
  title,
  description,
  badge,
  count = 0,
  showCount = true,
  href,
  buttonText = 'Lihat Dokumen',
}: KategoriCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full group hover:border-slate-300">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {badge}
          </span>
          {showCount && (
            <span className="text-xs font-semibold text-slate-500">
              {count} Dokumen
            </span>
          )}
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-[#0e4891] transition-colors">
          {title}
        </h3>

        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="w-full text-center bg-[#0e4891] hover:bg-[#0a366f] text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm group-hover:shadow"
      >
        {buttonText} <ArrowRight weight="bold" size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}
