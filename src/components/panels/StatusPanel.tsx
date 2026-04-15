'use client'

import { useFluxStore } from '@/store/useFluxStore'
import { StatusBadge } from '@/components/ui'
import { Activity, Cpu, Box } from 'lucide-react'

export function StatusPanel() {
  const { isStreaming, opencvReady, fps, detectedBlocks } = useFluxStore()

  return (
    <div className="panel-section">
      <div className="section-header">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        Status
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-matte-100/30 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Camera</span>
          </div>
          <StatusBadge
            status={isStreaming ? 'online' : 'offline'}
            label={isStreaming ? 'Streaming' : 'Stopped'}
          />
        </div>

        <div className="p-3 rounded-lg bg-matte-100/30 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">OpenCV</span>
          </div>
          <StatusBadge
            status={opencvReady ? 'online' : 'processing'}
            label={opencvReady ? 'Ready' : 'Loading'}
          />
        </div>

        <div className="p-3 rounded-lg bg-matte-100/30 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">FPS</span>
          </div>
          <span className="text-lg font-mono font-bold text-gradient">
            {fps.toFixed(1)}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-matte-100/30 border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Box className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Blocks</span>
          </div>
          <span className="text-lg font-mono font-bold text-gradient">
            {detectedBlocks}
          </span>
        </div>
      </div>
    </div>
  )
}
