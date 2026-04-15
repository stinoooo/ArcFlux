'use client'

import { useFluxStore } from '@/store/useFluxStore'
import { Slider, ColorPicker, Toggle } from '@/components/ui'
import { Palette } from 'lucide-react'

export function ColorPanel() {
  const {
    targetColor,
    colorTolerance,
    saturationMin,
    valueMin,
    boxOpacity,
    showDetection,
    setTargetColor,
    setColorTolerance,
    setSaturationMin,
    setValueMin,
    setBoxOpacity,
    setShowDetection,
  } = useFluxStore()

  return (
    <div className="panel-section">
      <div className="section-header">
        <Palette className="w-3.5 h-3.5 text-arc-secondary" />
        Color Detection
      </div>

      <ColorPicker
        value={targetColor}
        onChange={setTargetColor}
        label="Target Color"
      />

      <Slider
        value={colorTolerance}
        onChange={setColorTolerance}
        min={1}
        max={90}
        label="Color Tolerance"
        formatValue={(v) => `±${v}°`}
      />

      <Slider
        value={saturationMin}
        onChange={setSaturationMin}
        min={0}
        max={255}
        label="Min Saturation"
      />

      <Slider
        value={valueMin}
        onChange={setValueMin}
        min={0}
        max={255}
        label="Min Brightness"
      />

      <Slider
        value={boxOpacity}
        onChange={setBoxOpacity}
        min={0}
        max={100}
        label="Detection Opacity"
        formatValue={(v) => `${v}%`}
      />

      <div className="divider" />

      <Toggle
        checked={showDetection}
        onChange={setShowDetection}
        label="Show Detection Boxes"
        description="Visualize detected color regions"
      />
    </div>
  )
}
