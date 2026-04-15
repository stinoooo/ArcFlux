'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Pipette } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
}

export function ColorPicker({
  value,
  onChange,
  label,
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Common colors for quick selection
  const presetColors = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#ff8000', // Orange
    '#8000ff', // Purple
  ]

  return (
    <div className={cn('control-group', className)}>
      {label && (
        <div className="control-label">
          <span>{label}</span>
          <span className="control-value font-mono text-xs">{value.toUpperCase()}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        {/* Main color input */}
        <div className="relative flex-1">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="color-picker"
          />
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              boxShadow: `0 0 20px ${value}40`,
            }}
          />
        </div>

        {/* Preset colors toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'p-2.5 rounded-lg border transition-all',
            isOpen
              ? 'border-arc-primary/50 bg-arc-primary/10 text-arc-primary'
              : 'border-white/10 bg-tornado hover:border-white/20 text-gray-400'
          )}
        >
          <Pipette className="w-4 h-4" />
        </button>
      </div>

      {/* Preset colors grid */}
      {isOpen && (
        <div className="mt-2 p-2 rounded-lg bg-matte-100/50 border border-white/5">
          <div className="grid grid-cols-8 gap-1.5">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange(color)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full aspect-square rounded-md transition-transform hover:scale-110',
                  value === color && 'ring-2 ring-white ring-offset-1 ring-offset-matte'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
