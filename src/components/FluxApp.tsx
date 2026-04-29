'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { useWebcam } from '@/hooks/useWebcam'
import { useOpenCV } from '@/hooks/useOpenCV'
import { usePhysics } from '@/hooks/usePhysics'
import { Canvas } from '@/components/Canvas'
import { ControlPanel } from '@/components/ControlPanel'
import { CalibrationOverlay } from '@/components/CalibrationOverlay'
import { IntroScreen } from '@/components/IntroScreen'

const INTRO_SEEN_KEY = 'flux-intro-seen-v1'

export default function FluxApp() {
  const [showCalibration, setShowCalibration] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [introIsFirstVisit, setIntroIsFirstVisit] = useState(false)
  const physicsCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastProcessTime = useRef(0)
  const frameCount = useRef(0)
  const lastFpsUpdate = useRef(0)
  const lastBlockCount = useRef(-1)

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

  // Mount check + first-visit intro
  useEffect(() => {
    setMounted(true)
    try {
      if (!localStorage.getItem(INTRO_SEEN_KEY)) {
        setIntroIsFirstVisit(true)
        setShowIntro(true)
      }
    } catch {
      // localStorage unavailable (e.g. private mode with strict settings) — show anyway.
      setIntroIsFirstVisit(true)
      setShowIntro(true)
    }
  }, [])

  const handleCloseIntro = useCallback(() => {
    setShowIntro(false)
    setIntroIsFirstVisit(false)
    try {
      localStorage.setItem(INTRO_SEEN_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  const handleOpenIntro = useCallback(() => {
    setIntroIsFirstVisit(false)
    setShowIntro(true)
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

  // Processing loop
  useEffect(() => {
    if (!mounted || !isStreaming || !opencvReady || !physicsCanvasRef.current || !videoRef.current) {
      return
    }

    let animationFrameId: number
    let running = true

    const processLoop = () => {
      if (!running) return

      const now = performance.now()

      // Run OpenCV color detection up to ~30fps. The expensive work was the
      // full-resolution Mat allocations + processing — now that the pipeline
      // runs on a fixed downscaled buffer with reused Mats, we can afford this.
      if (now - lastProcessTime.current >= 33) {
        lastProcessTime.current = now

        if (videoRef.current && hiddenCanvasRef.current && physicsCanvasRef.current) {
          try {
            const blocks = processFrame(
              videoRef.current,
              hiddenCanvasRef.current,
              physicsCanvasRef.current
            )
            updateDetectedBlocks(blocks)
            // Avoid a re-render cascade when the count is unchanged.
            if (blocks.length !== lastBlockCount.current) {
              lastBlockCount.current = blocks.length
              setDetectedBlocks(blocks.length)
            }
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
        case 'i':
        case '?':
          setIntroIsFirstVisit(false)
          setShowIntro(true)
          break
        case 'escape':
          if (showIntro) setShowIntro(false)
          else if (showCalibration) setShowCalibration(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, showUI, setShowUI, showCalibration, showIntro])

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
    const popout = window.open('', 'FluxControls', 'width=380,height=720')
    if (popout) {
      popout.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>Flux · Remote Console</title>
        <style>
          body { margin: 0; background: #0B0B0C; color: #E8E8EA; font-family: ui-monospace, Menlo, monospace; padding: 32px; }
          h2 { color: #2DE3D4; font-size: 14px; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 16px; }
          p { color: #888892; font-size: 11px; line-height: 1.7; letter-spacing: 0.05em; }
          .led { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #F5A524; box-shadow: 0 0 6px #F5A524, 0 0 12px #F5A524; vertical-align: middle; margin-right: 8px; }
        </style></head>
        <body>
          <div><span class="led"></span><h2 style="display:inline-block; vertical-align:middle">Remote console</h2></div>
          <p>This window is reserved for an upcoming pop-out controller.<br>Use the main instrument panel for now.</p>
        </body></html>
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
        onShowIntro={handleOpenIntro}
        webcamError={webcamError}
      />

      {/* Calibration */}
      {showCalibration && (
        <CalibrationOverlay onClose={() => setShowCalibration(false)} />
      )}

      {/* Intro / Privacy / Terms */}
      {showIntro && (
        <IntroScreen onClose={handleCloseIntro} firstVisit={introIsFirstVisit} />
      )}

      {/* OpenCV Loading */}
      {!opencvReady && (
        <div className="fixed bottom-5 left-5 z-30">
          <div className="panel-quiet px-3 py-2 flex items-center gap-3 font-mono">
            <div className="spinner" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-warn glow-warn">
              Loading optic · OpenCV
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
