'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { hexToHsv } from '@/lib/utils'

// OpenCV types
declare global {
  interface Window {
    cv: OpenCVModule | (() => Promise<OpenCVModule>)
  }
}

interface OpenCVModule {
  Mat: new () => CVMat
  MatVector: new () => CVMatVector
  Size: new (width: number, height: number) => CVSize
  Scalar: new (v0: number, v1: number, v2: number, v3?: number) => CVScalar
  imread: (canvas: HTMLCanvasElement) => CVMat
  imshow: (canvas: HTMLCanvasElement, mat: CVMat) => void
  cvtColor: (src: CVMat, dst: CVMat, code: number) => void
  inRange: (src: CVMat, lowerb: CVMat, upperb: CVMat, dst: CVMat) => void
  morphologyEx: (src: CVMat, dst: CVMat, op: number, kernel: CVMat) => void
  getStructuringElement: (shape: number, ksize: CVSize) => CVMat
  findContours: (image: CVMat, contours: CVMatVector, hierarchy: CVMat, mode: number, method: number) => void
  boundingRect: (contour: CVMat) => CVRect
  contourArea: (contour: CVMat) => number
  getPerspectiveTransform: (src: CVMat, dst: CVMat) => CVMat
  warpPerspective: (src: CVMat, dst: CVMat, M: CVMat, dsize: CVSize) => void
  matFromArray: (rows: number, cols: number, type: number, array: number[]) => CVMat
  bitwise_or: (src1: CVMat, src2: CVMat, dst: CVMat) => void
  CV_8UC1: number
  CV_32FC2: number
  COLOR_RGBA2RGB: number
  COLOR_RGB2HSV: number
  MORPH_OPEN: number
  MORPH_CLOSE: number
  MORPH_ELLIPSE: number
  RETR_EXTERNAL: number
  CHAIN_APPROX_SIMPLE: number
}

interface CVMat {
  delete: () => void
  data: Uint8Array
  rows: number
  cols: number
}

interface CVMatVector {
  size: () => number
  get: (index: number) => CVMat
  delete: () => void
}

interface CVSize {
  width: number
  height: number
}

interface CVScalar {
  [index: number]: number
}

interface CVRect {
  x: number
  y: number
  width: number
  height: number
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
}

// Store the resolved cv module
let cvModule: OpenCVModule | null = null

export function useOpenCV(): UseOpenCVResult {
  const [isReady, setIsReady] = useState(false)
  const initRef = useRef(false)

  const {
    targetColor,
    colorTolerance,
    saturationMin,
    valueMin,
    setOpencvReady,
  } = useFluxStore()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (initRef.current) return
    if (cvModule) {
      setIsReady(true)
      setOpencvReady(true)
      return
    }

    initRef.current = true

    const initOpenCV = async () => {
      // Wait for cv to be defined
      let attempts = 0
      while (!window.cv && attempts < 100) {
        await new Promise(r => setTimeout(r, 100))
        attempts++
      }

      if (!window.cv) {
        console.error('OpenCV not found after waiting')
        return
      }

      console.log('cv object found, type:', typeof window.cv)

      try {
        // OpenCV.js 4.x: cv is a function that returns a promise
        if (typeof window.cv === 'function') {
          console.log('Initializing OpenCV (function mode)...')
          cvModule = await (window.cv as () => Promise<OpenCVModule>)()
          console.log('OpenCV initialized!')
        }
        // Older versions: cv is already the module
        else if (typeof (window.cv as OpenCVModule).Mat === 'function') {
          console.log('OpenCV already initialized (direct mode)')
          cvModule = window.cv as OpenCVModule
        }
        // cv exists but Mat doesn't - wait for it
        else {
          console.log('Waiting for OpenCV Mat to be available...')
          let matAttempts = 0
          while (!(window.cv as OpenCVModule).Mat && matAttempts < 100) {
            await new Promise(r => setTimeout(r, 100))
            matAttempts++
          }
          if ((window.cv as OpenCVModule).Mat) {
            cvModule = window.cv as OpenCVModule
            console.log('OpenCV ready after waiting for Mat')
          }
        }

        if (cvModule) {
          setIsReady(true)
          setOpencvReady(true)
          console.log('OpenCV is ready to use!')
        } else {
          console.error('Failed to initialize OpenCV module')
        }
      } catch (error) {
        console.error('Error initializing OpenCV:', error)
      }
    }

    initOpenCV()
  }, [setOpencvReady])

  const processFrame = useCallback(
    (
      video: HTMLVideoElement,
      inputCanvas: HTMLCanvasElement,
      outputCanvas: HTMLCanvasElement
    ): DetectedBlock[] => {
      if (!isReady || !cvModule) return []

      const cv = cvModule
      const detectedBlocks: DetectedBlock[] = []

      let src: CVMat | null = null
      let rgb: CVMat | null = null
      let hsv: CVMat | null = null
      let mask: CVMat | null = null
      let mask2: CVMat | null = null
      let kernel: CVMat | null = null
      let hierarchy: CVMat | null = null
      let contours: CVMatVector | null = null
      let lowerBound: CVMat | null = null
      let upperBound: CVMat | null = null

      try {
        const ctx = inputCanvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return []

        inputCanvas.width = video.videoWidth || 640
        inputCanvas.height = video.videoHeight || 480
        ctx.drawImage(video, 0, 0)

        src = cv.imread(inputCanvas)
        rgb = new cv.Mat()
        hsv = new cv.Mat()
        mask = new cv.Mat()

        cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB)
        cv.cvtColor(rgb, hsv, cv.COLOR_RGB2HSV)

        const targetHsv = hexToHsv(targetColor)
        const hLow = targetHsv.h - colorTolerance
        const hHigh = targetHsv.h + colorTolerance

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

        cv.inRange(hsv, lowerBound, upperBound, mask)

        // Handle hue wrap-around for red colors
        if (hLow < 0 || hHigh > 179) {
          mask2 = new cv.Mat()
          if (hLow < 0) {
            const lb2 = cv.matFromArray(1, 3, cv.CV_8UC1, [179 + hLow, saturationMin, valueMin])
            const ub2 = cv.matFromArray(1, 3, cv.CV_8UC1, [179, 255, 255])
            cv.inRange(hsv, lb2, ub2, mask2)
            lb2.delete()
            ub2.delete()
          } else if (hHigh > 179) {
            const lb2 = cv.matFromArray(1, 3, cv.CV_8UC1, [0, saturationMin, valueMin])
            const ub2 = cv.matFromArray(1, 3, cv.CV_8UC1, [hHigh - 179, 255, 255])
            cv.inRange(hsv, lb2, ub2, mask2)
            lb2.delete()
            ub2.delete()
          }
          const combined = new cv.Mat()
          cv.bitwise_or(mask, mask2, combined)
          mask.delete()
          mask = combined
        }

        kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5))
        cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel)
        cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel)

        contours = new cv.MatVector()
        hierarchy = new cv.Mat()
        cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

        const minArea = 500
        for (let i = 0; i < contours.size(); i++) {
          const contour = contours.get(i)
          const area = cv.contourArea(contour)

          if (area >= minArea) {
            const rect = cv.boundingRect(contour)
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
        src?.delete()
        rgb?.delete()
        hsv?.delete()
        mask?.delete()
        mask2?.delete()
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

  return {
    isReady,
    processFrame,
  }
}
