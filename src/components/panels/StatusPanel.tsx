'use client'

import { useFluxStore } from '@/store/useFluxStore'
import { cn } from '@/lib/utils'

export function StatusPanel() {
  const { isStreaming, opencvReady, fps, detectedBlocks } = useFluxStore()

  return (
    <section className="px-4 py-4 border-b border-[var(--line)]">
      <div className="section-rule">
        <span className="section-rule-num">01</span>
        <span>Telemetry</span>
        <span className="section-rule-line" />
      </div>

      <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
        <Readout
          label="FPS"
          value={fps.toFixed(0).padStart(3, '0')}
          unit="hz"
          state={fps > 20 ? 'on' : fps > 0 ? 'warn' : 'off'}
        />
        <Readout
          label="Blocks"
          value={detectedBlocks.toString().padStart(3, '0')}
          unit="n"
          state={detectedBlocks > 0 ? 'on' : 'off'}
        />
        <Readout
          label="Camera"
          value={isStreaming ? 'Live' : '—'}
          unit="src"
          state={isStreaming ? 'on' : 'off'}
          variant="text"
        />
        <Readout
          label="Optic"
          value={opencvReady ? 'Rdy' : 'Wait'}
          unit="cv"
          state={opencvReady ? 'on' : 'warn'}
          variant="text"
        />
      </div>
    </section>
  )
}

function Readout({
  label,
  value,
  unit,
  state,
  variant = 'number',
}: {
  label: string
  value: string
  unit: string
  state: 'on' | 'warn' | 'off'
  variant?: 'number' | 'text'
}) {
  const dotClass =
    state === 'on'
      ? 'text-signal led-pulse'
      : state === 'warn'
      ? 'text-warn led-pulse'
      : 'text-[var(--text-quiet)]'

  const valueClass =
    state === 'on'
      ? 'text-signal glow-signal'
      : state === 'warn'
      ? 'text-warn glow-warn'
      : 'text-[var(--text-faint)]'

  return (
    <div className="bg-[var(--ink-1)] px-3 py-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] tracking-[0.18em] uppercase text-[var(--text-faint)]">
          {label}
        </span>
        <span className={cn('led', dotClass)} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'tnum',
            valueClass,
            variant === 'number' ? 'text-2xl font-bold' : 'text-base font-semibold'
          )}
        >
          {value}
        </span>
        <span className="text-[9px] tracking-[0.18em] uppercase text-[var(--text-quiet)]">
          {unit}
        </span>
      </div>
    </div>
  )
}
