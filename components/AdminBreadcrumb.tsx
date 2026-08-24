'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminBreadcrumb() {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    if (pathname === '/admin/konten') {
      return [
        { label: 'Admin Console', href: '/admin' },
        { label: 'Kelola CMS & Dokumen', href: '/admin/konten', active: true },
      ]
    }
    return [
      { label: 'Admin Console', href: '/admin' },
      { label: 'Kelola Permohonan', href: '/admin', active: true },
    ]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {breadcrumbs.map((item, index) => (
          <li key={`${item.href}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-slate-300">/</span>}
            {item.active ? (
              <span className="text-[#0e4891] font-bold">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-[#0e4891] transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
