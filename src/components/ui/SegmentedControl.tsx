'use client'

import { cn } from '@/lib/utils'

interface SegmentedControlOption<T> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentedControlOption<T>[]
  label?: string
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('control-group', className)}>
      {label && (
        <div className="control-label">
          <span>{label}</span>
        </div>
      )}
      <div className="flex p-1 rounded-xl bg-matte-100/50 border border-white/5">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              value === option.value
                ? 'bg-gradient-to-r from-arc-primary to-arc-secondary text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
            )}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
