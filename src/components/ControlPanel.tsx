'use client'

import { useState } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { Button } from '@/components/ui'
import { PhysicsPanel, ColorPanel, CameraPanel, StatusPanel } from '@/components/panels'
import {
  Play,
  Square,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Info,
  PanelRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ControlPanelProps {
  onStartWebcam: () => void
  onStopWebcam: () => void
  onStartCalibration: () => void
  onClearBalls: () => void
  onPopout: () => void
  onShowIntro: () => void
  webcamError?: string | null
}

export function ControlPanel({
  onStartWebcam,
  onStopWebcam,
  onStartCalibration,
  onClearBalls,
  onPopout,
  onShowIntro,
  webcamError,
}: ControlPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { isStreaming, showUI, setShowUI, resetSettings } = useFluxStore()

  if (!showUI) {
    return (
      <button
        onClick={() => setShowUI(true)}
        className="fixed top-5 right-5 z-30 panel-quiet w-10 h-10 flex items-center justify-center text-text-dim hover:text-signal hover:border-signal/40 transition-colors"
        title="Show panel · H"
      >
        <PanelRight className="w-4 h-4" />
      </button>
    )
  }

  return (
    <aside
      className={cn(
        'fixed top-5 right-5 z-30 transition-[width] duration-300 ease-out font-mono',
        collapsed ? 'w-12' : 'w-[340px]'
      )}
    >
      <div className="panel relative reveal">
        {/* ── Header ────────────────────────────────────────────── */}
        <header className="flex items-stretch border-b border-[var(--line)]">
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3.5 flex-1 min-w-0',
              collapsed && 'hidden'
            )}
          >
            <div className="brand-mark w-8 h-8 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/arcnode.svg"
                alt="Arcnode"
                className="w-full h-full object-contain"
                style={{ filter: 'invert(78%) sepia(60%) saturate(420%) hue-rotate(135deg) brightness(105%) drop-shadow(0 0 4px var(--signal-glow))' }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h1 className="display-serif text-[20px] leading-none text-[var(--text)] italic">
                  Flux
                </h1>
                <span className="text-[9px] tracking-[0.2em] text-[var(--text-faint)] uppercase">
                  v1.2
                </span>
              </div>
              <p className="text-[9px] tracking-[0.25em] text-[var(--text-faint)] uppercase mt-0.5">
                Arcnode · Optical Instrument
              </p>
            </div>
          </div>

          <div className="flex items-stretch border-l border-[var(--line)]">
            {!collapsed && (
              <>
                <IconButton onClick={onShowIntro} title="Manual · I">
                  <Info className="w-3.5 h-3.5" />
                </IconButton>
                <IconButton onClick={onPopout} title="Pop out">
                  <ExternalLink className="w-3.5 h-3.5" />
                </IconButton>
                <IconButton onClick={() => setShowUI(false)} title="Hide · H">
                  <ChevronRight className="w-3.5 h-3.5" />
                </IconButton>
              </>
            )}
            <IconButton
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <PanelRight
                className={cn('w-3.5 h-3.5 transition-transform', collapsed && 'rotate-180')}
              />
            </IconButton>
          </div>
        </header>

        {!collapsed && (
          <>
            {/* ── Run controls ──────────────────────────────────── */}
            <div className="px-4 py-3 border-b border-[var(--line)] bg-[var(--ink-1)]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[9px] tracking-[0.2em] uppercase text-[var(--text-faint)]">
                  · 00 / Run
                </span>
                <span className="flex items-center gap-1.5 text-[9px] tracking-[0.18em] uppercase">
                  <span
                    className={cn(
                      'led led-pulse',
                      isStreaming ? 'text-signal' : 'text-[var(--text-quiet)]'
                    )}
                  />
                  <span className={isStreaming ? 'text-signal glow-signal' : 'text-[var(--text-faint)]'}>
                    {isStreaming ? 'Live' : 'Standby'}
                  </span>
                </span>
              </div>

              <div className="flex gap-2">
                {!isStreaming ? (
                  <Button
                    variant="primary"
                    onClick={onStartWebcam}
                    leftIcon={<Play className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    Start
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={onStopWebcam}
                    leftIcon={<Square className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    Stop
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={resetSettings}
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>

              {webcamError && (
                <div className="mt-2.5 px-2.5 py-2 border border-[rgba(244,91,91,0.3)] bg-[rgba(244,91,91,0.06)] text-[10px] leading-tight text-[var(--danger)]">
                  <span className="tracking-[0.15em] uppercase mr-1.5">Err·</span>
                  {webcamError}
                </div>
              )}
            </div>

            {/* ── Scrollable panel sections ─────────────────────── */}
            <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
              <StatusPanel />
              <PhysicsPanel onClearBalls={onClearBalls} />
              <ColorPanel />
              <CameraPanel
                onStartCalibration={onStartCalibration}
                error={webcamError}
              />
            </div>

            {/* ── Footer strip ──────────────────────────────────── */}
            <footer className="border-t border-[var(--line)] bg-[var(--ink-0)]/60">
              <div className="flex items-center justify-between px-4 py-2 text-[9px] tracking-[0.18em] uppercase">
                <a
                  href="https://arcnode.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--text-faint)] hover:text-signal transition-colors"
                >
                  flux.arcnode.dev
                </a>
                <div className="flex items-center gap-1.5 text-[var(--text-quiet)]">
                  <kbd className="kbd">H</kbd>
                  <kbd className="kbd">I</kbd>
                  <kbd className="kbd">C</kbd>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 pb-2.5 text-[9px] tracking-[0.18em] uppercase">
                <button onClick={onShowIntro} className="text-[var(--text-faint)] hover:text-signal transition-colors">
                  About
                </button>
                <Dot />
                <button onClick={onShowIntro} className="text-[var(--text-faint)] hover:text-signal transition-colors">
                  Privacy
                </button>
                <Dot />
                <button onClick={onShowIntro} className="text-[var(--text-faint)] hover:text-signal transition-colors">
                  Terms
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </aside>
  )
}

function IconButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="px-3 text-[var(--text-faint)] hover:text-signal hover:bg-[var(--ink-2)] transition-colors flex items-center justify-center"
    >
      {children}
    </button>
  )
}

function Dot() {
  return <span className="w-0.5 h-0.5 rounded-full bg-[var(--text-quiet)]" />
}
