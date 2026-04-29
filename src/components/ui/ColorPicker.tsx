'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Pipette } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
  className?: string
  id?: string
}

export function ColorPicker({
  value,
  onChange,
  label,
  className,
  id,
}: ColorPickerProps) {
  const inputId = id || `color-${label?.toLowerCase().replace(/\s+/g, '-') || 'picker'}`
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
      <div className="flex items-stretch gap-1.5">
        <div className="relative flex-1">
          <input
            type="color"
            id={inputId}
            name={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="color-picker"
          />
          <div
            className="absolute inset-0 pointer-events-none border border-[var(--line-bright)]"
            style={{
              borderRadius: '2px',
              boxShadow: `0 0 16px ${value}55, inset 0 0 8px ${value}22`,
            }}
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-9 flex items-center justify-center border transition-colors',
            isOpen
              ? 'border-signal/50 bg-[var(--signal-soft)] text-signal'
              : 'border-[var(--line)] bg-[var(--ink-2)] hover:border-[var(--line-bright)] text-[var(--text-faint)] hover:text-[var(--text-dim)]'
          )}
          style={{ borderRadius: '2px' }}
          title="Presets"
        >
          <Pipette className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="p-2 bg-[var(--ink-1)] border border-[var(--line)]"
          style={{ borderRadius: '2px' }}
        >
          <div className="grid grid-cols-8 gap-1">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange(color)
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full aspect-square transition-transform hover:scale-110',
                  value === color &&
                    'ring-1 ring-signal ring-offset-1 ring-offset-[var(--ink-1)]'
                )}
                style={{ backgroundColor: color, borderRadius: '1px' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
