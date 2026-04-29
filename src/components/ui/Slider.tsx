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
  id?: string
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
  id,
}: SliderProps) {
  const inputId = id || `slider-${label?.toLowerCase().replace(/\s+/g, '-') || 'input'}`
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('control-group', className)}>
      {(label || showValue) && (
        <div className="control-label">
          {label && <span>{label}</span>}
          {showValue && (
            <span className="control-value tnum text-[11px]">{formatValue(value)}</span>
          )}
        </div>
      )}
      <div className="relative tick-track py-1">
        <input
          type="range"
          id={inputId}
          name={inputId}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider relative z-10"
          style={{
            ['--fill' as string]: `${percentage}%`,
          }}
        />
      </div>
    </div>
  )
}
