'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function LandingAnimations({
  children,
}: {
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          isMobile: '(max-width: 767px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { reduceMotion } = context.conditions!

          // Respect user preference for reduced motion
          if (reduceMotion) return

          // ── Hero Section ──
          // Entrance animation for the hero badge, heading, paragraph, and CTA buttons
          gsap.from('[data-animate="hero-badge"]', {
            y: 16,
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.1,
          })

          gsap.from('[data-animate="hero-title"]', {
            y: 24,
            autoAlpha: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.25,
          })

          gsap.from('[data-animate="hero-desc"]', {
            y: 20,
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.4,
          })

          gsap.from('[data-animate="hero-cta"]', {
            y: 18,
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.55,
          })

          // ── Tentang PPID Section ──
          // Fade and scale reveal when scrolling into view
          gsap.from('[data-animate="tentang-mascot"]', {
            scale: 0.88,
            autoAlpha: 0,
            duration: 0.7,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: '[data-animate="tentang-mascot"]',
              start: 'top 85%',
              once: true,
            },
          })

          gsap.from('[data-animate="tentang-content"]', {
            x: 24,
            autoAlpha: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '[data-animate="tentang-content"]',
              start: 'top 85%',
              once: true,
            },
          })

          // ── Alur Permohonan Section ──
          // Section header fade-in
          gsap.from('[data-animate="alur-header"]', {
            y: 24,
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '[data-animate="alur-header"]',
              start: 'top 85%',
              once: true,
            },
          })

          // Diagram reveal
          gsap.from('[data-animate="alur-diagram"]', {
            y: 30,
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '[data-animate="alur-diagram"]',
              start: 'top 80%',
              once: true,
            },
          })

          // ── Kategori Section ──
          // Section header
          gsap.from('[data-animate="kategori-header"]', {
            y: 24,
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '[data-animate="kategori-header"]',
              start: 'top 85%',
              once: true,
            },
          })

          // Batch reveal for category cards (efficient for multiple elements)
          ScrollTrigger.batch('[data-animate="kategori-card"]', {
            onEnter: (elements) => {
              gsap.from(elements, {
                y: 40,
                autoAlpha: 0,
                stagger: 0.08,
                duration: 0.6,
                ease: 'power2.out',
                overwrite: true,
              })
            },
            start: 'top 88%',
            once: true,
          })

          // ── Footer ──
          gsap.from('[data-animate="footer-content"]', {
            y: 20,
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '[data-animate="footer-content"]',
              start: 'top 90%',
              once: true,
            },
          })
        }
      )
    },
    { scope: containerRef }
  )

  return <div ref={containerRef}>{children}</div>
}
