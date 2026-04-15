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
      <div className="section-header">
        <Camera className="w-3.5 h-3.5 text-arc-accent" />
        Camera
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
        <div className="flex gap-1.5">
          {qualityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWebcamQuality(opt.value)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                webcamQuality === opt.value
                  ? 'bg-gradient-to-r from-arc-primary to-arc-secondary text-white'
                  : 'bg-matte-100/50 text-gray-400 hover:text-gray-200'
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
        <div className="flex gap-1.5">
          {rotationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVideoRotation(Number(opt.value))}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                videoRotation === Number(opt.value)
                  ? 'bg-gradient-to-r from-arc-primary to-arc-secondary text-white'
                  : 'bg-matte-100/50 text-gray-400 hover:text-gray-200'
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
