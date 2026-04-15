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
  const [mounted, setMounted] = useState(false)
  const physicsCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastProcessTime = useRef(0)
  const frameCount = useRef(0)
  const lastFpsUpdate = useRef(0)

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

  // Mount check
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize physics
  const handleCanvasResize = useCallback((width: number, height: number) => {
    if (physicsCanvasRef.current && width > 0 && height > 0) {
      initPhysics(physicsCanvasRef.current)
    }
  }, [initPhysics])

  // Create hidden canvas
  useEffect(() => {
    if (!hiddenCanvasRef.current) {
      hiddenCanvasRef.current = document.createElement('canvas')
      hiddenCanvasRef.current.width = 640
      hiddenCanvasRef.current.height = 480
    }
  }, [])

  // Enumerate cameras
  useEffect(() => {
    if (mounted) {
      refreshCameras()
    }
  }, [mounted, refreshCameras])

  // Processing loop - throttled to ~15fps for OpenCV
  useEffect(() => {
    if (!mounted || !isStreaming || !opencvReady || !physicsCanvasRef.current || !videoRef.current) {
      return
    }

    let animationFrameId: number
    let running = true

    const processLoop = () => {
      if (!running) return

      const now = performance.now()

      // Throttle OpenCV processing to ~15fps (every 66ms)
      if (now - lastProcessTime.current >= 66) {
        lastProcessTime.current = now

        if (videoRef.current && hiddenCanvasRef.current && physicsCanvasRef.current) {
          try {
            const blocks = processFrame(
              videoRef.current,
              hiddenCanvasRef.current,
              physicsCanvasRef.current
            )
            updateDetectedBlocks(blocks)
            setDetectedBlocks(blocks.length)
          } catch (err) {
            console.error('Processing error:', err)
          }
        }
      }

      // Update FPS counter
      frameCount.current++
      if (now - lastFpsUpdate.current >= 1000) {
        setFps(frameCount.current)
        frameCount.current = 0
        lastFpsUpdate.current = now
      }

      animationFrameId = requestAnimationFrame(processLoop)
    }

    animationFrameId = requestAnimationFrame(processLoop)

    return () => {
      running = false
      cancelAnimationFrame(animationFrameId)
    }
  }, [mounted, isStreaming, opencvReady, processFrame, updateDetectedBlocks, setDetectedBlocks, setFps, videoRef])

  // Keyboard shortcuts
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case 'h':
          setShowUI(!showUI)
          break
        case 'c':
          setShowCalibration(true)
          break
        case 'escape':
          if (showCalibration) setShowCalibration(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, showUI, setShowUI, showCalibration])

  // Cleanup
  useEffect(() => {
    return () => cleanupPhysics()
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
    const popout = window.open('', 'FluxControls', 'width=360,height=700')
    if (popout) {
      popout.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Flux Controls</title>
        <style>body{margin:0;background:#121213;color:white;font-family:Inter,system-ui;padding:20px;}
        h2{color:#14B8A6;}p{color:#888;}</style></head>
        <body><div style="text-align:center;padding:40px;">
        <h2>Flux Controls</h2><p>Use the main window controls.</p></div></body></html>
      `)
    }
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Hidden video */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Canvas */}
      <Canvas
        videoRef={videoRef}
        physicsCanvasRef={physicsCanvasRef}
        onResize={handleCanvasResize}
      />

      {/* Controls */}
      <ControlPanel
        onStartWebcam={handleStartWebcam}
        onStopWebcam={handleStopWebcam}
        onStartCalibration={() => setShowCalibration(true)}
        onClearBalls={clearBalls}
        onPopout={handlePopout}
        webcamError={webcamError}
      />

      {/* Calibration */}
      {showCalibration && (
        <CalibrationOverlay onClose={() => setShowCalibration(false)} />
      )}

      {/* OpenCV Loading */}
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
