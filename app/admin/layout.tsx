import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import AdminSidebar from '@/components/AdminSidebar'
import AdminBreadcrumb from '@/components/AdminBreadcrumb'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Proteksi Role: Hanya user dengan role 'admin' yang dapat mengakses
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nama')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta text-slate-900 flex flex-col md:flex-row antialiased selection:bg-[#0e4891] selection:text-white">
      {/* RESPONSIVE SIDEBAR COMPONENT */}
      <AdminSidebar adminName={profile.nama || user.email || 'Admin'} />

      {/* CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <AdminBreadcrumb />
          {children}
        </div>
      </main>
    </div>
  )
}