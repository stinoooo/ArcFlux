'use client'

import { useState } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { Button } from '@/components/ui'
import { PhysicsPanel, ColorPanel, CameraPanel, StatusPanel } from '@/components/panels'
import {
  Play,
  Square,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ControlPanelProps {
  onStartWebcam: () => void
  onStopWebcam: () => void
  onStartCalibration: () => void
  onClearBalls: () => void
  onPopout: () => void
  webcamError?: string | null
}

export function ControlPanel({
  onStartWebcam,
  onStopWebcam,
  onStartCalibration,
  onClearBalls,
  onPopout,
  webcamError,
}: ControlPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isStreaming, showUI, setShowUI, resetSettings } = useFluxStore()

  if (!showUI) {
    return (
      <button
        onClick={() => setShowUI(true)}
        className="fixed top-4 right-4 z-20 p-3 rounded-xl glass-panel hover:border-white/10 transition-all"
        title="Show controls"
      >
        <ChevronLeft className="w-5 h-5 text-gray-400" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-20 transition-all duration-300 ease-out',
        isCollapsed ? 'w-14' : 'w-80'
      )}
    >
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className={cn('flex items-center gap-3', isCollapsed && 'hidden')}>
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-arc-primary to-arc-secondary animate-pulse-slow opacity-50 blur-sm" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-arc-primary to-arc-secondary flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Flux</h1>
              <p className="text-[10px] text-gray-500">by arcnode</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isCollapsed && (
              <>
                <button
                  onClick={onPopout}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  title="Pop out controls"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowUI(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  title="Hide panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4 rotate-180" />
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Main Controls */}
            <div className="p-4 border-b border-white/5">
              <div className="flex gap-2">
                {!isStreaming ? (
                  <Button
                    variant="primary"
                    onClick={onStartWebcam}
                    leftIcon={<Play className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Start Camera
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    onClick={onStopWebcam}
                    leftIcon={<Square className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Stop Camera
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={resetSettings}
                  title="Reset all settings"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Panels */}
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
              <StatusPanel />
              <PhysicsPanel onClearBalls={onClearBalls} />
              <ColorPanel />
              <CameraPanel
                onStartCalibration={onStartCalibration}
                error={webcamError}
              />
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>flux.arcnode.dev</span>
                <span className="flex items-center gap-1">
                  <kbd className="kbd">H</kbd> to toggle panel
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
