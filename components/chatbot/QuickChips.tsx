'use client'

import { QUICK_CHIPS, QuickChip } from './knowledgeBase'

interface QuickChipsProps {
  onSelect: (chip: QuickChip) => void
  disabled?: boolean
}

export default function QuickChips({ onSelect, disabled }: QuickChipsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50/70 border-t border-slate-100">
      <span className="w-full text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
        Topik Populer:
      </span>
      {QUICK_CHIPS.map((chip) => (
        <button
          key={chip.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          className="text-left text-xs font-semibold text-slate-700 bg-white hover:bg-blue-50/80 hover:text-[#0e4891] hover:border-blue-200 border border-slate-200/90 rounded-lg px-2.5 py-1.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e4891]"
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
