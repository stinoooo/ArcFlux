'use client'

import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  className?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  className,
}: ToggleProps) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-3 cursor-pointer group',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {label && (
          <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
            {label}
          </span>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-11 h-6 rounded-full transition-all duration-200',
            checked
              ? 'bg-gradient-to-r from-arc-primary to-arc-secondary'
              : 'bg-matte-100'
          )}
        >
          <div
            className={cn(
              'absolute top-1 w-4 h-4 rounded-full transition-all duration-200',
              'bg-white shadow-md',
              checked ? 'left-6' : 'left-1'
            )}
          />
        </div>
      </div>
    </label>
  )
}
