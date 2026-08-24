'use client'

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-5 w-36 rounded-md bg-slate-200" />
            <div className="h-4 w-28 rounded-md bg-slate-100" />
          </div>
          <div className="h-3.5 w-64 rounded-md bg-slate-100" />
        </div>
        <div className="space-y-2 flex flex-col items-end">
          <div className="h-6 w-20 rounded-full bg-slate-200" />
          <div className="h-3.5 w-28 rounded-md bg-slate-100" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="mt-4 space-y-2.5">
        <div className="h-4 w-28 rounded-md bg-slate-200" />
        <div className="h-3.5 w-full rounded-md bg-slate-100" />
        <div className="h-3.5 w-4/5 rounded-md bg-slate-100" />
        <div className="h-3 w-48 rounded-md bg-slate-100 mt-2" />
      </div>

      {/* Action buttons skeleton */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="h-8 w-36 rounded-xl bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-8 w-28 rounded-xl bg-slate-200" />
          <div className="h-8 w-20 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  )
}
