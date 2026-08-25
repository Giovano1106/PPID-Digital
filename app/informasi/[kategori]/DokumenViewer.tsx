'use client'

import { useState } from 'react'
import { FileText, ArrowUpRight } from '@phosphor-icons/react'

type DokumenPublik = {
  id: bigint
  kategori_key: string
  nama_dokumen: string
  file_url: string
}

export default function DokumenViewer({ dokumenList }: { dokumenList: DokumenPublik[] }) {
  const [selectedDoc, setSelectedDoc] = useState<DokumenPublik | null>(
    dokumenList.length > 0 ? dokumenList[0] : null
  )

  // Fungsi utilitas untuk mengekstrak ID Google Drive dan mengonversinya ke format preview
  const getDrivePreviewUrl = (url: string) => {
    try {
      if (url.includes('drive.google.com/file/d/')) {
        const id = url.split('/d/')[1].split('/')[0]
        return `https://drive.google.com/file/d/${id}/preview`
      }
      return url // fallback
    } catch {
      return url
    }
  }

  if (dokumenList.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="text-[#0e4891] mb-4 flex justify-center opacity-50"><FileText weight="fill" size={48} /></div>
        <h3 className="text-lg font-bold text-slate-900">Belum Ada Dokumen</h3>
        <p className="text-sm font-medium text-slate-500 mt-2">PPID CIKASDA belum mengunggah dokumen untuk kategori ini.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 flex-grow min-h-[600px] font-plus-jakarta">
      
      {/* Sidebar Kiri: Daftar Dokumen */}
      <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden h-[600px] lg:h-auto shadow-sm">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-sm uppercase tracking-wider text-slate-900">Daftar Dokumen ({dokumenList.length})</h2>
        </div>
        
        <div className="overflow-y-auto flex-grow p-4 space-y-3">
          {dokumenList.map((doc) => {
            const isSelected = selectedDoc?.id === doc.id
            return (
              <button
                key={doc.id.toString()}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected 
                    ? 'border-[#0e4891] bg-blue-50 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 ${isSelected ? 'text-[#0e4891]' : 'text-slate-400'}`}>
                    <FileText weight="fill" size={24} />
                  </span>
                  <div>
                    <h3 className={`text-sm leading-relaxed ${isSelected ? 'font-bold text-[#0e4891]' : 'font-semibold text-slate-700'}`}>
                      {doc.nama_dokumen}
                    </h3>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Konten Kanan: Preview PDF */}
      <div className="w-full lg:w-2/3 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px] lg:h-auto shadow-sm">
        {selectedDoc ? (
          <>
            <div className="p-4 md:p-5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-bold text-base text-slate-900 truncate pr-4">{selectedDoc.nama_dokumen}</h2>
              <a 
                href={selectedDoc.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs bg-[#0e4891] hover:bg-[#0a366f] text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors flex-shrink-0 inline-flex items-center gap-1.5"
              >
                Buka Tab Baru <ArrowUpRight weight="bold" size={14} />
              </a>
            </div>
            <div className="flex-grow bg-slate-100 relative">
              <iframe 
                src={getDrivePreviewUrl(selectedDoc.file_url)} 
                className="absolute inset-0 w-full h-full border-0 rounded-b-2xl"
                allow="autoplay"
              ></iframe>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 font-medium text-sm">
            Pilih dokumen di sebelah kiri untuk melihat preview
          </div>
        )}
      </div>

    </div>
  )
}
