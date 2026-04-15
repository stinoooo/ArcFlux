'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { cn } from '@/lib/utils'

interface CanvasProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  physicsCanvasRef: React.RefObject<HTMLCanvasElement | null>
  onResize?: (width: number, height: number) => void
}

export function Canvas({ videoRef, physicsCanvasRef, onResize }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  const {
    isStreaming,
    showBackground,
    videoRotation,
    flipHorizontal,
    flipVertical,
  } = useFluxStore()

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return

      const { width, height } = containerRef.current.getBoundingClientRect()

      if (backgroundCanvasRef.current) {
        backgroundCanvasRef.current.width = width
        backgroundCanvasRef.current.height = height
      }

      if (physicsCanvasRef.current) {
        physicsCanvasRef.current.width = width
        physicsCanvasRef.current.height = height
      }

      onResize?.(width, height)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [physicsCanvasRef, onResize])

  // Render video to background canvas
  const renderBackground = useCallback(() => {
    if (!backgroundCanvasRef.current || !videoRef.current || !isStreaming || !showBackground) {
      return
    }

    const canvas = backgroundCanvasRef.current
    const ctx = canvas.getContext('2d')
    const video = videoRef.current

    if (!ctx || video.readyState < 2) return

    ctx.save()

    // Clear canvas
    ctx.fillStyle = '#121213'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calculate transforms
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    ctx.translate(centerX, centerY)

    // Apply rotation
    ctx.rotate((videoRotation * Math.PI) / 180)

    // Apply flips
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)

    // Calculate video dimensions to cover canvas
    const videoAspect = video.videoWidth / video.videoHeight
    const canvasAspect = canvas.width / canvas.height

    let drawWidth: number
    let drawHeight: number

    // Swap aspect ratio calculation for 90/270 degree rotations
    const effectiveCanvasAspect =
      videoRotation === 90 || videoRotation === 270
        ? canvas.height / canvas.width
        : canvasAspect

    if (videoAspect > effectiveCanvasAspect) {
      drawHeight = canvas.height
      drawWidth = drawHeight * videoAspect
    } else {
      drawWidth = canvas.width
      drawHeight = drawWidth / videoAspect
    }

    // Draw video centered
    ctx.drawImage(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)

    ctx.restore()

    animationFrameRef.current = requestAnimationFrame(renderBackground)
  }, [isStreaming, showBackground, videoRotation, flipHorizontal, flipVertical, videoRef])

  // Start/stop background rendering
  useEffect(() => {
    if (isStreaming && showBackground) {
      animationFrameRef.current = requestAnimationFrame(renderBackground)
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      // Clear background when not streaming
      if (backgroundCanvasRef.current) {
        const ctx = backgroundCanvasRef.current.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#121213'
          ctx.fillRect(0, 0, backgroundCanvasRef.current.width, backgroundCanvasRef.current.height)
        }
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isStreaming, showBackground, renderBackground])

  return (
    <div ref={containerRef} className="canvas-container">
      {/* Video Background Layer */}
      <canvas
        ref={backgroundCanvasRef}
        className={cn(
          'absolute inset-0 w-full h-full',
          !showBackground && 'opacity-0'
        )}
        style={{ zIndex: 0 }}
      />

      {/* Physics Layer */}
      <canvas
        ref={physicsCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(18, 18, 19, 0.3) 100%)',
          zIndex: 2,
        }}
      />
    </div>
  )
}
