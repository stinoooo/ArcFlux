'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useFluxStore, CalibrationPoint } from '@/store/useFluxStore'
import { Button } from '@/components/ui'
import { X, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalibrationOverlayProps {
  onClose: () => void
}

export function CalibrationOverlay({ onClose }: CalibrationOverlayProps) {
  const { calibrationPoints, setCalibrationPoints } = useFluxStore()
  const [points, setPoints] = useState<CalibrationPoint[]>(calibrationPoints)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((index: number) => {
    setDraggingIndex(index)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (draggingIndex === null || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setPoints((prev) => {
        const newPoints = [...prev]
        newPoints[draggingIndex] = {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        }
        return newPoints
      })
    },
    [draggingIndex]
  )

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null)
  }, [])

  const handleTouchStart = useCallback((index: number, e: React.TouchEvent) => {
    e.preventDefault()
    setDraggingIndex(index)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (draggingIndex === null || !containerRef.current) return

      const touch = e.touches[0]
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((touch.clientX - rect.left) / rect.width) * 100
      const y = ((touch.clientY - rect.top) / rect.height) * 100

      setPoints((prev) => {
        const newPoints = [...prev]
        newPoints[draggingIndex] = {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        }
        return newPoints
      })
    },
    [draggingIndex]
  )

  const handleTouchEnd = useCallback(() => {
    setDraggingIndex(null)
  }, [])

  const handleReset = useCallback(() => {
    setPoints([
      { x: 10, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 90 },
      { x: 10, y: 90 },
    ])
  }, [])

  const handleSave = useCallback(() => {
    setCalibrationPoints(points)
    onClose()
  }, [points, setCalibrationPoints, onClose])

  // Draw lines between points
  const getPolygonPath = () => {
    return points.map((p) => `${p.x}% ${p.y}%`).join(', ')
  }

  const cornerLabels = ['Top Left', 'Top Right', 'Bottom Right', 'Bottom Left']

  return (
    <div className="fixed inset-0 z-50 bg-tornado/95 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="absolute inset-8 rounded-2xl border-2 border-dashed border-white/20 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Polygon overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <polygon
            points={points.map((p) => `${p.x}%,${p.y}%`).join(' ')}
            fill="rgba(99, 102, 241, 0.1)"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeDasharray="8,4"
          />
          {/* Lines between corners */}
          {points.map((p, i) => {
            const nextP = points[(i + 1) % points.length]
            return (
              <line
                key={i}
                x1={`${p.x}%`}
                y1={`${p.y}%`}
                x2={`${nextP.x}%`}
                y2={`${nextP.y}%`}
                stroke="url(#lineGradient)"
                strokeWidth="2"
              />
            )
          })}
        </svg>

        {/* Corner handles */}
        {points.map((point, index) => (
          <div
            key={index}
            className={cn(
              'absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing',
              'flex items-center justify-center',
              draggingIndex === index && 'z-10'
            )}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onMouseDown={() => handleMouseDown(index)}
            onTouchStart={(e) => handleTouchStart(index, e)}
          >
            {/* Outer ring */}
            <div
              className={cn(
                'absolute w-8 h-8 rounded-full border-2',
                'transition-all duration-200',
                draggingIndex === index
                  ? 'border-white scale-125'
                  : 'border-arc-primary hover:border-arc-secondary hover:scale-110'
              )}
            />
            {/* Inner dot */}
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                'bg-gradient-to-br from-arc-primary to-arc-secondary',
                'shadow-lg shadow-arc-primary/50'
              )}
            />
            {/* Label */}
            <div
              className={cn(
                'absolute whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md',
                'bg-matte-100 border border-white/10 text-gray-300',
                index < 2 ? 'top-10' : '-top-10'
              )}
            >
              {cornerLabels[index]}
            </div>
          </div>
        ))}

        {/* Instructions */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm text-gray-400 mb-2">
            Drag the corners to match your projection surface
          </p>
          <p className="text-xs text-gray-500">
            This corrects perspective distortion for accurate color detection
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 glass-panel rounded-xl px-2 py-2">
        <h2 className="text-sm font-medium text-white px-3">Corner Pin Calibration</h2>
        <div className="w-px h-6 bg-white/10" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Reset
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          leftIcon={<X className="w-4 h-4" />}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          leftIcon={<Check className="w-4 h-4" />}
        >
          Save
        </Button>
      </div>
    </div>
  )
}
