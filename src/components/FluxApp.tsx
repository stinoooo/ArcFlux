'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { useWebcam } from '@/hooks/useWebcam'
import { useOpenCV } from '@/hooks/useOpenCV'
import { usePhysics } from '@/hooks/usePhysics'
import { Canvas } from '@/components/Canvas'
import { ControlPanel } from '@/components/ControlPanel'
import { CalibrationOverlay } from '@/components/CalibrationOverlay'

export default function FluxApp() {
  const [showCalibration, setShowCalibration] = useState(false)
  const physicsCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const fpsRef = useRef({ lastTime: 0, frameCount: 0 })
  const processingRef = useRef(false)

  const {
    isStreaming,
    showUI,
    setShowUI,
    setFps,
    setDetectedBlocks,
  } = useFluxStore()

  const { videoRef, startWebcam, stopWebcam, refreshCameras, error: webcamError } = useWebcam()
  const { isReady: opencvReady, processFrame } = useOpenCV()
  const {
    initPhysics,
    cleanup: cleanupPhysics,
    updateDetectedBlocks,
    clearBalls,
  } = usePhysics()

  // Initialize physics when canvas is ready
  const handleCanvasResize = useCallback(
    (width: number, height: number) => {
      if (physicsCanvasRef.current && width > 0 && height > 0) {
        initPhysics(physicsCanvasRef.current)
      }
    },
    [initPhysics]
  )

  // Create hidden canvas for OpenCV processing
  useEffect(() => {
    if (!hiddenCanvasRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      hiddenCanvasRef.current = canvas
    }
  }, [])

  // Enumerate cameras on mount
  useEffect(() => {
    refreshCameras()
  }, [refreshCameras])

  // Processing loop
  useEffect(() => {
    if (!isStreaming || !opencvReady || !physicsCanvasRef.current || !videoRef.current) {
      return
    }

    let animationFrameId: number

    const processLoop = () => {
      if (!processingRef.current && videoRef.current && hiddenCanvasRef.current && physicsCanvasRef.current) {
        processingRef.current = true

        try {
          // Process frame with OpenCV
          const blocks = processFrame(
            videoRef.current,
            hiddenCanvasRef.current,
            physicsCanvasRef.current
          )

          // Update physics bodies
          updateDetectedBlocks(blocks)
          setDetectedBlocks(blocks.length)

          // Calculate FPS
          const now = performance.now()
          fpsRef.current.frameCount++
          if (now - fpsRef.current.lastTime >= 1000) {
            setFps(fpsRef.current.frameCount)
            fpsRef.current.frameCount = 0
            fpsRef.current.lastTime = now
          }
        } catch (err) {
          console.error('Processing error:', err)
        }

        processingRef.current = false
      }

      animationFrameId = requestAnimationFrame(processLoop)
    }

    animationFrameId = requestAnimationFrame(processLoop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isStreaming, opencvReady, processFrame, updateDetectedBlocks, setDetectedBlocks, setFps, videoRef])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'h':
          setShowUI(!showUI)
          break
        case 'c':
          setShowCalibration(true)
          break
        case 'escape':
          if (showCalibration) {
            setShowCalibration(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showUI, setShowUI, showCalibration])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPhysics()
    }
  }, [cleanupPhysics])

  const handleStartWebcam = useCallback(async () => {
    await startWebcam()
  }, [startWebcam])

  const handleStopWebcam = useCallback(() => {
    stopWebcam()
    setDetectedBlocks(0)
    setFps(0)
  }, [stopWebcam, setDetectedBlocks, setFps])

  const handlePopout = useCallback(() => {
    // Open controls in a new window
    const popout = window.open(
      '',
      'FluxControls',
      'width=360,height=700,resizable=yes'
    )

    if (popout) {
      popout.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Flux Controls</title>
          <style>
            body {
              margin: 0;
              background: #121213;
              color: white;
              font-family: Inter, system-ui, sans-serif;
              padding: 20px;
            }
            .message {
              text-align: center;
              padding: 40px;
            }
            h2 { color: #6366f1; }
            p { color: #888; }
          </style>
        </head>
        <body>
          <div class="message">
            <h2>Flux Controls</h2>
            <p>Popout controls coming soon!</p>
            <p>For now, use the main window controls.</p>
          </div>
        </body>
        </html>
      `)
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Hidden video element for webcam stream */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      {/* Main Canvas */}
      <Canvas
        videoRef={videoRef}
        physicsCanvasRef={physicsCanvasRef}
        onResize={handleCanvasResize}
      />

      {/* Control Panel */}
      <ControlPanel
        onStartWebcam={handleStartWebcam}
        onStopWebcam={handleStopWebcam}
        onStartCalibration={() => setShowCalibration(true)}
        onClearBalls={clearBalls}
        onPopout={handlePopout}
        webcamError={webcamError}
      />

      {/* Calibration Overlay */}
      {showCalibration && (
        <CalibrationOverlay onClose={() => setShowCalibration(false)} />
      )}

      {/* Loading indicator for OpenCV */}
      {!opencvReady && (
        <div className="fixed bottom-4 left-4 z-20">
          <div className="glass-panel rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="spinner" />
            <span className="text-sm text-gray-400">Loading OpenCV...</span>
          </div>
        </div>
      )}
    </div>
  )
}
