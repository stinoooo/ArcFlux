'use client'

import { useFluxStore } from '@/store/useFluxStore'
import { Select, Slider, Toggle, Button, SegmentedControl } from '@/components/ui'
import { Camera, RotateCcw, FlipHorizontal2, FlipVertical2, RefreshCw, Grid3X3 } from 'lucide-react'

interface CameraPanelProps {
  onStartCalibration: () => void
  error?: string | null
}

export function CameraPanel({ onStartCalibration, error }: CameraPanelProps) {
  const {
    selectedCamera,
    availableCameras,
    videoRotation,
    flipHorizontal,
    flipVertical,
    webcamQuality,
    showBackground,
    setSelectedCamera,
    setVideoRotation,
    setFlipHorizontal,
    setFlipVertical,
    setWebcamQuality,
    setShowBackground,
  } = useFluxStore()

  const cameraOptions = availableCameras.map((cam, idx) => ({
    value: cam.deviceId,
    label: cam.label || `Camera ${idx + 1}`,
  }))

  const qualityOptions: { value: 'low' | 'medium' | 'high' | 'ultra'; label: string }[] = [
    { value: 'low', label: '480p' },
    { value: 'medium', label: '720p' },
    { value: 'high', label: '1080p' },
    { value: 'ultra', label: '4K' },
  ]

  const rotationOptions = [
    { value: '0', label: '0°' },
    { value: '90', label: '90°' },
    { value: '180', label: '180°' },
    { value: '270', label: '270°' },
  ]

  return (
    <div className="panel-section">
      <div className="section-rule">
        <span className="section-rule-num">04</span>
        <Camera className="w-3 h-3 text-signal" />
        <span>Sensor</span>
        <span className="section-rule-line" />
      </div>

      {error && (
        <div className="px-3 py-2 border border-[rgba(244,91,91,0.3)] bg-[rgba(244,91,91,0.06)] text-[10px] leading-tight text-[var(--danger)] tracking-[0.06em]">
          <span className="tracking-[0.18em] uppercase mr-2">Err·</span>
          {error}
        </div>
      )}

      <Select
        value={selectedCamera}
        onChange={setSelectedCamera}
        options={cameraOptions}
        label="Camera Source"
        placeholder="Select camera..."
      />

      <div className="control-group">
        <div className="control-label">
          <span>Quality</span>
        </div>
        <div
          className="flex bg-[var(--ink-2)] border border-[var(--line)] divide-x divide-[var(--line)]"
          style={{ borderRadius: '2px' }}
        >
          {qualityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWebcamQuality(opt.value)}
              className={`flex-1 h-8 text-[10px] tracking-[0.14em] uppercase font-semibold transition-colors ${
                webcamQuality === opt.value
                  ? 'bg-[var(--signal-soft)] text-signal glow-signal'
                  : 'text-[var(--text-faint)] hover:text-[var(--text-dim)] hover:bg-[var(--ink-3)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div className="control-label">
          <span>Rotation</span>
        </div>
        <div
          className="flex bg-[var(--ink-2)] border border-[var(--line)] divide-x divide-[var(--line)]"
          style={{ borderRadius: '2px' }}
        >
          {rotationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVideoRotation(Number(opt.value))}
              className={`flex-1 h-8 text-[10px] tracking-[0.14em] uppercase font-semibold transition-colors ${
                videoRotation === Number(opt.value)
                  ? 'bg-[var(--signal-soft)] text-signal glow-signal'
                  : 'text-[var(--text-faint)] hover:text-[var(--text-dim)] hover:bg-[var(--ink-3)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Toggle
          checked={flipHorizontal}
          onChange={setFlipHorizontal}
          label="Flip H"
        />
        <Toggle
          checked={flipVertical}
          onChange={setFlipVertical}
          label="Flip V"
        />
      </div>

      <div className="divider" />

      <Toggle
        checked={showBackground}
        onChange={setShowBackground}
        label="Show Camera Feed"
        description="Display webcam as background"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={onStartCalibration}
        leftIcon={<Grid3X3 className="w-4 h-4" />}
        className="w-full"
      >
        Corner Pin Calibration
      </Button>
    </div>
  )
}
