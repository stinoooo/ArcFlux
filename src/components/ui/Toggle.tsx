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
        'flex items-center justify-between gap-3 cursor-pointer group select-none',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {label && (
          <span className="block text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)] group-hover:text-[var(--text)] transition-colors">
            {label}
          </span>
        )}
        {description && (
          <p className="text-[10px] tracking-[0.05em] text-[var(--text-faint)] mt-0.5 normal-case">
            {description}
          </p>
        )}
      </div>

      <div className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        {/* Hard-edged instrument switch: 2-segment slot. */}
        <div
          className={cn(
            'relative grid grid-cols-2 w-12 h-5 border transition-colors',
            checked
              ? 'border-signal/60 bg-[var(--signal-soft)]'
              : 'border-[var(--line)] bg-[var(--ink-2)]'
          )}
          style={{ borderRadius: '2px' }}
        >
          <span
            className={cn(
              'flex items-center justify-center text-[8px] font-semibold tracking-[0.18em]',
              checked ? 'text-[var(--text-quiet)]' : 'text-[var(--text-dim)]'
            )}
          >
            OFF
          </span>
          <span
            className={cn(
              'flex items-center justify-center text-[8px] font-semibold tracking-[0.18em]',
              checked ? 'text-signal glow-signal' : 'text-[var(--text-quiet)]'
            )}
          >
            ON
          </span>
          {/* Position indicator — solid signal block on the active side. */}
          <span
            className={cn(
              'absolute top-0 bottom-0 w-1/2 transition-[left] duration-150 ease-out border',
              checked
                ? 'left-1/2 border-signal bg-signal/15 shadow-[0_0_10px_var(--signal-glow)]'
                : 'left-0 border-[var(--line-bright)] bg-[var(--ink-3)]'
            )}
            style={{ borderRadius: '1px' }}
          />
        </div>
      </div>
    </label>
  )
}
