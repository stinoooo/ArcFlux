'use client'

import { cn } from '@/lib/utils'

interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  showValue?: boolean
  formatValue?: (value: number) => string
  className?: string
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue = (v) => v.toString(),
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('control-group', className)}>
      {(label || showValue) && (
        <div className="control-label">
          {label && <span>{label}</span>}
          {showValue && <span className="control-value">{formatValue(value)}</span>}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider"
          style={{
            background: `linear-gradient(to right, rgba(99, 102, 241, 0.6) 0%, rgba(139, 92, 246, 0.8) ${percentage}%, rgba(35, 35, 35, 0.8) ${percentage}%, rgba(35, 35, 35, 0.8) 100%)`,
          }}
        />
      </div>
    </div>
  )
}
