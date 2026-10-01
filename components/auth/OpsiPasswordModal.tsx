'use client'

import React, { useState } from 'react'
import { Key, X, CheckCircle, Warning, Lock, Eye, EyeSlash } from '@phosphor-icons/react'
import { createClient } from '@/app/lib/supabase/client'

interface OpsiPasswordModalProps {
  isOpen: boolean
  mode?: 'first_time' | 'google_login'
  onClose: () => void
  onSuccessToast?: (msg: string) => void
}

export default function OpsiPasswordModal({
  isOpen,
  mode = 'first_time',
  onClose,
  onSuccessToast,
}: OpsiPasswordModalProps) {
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal harus terdiri dari 6 karakter.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setErrorMsg(error.message || 'Gagal memperbarui kata sandi. Silakan coba lagi.')
        setLoading(false)
        return
      }

      const msg = 'Kata sandi berhasil disimpan! Anda sekarang dapat masuk menggunakan form login (Email/NIK + Kata Sandi).'
      setSuccessMsg(msg)
      if (onSuccessToast) {
        onSuccessToast(msg)
      }

      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: unknown) {
      console.error('[Update Password Error]', err)
      setErrorMsg('Terjadi kesalahan saat menyimpan kata sandi.')
      setLoading(false)
    }
  }

  const isFirstTime = mode === 'first_time'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Tombol Tutup (X) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} weight="bold" />
        </button>

        {/* Header Visual */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0e4891] shrink-0">
            <Key size={26} weight="duotone" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0e4891] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
              {isFirstTime ? 'Opsi Tambahan' : 'Keamanan Akun'}
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {isFirstTime ? 'Atur Kata Sandi Akun' : 'Opsi Ganti Kata Sandi'}
            </h2>
          </div>
        </div>

        {/* Penjelasan Fungsional */}
        <p className="text-xs text-slate-600 leading-relaxed mb-5 font-medium">
          {isFirstTime
            ? 'Buat kata sandi agar nantinya Anda juga dapat masuk melalui form login konvensional menggunakan Alamat Email atau 16 Digit NIK.'
            : 'Anda masuk menggunakan akun Google. Jika diinginkan, Anda dapat membuat atau memperbarui kata sandi akun ini agar bisa masuk lewat form login biasa.'}
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 leading-relaxed flex items-start gap-2">
            <Warning size={16} weight="fill" className="text-rose-500 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700 leading-relaxed flex items-start gap-2">
            <CheckCircle size={16} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Kata Sandi Baru <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading || !!successMsg}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all pl-10 pr-10 disabled:bg-slate-100 disabled:opacity-75"
              />
              <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
              Konfirmasi Kata Sandi <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading || !!successMsg}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-[#0e4891] focus:ring-2 focus:ring-[#0e4891]/20 focus:outline-none transition-all pl-10 disabled:bg-slate-100 disabled:opacity-75"
              />
              <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || !!successMsg}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors text-center cursor-pointer disabled:opacity-50"
            >
              Nanti Saja
            </button>
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0e4891] hover:bg-[#0a366f] text-xs font-bold text-white shadow-sm hover:shadow transition-all disabled:opacity-50 text-center cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan Sandi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
