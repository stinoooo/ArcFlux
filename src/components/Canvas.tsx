'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { cn } from '@/lib/utils'

interface CanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  physicsCanvasRef: React.RefObject<HTMLCanvasElement | null>
  onResize?: (width: number, height: number) => void
}

export function Canvas({ videoRef, physicsCanvasRef, onResize }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  const {
    isStreaming,
    showBackground,
    videoRotation,
    flipHorizontal,
    flipVertical,
  } = useFluxStore()

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()

      if (backgroundCanvasRef.current) {
        backgroundCanvasRef.current.width = width
        backgroundCanvasRef.current.height = height
      }
      if (physicsCanvasRef.current) {
        physicsCanvasRef.current.width = width
        physicsCanvasRef.current.height = height
      }
      onResize?.(width, height)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [physicsCanvasRef, onResize])

  const renderBackground = useCallback(() => {
    if (!backgroundCanvasRef.current || !videoRef.current || !isStreaming || !showBackground) {
      return
    }

    const canvas = backgroundCanvasRef.current
    const ctx = canvas.getContext('2d')
    const video = videoRef.current
    if (!ctx || video.readyState < 2) return

    ctx.save()
    ctx.fillStyle = '#0B0B0C'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    ctx.translate(centerX, centerY)
    ctx.rotate((videoRotation * Math.PI) / 180)
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)

    const videoAspect = video.videoWidth / video.videoHeight
    const canvasAspect = canvas.width / canvas.height
    const effectiveCanvasAspect =
      videoRotation === 90 || videoRotation === 270
        ? canvas.height / canvas.width
        : canvasAspect

    let drawWidth: number
    let drawHeight: number
    if (videoAspect > effectiveCanvasAspect) {
      drawHeight = canvas.height
      drawWidth = drawHeight * videoAspect
    } else {
      drawWidth = canvas.width
      drawHeight = drawWidth / videoAspect
    }

    ctx.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
    ctx.restore()

    animationFrameRef.current = requestAnimationFrame(renderBackground)
  }, [isStreaming, showBackground, videoRotation, flipHorizontal, flipVertical, videoRef])

  useEffect(() => {
    if (isStreaming && showBackground) {
      animationFrameRef.current = requestAnimationFrame(renderBackground)
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (backgroundCanvasRef.current) {
        const ctx = backgroundCanvasRef.current.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#0B0B0C'
          ctx.fillRect(0, 0, backgroundCanvasRef.current.width, backgroundCanvasRef.current.height)
        }
      }
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isStreaming, showBackground, renderBackground])

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* ── IDLE STATE — calibration screen ─────────────────────── */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700',
          isStreaming ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        style={{ zIndex: 0 }}
      >
        {/* Coordinate frame markers — corners */}
        <CornerMark className="top-5 left-5" position="tl" />
        <CornerMark className="top-5 right-5" position="tr" />
        <CornerMark className="bottom-5 left-5" position="bl" />
        <CornerMark className="bottom-5 right-5" position="br" />

        {/* Centre crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Crosshair />
        </div>

        {/* Hero — display serif standby line */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] tracking-[0.4em] uppercase text-[var(--text-faint)] mb-3 font-mono">
              <span className="led inline-block align-middle mr-2 text-warn led-pulse" />
              Standby · Awaiting signal
            </span>
            <h1 className="display-serif text-[14vw] sm:text-[140px] leading-[0.85] text-[var(--text-quiet)] select-none">
              flux<span className="italic text-signal/30 glow-signal">.</span>
            </h1>
            <span className="text-[10px] tracking-[0.4em] uppercase text-[var(--text-quiet)] mt-3 font-mono">
              An Arcnode optical instrument
            </span>
          </div>
        </div>

        {/* Axis labels — bottom */}
        <span className="axis-label bottom-5 left-1/2 -translate-x-1/2">
          x · 0.000 — 1.000
        </span>
        <span className="axis-label top-1/2 -translate-y-1/2 left-5 -rotate-90 origin-left translate-x-3">
          y · 0.000 — 1.000
        </span>
      </div>

      {/* ── Live layers ─────────────────────────────────────────── */}
      <canvas
        ref={backgroundCanvasRef}
        className={cn(
          'absolute inset-0 w-full h-full',
          !showBackground && 'opacity-0'
        )}
        style={{ zIndex: 0 }}
      />

      <canvas
        ref={physicsCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Vignette — always on top of canvas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(11,11,12,0.55) 100%)',
          zIndex: 2,
        }}
      />
    </div>
  )
}

function CornerMark({
  className,
  position,
}: {
  className?: string
  position: 'tl' | 'tr' | 'bl' | 'br'
}) {
  const borders = {
    tl: 'border-t border-l',
    tr: 'border-t border-r',
    bl: 'border-b border-l',
    br: 'border-b border-r',
  }[position]
  const align = {
    tl: 'top-2 left-2',
    tr: 'top-2 right-2',
    bl: 'bottom-2 left-2',
    br: 'bottom-2 right-2',
  }[position]
  return (
    <div className={cn('absolute pointer-events-none', className)}>
      <div className={cn('w-6 h-6 border-signal/40', borders)} />
      <span
        className={cn(
          'absolute text-[8px] tracking-[0.2em] uppercase text-[var(--text-quiet)] whitespace-nowrap font-mono',
          align
        )}
      >
        {position === 'tl' && '·01'}
        {position === 'tr' && '02·'}
        {position === 'bl' && '·04'}
        {position === 'br' && '03·'}
      </span>
    </div>
  )
}

function Crosshair() {
  return (
    <div className="relative w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] opacity-25">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-signal/40" />
      {/* Inner ring */}
      <div className="absolute inset-[18%] rounded-full border border-signal/25" />
      {/* Tick ring — using SVG so we can have proper graduations */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full text-signal/40"
        fill="none"
      >
        {/* 24 ticks, every 15 deg, longer every 90 */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180
          const isMajor = i % 6 === 0
          const r1 = 50
          const r2 = isMajor ? 46 : 48
          const x1 = 50 + r1 * Math.cos(angle)
          const y1 = 50 + r1 * Math.sin(angle)
          const x2 = 50 + r2 * Math.cos(angle)
          const y2 = 50 + r2 * Math.sin(angle)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={isMajor ? 0.6 : 0.3}
            />
          )
        })}
      </svg>
      {/* Cross */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-signal/40" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-signal/40" />
      {/* Centre dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-signal shadow-[0_0_12px_var(--signal-glow)]" />
    </div>
  )
}
