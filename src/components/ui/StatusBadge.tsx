'use client'

import { cn } from '@/lib/utils'

type StatusType = 'online' | 'offline' | 'processing' | 'warning'

interface StatusBadgeProps {
  status: StatusType
  label: string
  className?: string
  pulse?: boolean
}

export function StatusBadge({
  status,
  label,
  className,
  pulse = true,
}: StatusBadgeProps) {
  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    processing: 'bg-amber-500',
    warning: 'bg-orange-500',
  }

  return (
    <div className={cn('status-badge', status, className)}>
      <span className="relative flex h-2 w-2">
        {pulse && status !== 'offline' && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              statusColors[status]
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            statusColors[status]
          )}
        />
      </span>
      <span>{label}</span>
    </div>
  )
}
