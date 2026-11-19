'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminBreadcrumb() {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    if (pathname === '/admin/survei') {
      return [
        { label: 'Admin Console', href: '/admin' },
        { label: 'Survei Kepuasan (IKM)', href: '/admin/survei', active: true },
      ]
    }
    if (pathname === '/admin/konten') {
      return [
        { label: 'Admin Console', href: '/admin' },
        { label: 'Kelola CMS & Dokumen', href: '/admin/konten', active: true },
      ]
    }
    if (pathname === '/admin/daftar-informasi') {
      return [
        { label: 'Admin Console', href: '/admin' },
        { label: 'Daftar Informasi Publik', href: '/admin/daftar-informasi', active: true },
      ]
    }
    if (pathname === '/admin/email-templates') {
      return [
        { label: 'Admin Console', href: '/admin' },
        { label: 'Template Email', href: '/admin/email-templates', active: true },
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
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600">
        {breadcrumbs.map((item, index) => (
          <li key={`${item.href}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-slate-400 select-none" aria-hidden="true">
                /
              </span>
            )}
            {item.active ? (
              <span aria-current="page" className="text-[#0e4891] font-bold">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-[#0e4891] transition-colors rounded-sm px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891] focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
