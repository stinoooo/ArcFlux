'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  className?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  className,
}: SelectProps) {
  return (
    <div className={cn('control-group', className)}>
      {label && (
        <div className="control-label">
          <span>{label}</span>
        </div>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'input-base appearance-none pr-10 cursor-pointer',
            'hover:border-white/20 transition-colors'
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
