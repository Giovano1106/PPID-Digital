import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* SIDEBAR ADMIN */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-bold text-lg">Admin PPID</span>
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition"
            >
              Daftar Permohonan
            </Link>
            <Link
              href="/admin/konten"
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Kelola Landing Page
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition"
          >
            ← Keluar ke Web Publik
          </Link>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}