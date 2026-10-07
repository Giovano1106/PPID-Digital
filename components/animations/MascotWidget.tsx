'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'

gsap.registerPlugin(useGSAP)

interface MascotWidgetProps {
  /** Path ke file gambar maskot (SVG/PNG transparan) */
  imageSrc: string
  /** Teks tooltip opsional saat maskot diklik */
  tooltipText?: string
}

export default function MascotWidget({
  imageSrc,
  tooltipText = 'Halo! Ada yang bisa dibantu? Silakan ajukan permohonan informasi.',
}: MascotWidgetProps) {
  const mascotRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrance: mascot slides up from below
        gsap.from(mascotRef.current, {
          y: 60,
          autoAlpha: 0,
          duration: 0.8,
          ease: 'back.out(1.4)',
          delay: 1.2,
        })

        // Idle floating animation after entrance
        gsap.to(mascotRef.current, {
          y: -6,
          duration: 2.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 2.0,
        })
      })
    },
    { scope: mascotRef }
  )

  const handleClick = () => {
    setShowTooltip((prev) => !prev)

    if (!showTooltip && tooltipRef.current) {
      gsap.from(tooltipRef.current, {
        y: 8,
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {/* Tooltip Bubble */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="max-w-[220px] rounded-2xl rounded-br-sm bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-slate-700 shadow-lg border border-slate-200"
        >
          {tooltipText}
        </div>
      )}

      {/* Mascot Image */}
      <div
        ref={mascotRef}
        onClick={handleClick}
        className="relative w-[72px] h-[72px] md:w-[88px] md:h-[88px] cursor-pointer select-none drop-shadow-lg hover:scale-105 transition-transform duration-200"
        role="button"
        aria-label="Maskot PPID Digital"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick()
        }}
      >
        <Image
          src={imageSrc}
          alt="Maskot PPID Digital"
          fill
          className="object-contain"
          sizes="88px"
          priority={false}
        />
      </div>
    </div>
  )
}
