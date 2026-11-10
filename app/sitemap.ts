import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ppid-digital.vercel.app'
  const currentDate = new Date()

  const categories = [
    'daftar_informasi_publik',
    'surat_keputusan',
    'visi_misi',
    'sop_spm',
    'pelayanan',
    'penghargaan',
    'permohonan_informasi',
    'dokumen_program_kegiatan',
  ]

  const categoryEntries: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/informasi/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryEntries,
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/daftar`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/lupa-sandi`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ]
}

