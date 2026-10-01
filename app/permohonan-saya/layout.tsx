import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import AuthModalsWrapper from '@/components/auth/AuthModalsWrapper'

export default async function PermohonanSayaLayout({
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

  // Ambil profil untuk memeriksa kelengkapan data NIK dan Telepon
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama, nik, telepon, email')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <>
      <Suspense fallback={null}>
        <AuthModalsWrapper user={user} profile={profile} />
      </Suspense>
      {children}
    </>
  )
}
