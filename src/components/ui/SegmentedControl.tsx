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
      <div
        className="flex bg-[var(--ink-2)] border border-[var(--line)] divide-x divide-[var(--line)]"
        style={{ borderRadius: '2px' }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-8 text-[10px] tracking-[0.16em] uppercase font-semibold transition-colors',
              value === option.value
                ? 'bg-[var(--signal-soft)] text-signal glow-signal'
                : 'text-[var(--text-faint)] hover:text-[var(--text-dim)] hover:bg-[var(--ink-3)]'
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
