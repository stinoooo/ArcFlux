'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const FluxApp = dynamic(() => import('@/components/FluxApp'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center font-mono">
      <div className="flex flex-col items-center gap-5">
        <div className="brand-mark w-12 h-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/arcnode.svg"
            alt="Arcnode"
            className="w-full h-full object-contain"
            style={{
              filter:
                'invert(78%) sepia(60%) saturate(420%) hue-rotate(135deg) brightness(105%) drop-shadow(0 0 8px var(--signal-glow))',
            }}
          />
        </div>
        <div className="flex items-center gap-2.5 text-[10px] tracking-[0.3em] uppercase text-[var(--text-faint)]">
          <span className="led led-pulse text-warn" />
          Booting · Flux
        </div>
      </div>
    </div>
  ),
})

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <ErrorBoundary>
      <FluxApp />
    </ErrorBoundary>
  )
}
