import Link from 'next/link'

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
          <span className="text-xs font-bold text-slate-400">
            {count} File
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
        className="w-full text-center bg-slate-50 hover:bg-[#0e4891] hover:text-white border border-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-lg transition-all block mt-4"
      >
        Lihat Dokumen ({count}) →
      </Link>
    </div>
  )
}
