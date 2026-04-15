'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { hexToHsv } from '@/lib/utils'

declare global {
  interface Window {
    cv: typeof cv
    Module: {
      onRuntimeInitialized: () => void
    }
  }
  namespace cv {
    class Mat {
      constructor()
      constructor(rows: number, cols: number, type: number)
      constructor(rows: number, cols: number, type: number, scalar: Scalar)
      delete(): void
      data: Uint8Array
      rows: number
      cols: number
      size(): { width: number; height: number }
    }
    class MatVector {
      constructor()
      size(): number
      get(index: number): Mat
      delete(): void
    }
    class Scalar {
      constructor(v0: number, v1: number, v2: number, v3?: number)
    }
    class Point {
      constructor(x: number, y: number)
      x: number
      y: number
    }
    class Size {
      constructor(width: number, height: number)
    }
    class Rect {
      x: number
      y: number
      width: number
      height: number
    }
    function imread(canvas: HTMLCanvasElement): Mat
    function imshow(canvas: HTMLCanvasElement, mat: Mat): void
    function cvtColor(src: Mat, dst: Mat, code: number): void
    function inRange(src: Mat, lowerb: Mat, upperb: Mat, dst: Mat): void
    function morphologyEx(src: Mat, dst: Mat, op: number, kernel: Mat): void
    function getStructuringElement(shape: number, ksize: Size): Mat
    function findContours(image: Mat, contours: MatVector, hierarchy: Mat, mode: number, method: number): void
    function boundingRect(contour: Mat): Rect
    function contourArea(contour: Mat): number
    function getPerspectiveTransform(src: Mat, dst: Mat): Mat
    function warpPerspective(src: Mat, dst: Mat, M: Mat, dsize: Size): void
    function matFromArray(rows: number, cols: number, type: number, array: number[]): Mat
    function resize(src: Mat, dst: Mat, dsize: Size, fx?: number, fy?: number, interpolation?: number): void
    function bitwise_or(src1: Mat, src2: Mat, dst: Mat): void
    function bitwise_and(src1: Mat, src2: Mat, dst: Mat): void
    function bitwise_not(src: Mat, dst: Mat): void
    const CV_8UC1: number
    const CV_8UC3: number
    const CV_8UC4: number
    const CV_32FC1: number
    const CV_32FC2: number
    const COLOR_RGBA2RGB: number
    const COLOR_RGB2HSV: number
    const MORPH_OPEN: number
    const MORPH_CLOSE: number
    const MORPH_ELLIPSE: number
    const RETR_EXTERNAL: number
    const CHAIN_APPROX_SIMPLE: number
    const INTER_LINEAR: number
  }
}

interface DetectedBlock {
  x: number
  y: number
  width: number
  height: number
  area: number
}

interface UseOpenCVResult {
  isReady: boolean
  processFrame: (
    video: HTMLVideoElement,
    inputCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement
  ) => DetectedBlock[]
  applyPerspectiveTransform: (
    inputCanvas: HTMLCanvasElement,
    outputCanvas: HTMLCanvasElement
  ) => void
}

export function useOpenCV(): UseOpenCVResult {
  const [isReady, setIsReady] = useState(false)
  const loadingRef = useRef(false)

  const {
    targetColor,
    colorTolerance,
    saturationMin,
    valueMin,
    calibrationPoints,
    setOpencvReady,
  } = useFluxStore()

  // Load OpenCV
  useEffect(() => {
    if (loadingRef.current || typeof window === 'undefined') return
    if (window.cv && window.cv.Mat) {
      setIsReady(true)
      setOpencvReady(true)
      return
    }

    loadingRef.current = true

    const script = document.createElement('script')
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js'
    script.async = true

    script.onload = () => {
      // OpenCV.js uses Module.onRuntimeInitialized
      if (window.cv && window.cv.Mat) {
        setIsReady(true)
        setOpencvReady(true)
      } else {
        // Wait for WASM to initialize
        const checkReady = setInterval(() => {
          if (window.cv && window.cv.Mat) {
            clearInterval(checkReady)
            setIsReady(true)
            setOpencvReady(true)
          }
        }, 100)

        // Timeout after 30 seconds
        setTimeout(() => clearInterval(checkReady), 30000)
      }
    }

    document.head.appendChild(script)

    return () => {
      loadingRef.current = false
    }
  }, [setOpencvReady])

  const processFrame = useCallback(
    (
      video: HTMLVideoElement,
      inputCanvas: HTMLCanvasElement,
      outputCanvas: HTMLCanvasElement
    ): DetectedBlock[] => {
      if (!isReady || !window.cv) return []

      const cv = window.cv
      const detectedBlocks: DetectedBlock[] = []

      let src: cv.Mat | null = null
      let rgb: cv.Mat | null = null
      let hsv: cv.Mat | null = null
      let mask: cv.Mat | null = null
      let kernel: cv.Mat | null = null
      let hierarchy: cv.Mat | null = null
      let contours: cv.MatVector | null = null
      let lowerBound: cv.Mat | null = null
      let upperBound: cv.Mat | null = null

      try {
        // Draw video to input canvas
        const ctx = inputCanvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return []

        inputCanvas.width = video.videoWidth || 640
        inputCanvas.height = video.videoHeight || 480
        ctx.drawImage(video, 0, 0)

        // Read from canvas
        src = cv.imread(inputCanvas)
        rgb = new cv.Mat()
        hsv = new cv.Mat()
        mask = new cv.Mat()

        // Convert to RGB then HSV
        cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB)
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV)

        // Get target HSV values
        const targetHsv = hexToHsv(targetColor)

        // Calculate hue range (wrap around for red)
        let hLow = targetHsv.h - colorTolerance
        let hHigh = targetHsv.h + colorTolerance

        // Create bounds
        lowerBound = cv.matFromArray(1, 3, cv.CV_8UC1, [
          Math.max(0, hLow),
          saturationMin,
          valueMin,
        ])
        upperBound = cv.matFromArray(1, 3, cv.CV_8UC1, [
          Math.min(179, hHigh),
          255,
          255,
        ])

        // Apply color threshold
        cv.inRange(hsv, lowerBound, upperBound, mask)

        // Handle hue wrap-around for red colors
        if (hLow < 0 || hHigh > 179) {
          const mask2 = new cv.Mat()
          if (hLow < 0) {
            const lb2 = cv.matFromArray(1, 3, cv.CV_8UC1, [179 + hLow, saturationMin, valueMin])
            const ub2 = cv.matFromArray(1, 3, cv.CV_8UC1, [179, 255, 255])
            cv.inRange(hsv, lb2, ub2, mask2)
            lb2.delete()
            ub2.delete()
          }
          if (hHigh > 179) {
            const lb2 = cv.matFromArray(1, 3, cv.CV_8UC1, [0, saturationMin, valueMin])
            const ub2 = cv.matFromArray(1, 3, cv.CV_8UC1, [hHigh - 179, 255, 255])
            cv.inRange(hsv, lb2, ub2, mask2)
            lb2.delete()
            ub2.delete()
          }
          // Combine masks with OR operation
          const combined = new cv.Mat()
          cv.bitwise_or(mask, mask2, combined)
          mask.delete()
          mask = combined
          mask2.delete()
        }

        // Morphological operations to reduce noise
        kernel = cv.getStructuringElement(
          cv.MORPH_ELLIPSE,
          new cv.Size(5, 5)
        )
        cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel)
        cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel)

        // Find contours
        contours = new cv.MatVector()
        hierarchy = new cv.Mat()
        cv.findContours(
          mask,
          contours,
          hierarchy,
          cv.RETR_EXTERNAL,
          cv.CHAIN_APPROX_SIMPLE
        )

        // Process contours
        const minArea = 500 // Minimum contour area
        for (let i = 0; i < contours.size(); i++) {
          const contour = contours.get(i)
          const area = cv.contourArea(contour)

          if (area >= minArea) {
            const rect = cv.boundingRect(contour)

            // Scale to output canvas dimensions
            const scaleX = outputCanvas.width / inputCanvas.width
            const scaleY = outputCanvas.height / inputCanvas.height

            detectedBlocks.push({
              x: rect.x * scaleX,
              y: rect.y * scaleY,
              width: rect.width * scaleX,
              height: rect.height * scaleY,
              area: area,
            })
          }
        }
      } catch (error) {
        console.error('OpenCV processing error:', error)
      } finally {
        // Clean up
        src?.delete()
        rgb?.delete()
        hsv?.delete()
        mask?.delete()
        kernel?.delete()
        hierarchy?.delete()
        contours?.delete()
        lowerBound?.delete()
        upperBound?.delete()
      }

      return detectedBlocks
    },
    [isReady, targetColor, colorTolerance, saturationMin, valueMin]
  )

  const applyPerspectiveTransform = useCallback(
    (inputCanvas: HTMLCanvasElement, outputCanvas: HTMLCanvasElement) => {
      if (!isReady || !window.cv) return

      const cv = window.cv
      let src: cv.Mat | null = null
      let dst: cv.Mat | null = null
      let srcPts: cv.Mat | null = null
      let dstPts: cv.Mat | null = null
      let M: cv.Mat | null = null

      try {
        src = cv.imread(inputCanvas)

        // Source points from calibration
        const srcPoints = calibrationPoints.map((p) => [
          (p.x / 100) * inputCanvas.width,
          (p.y / 100) * inputCanvas.height,
        ]).flat()

        // Destination points (full canvas corners)
        const dstPoints = [
          0, 0,
          outputCanvas.width, 0,
          outputCanvas.width, outputCanvas.height,
          0, outputCanvas.height,
        ]

        srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, srcPoints)
        dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, dstPoints)

        M = cv.getPerspectiveTransform(srcPts, dstPts)

        dst = new cv.Mat()
        cv.warpPerspective(
          src,
          dst,
          M,
          new cv.Size(outputCanvas.width, outputCanvas.height)
        )

        cv.imshow(outputCanvas, dst)
      } catch (error) {
        console.error('Perspective transform error:', error)
      } finally {
        src?.delete()
        dst?.delete()
        srcPts?.delete()
        dstPts?.delete()
        M?.delete()
      }
    },
    [isReady, calibrationPoints]
  )

  return {
    isReady,
    processFrame,
    applyPerspectiveTransform,
  }
}
