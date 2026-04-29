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
  Mat: new (rows?: number, cols?: number, type?: number) => CVMat
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
  CV_8UC4: number
  CV_32FC2: number
  COLOR_RGBA2RGB: number
  COLOR_RGB2HSV: number
  COLOR_RGBA2HSV_FULL: number
  MORPH_OPEN: number
  MORPH_CLOSE: number
  MORPH_ELLIPSE: number
  MORPH_RECT: number
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

let cvModule: OpenCVModule | null = null

// Process at a fixed small resolution for speed. The full-res webcam is still
// used for display; only color detection runs on the downscaled buffer.
const PROC_WIDTH = 480

interface MatPool {
  src: CVMat
  hsv: CVMat
  mask: CVMat
  maskWrap: CVMat
  kernel: CVMat
  hierarchy: CVMat
  width: number
  height: number
}

export function useOpenCV(): UseOpenCVResult {
  const [isReady, setIsReady] = useState(false)
  const initRef = useRef(false)
  const poolRef = useRef<MatPool | null>(null)

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
      let attempts = 0
      while (!window.cv && attempts < 100) {
        await new Promise(r => setTimeout(r, 100))
        attempts++
      }

      if (!window.cv) {
        console.error('OpenCV not found after waiting')
        return
      }

      try {
        if (typeof window.cv === 'function') {
          cvModule = await (window.cv as () => Promise<OpenCVModule>)()
        } else if (typeof (window.cv as OpenCVModule).Mat === 'function') {
          cvModule = window.cv as OpenCVModule
        } else {
          let matAttempts = 0
          while (!(window.cv as OpenCVModule).Mat && matAttempts < 100) {
            await new Promise(r => setTimeout(r, 100))
            matAttempts++
          }
          if ((window.cv as OpenCVModule).Mat) {
            cvModule = window.cv as OpenCVModule
          }
        }

        if (cvModule) {
          setIsReady(true)
          setOpencvReady(true)
        } else {
          console.error('Failed to initialize OpenCV module')
        }
      } catch (error) {
        console.error('Error initializing OpenCV:', error)
      }
    }

    initOpenCV()

    return () => {
      const pool = poolRef.current
      if (pool) {
        pool.src.delete()
        pool.hsv.delete()
        pool.mask.delete()
        pool.maskWrap.delete()
        pool.kernel.delete()
        pool.hierarchy.delete()
        poolRef.current = null
      }
    }
  }, [setOpencvReady])

  const processFrame = useCallback(
    (
      video: HTMLVideoElement,
      inputCanvas: HTMLCanvasElement,
      outputCanvas: HTMLCanvasElement
    ): DetectedBlock[] => {
      if (!isReady || !cvModule) return []
      if (!video.videoWidth || !video.videoHeight) return []

      const cv = cvModule
      const detected: DetectedBlock[] = []

      // Compute target processing size — fixed width, aspect-correct height.
      const aspect = video.videoWidth / video.videoHeight
      const procW = PROC_WIDTH
      const procH = Math.max(1, Math.round(procW / aspect))

      // Resize the hidden canvas only when needed.
      if (inputCanvas.width !== procW) inputCanvas.width = procW
      if (inputCanvas.height !== procH) inputCanvas.height = procH

      const ctx = inputCanvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return []

      // Initialize / resize persistent Mat pool.
      let pool = poolRef.current
      if (!pool || pool.width !== procW || pool.height !== procH) {
        if (pool) {
          pool.src.delete()
          pool.hsv.delete()
          pool.mask.delete()
          pool.maskWrap.delete()
          pool.kernel.delete()
          pool.hierarchy.delete()
        }
        pool = {
          src: new cv.Mat(procH, procW, cv.CV_8UC4),
          hsv: new cv.Mat(),
          mask: new cv.Mat(),
          maskWrap: new cv.Mat(),
          // 3x3 kernel is much cheaper than 5x5 and visually equivalent at this scale.
          kernel: cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3)),
          hierarchy: new cv.Mat(),
          width: procW,
          height: procH,
        }
        poolRef.current = pool
      }

      // Draw the video into the small canvas. drawImage handles the downscale on the GPU.
      ctx.drawImage(video, 0, 0, procW, procH)
      const imageData = ctx.getImageData(0, 0, procW, procH)
      pool.src.data.set(imageData.data)

      // RGBA → HSV in one step. We don't need the intermediate RGB Mat.
      cv.cvtColor(pool.src, pool.hsv, cv.COLOR_RGBA2RGB)
      cv.cvtColor(pool.hsv, pool.hsv, cv.COLOR_RGB2HSV)

      const targetHsv = hexToHsv(targetColor)
      const hLow = targetHsv.h - colorTolerance
      const hHigh = targetHsv.h + colorTolerance

      // Allocate the small bound Mats inline; they are 1x3, allocation is cheap.
      const lower = cv.matFromArray(1, 3, cv.CV_8UC1, [
        Math.max(0, hLow),
        saturationMin,
        valueMin,
      ])
      const upper = cv.matFromArray(1, 3, cv.CV_8UC1, [
        Math.min(179, hHigh),
        255,
        255,
      ])
      cv.inRange(pool.hsv, lower, upper, pool.mask)
      lower.delete()
      upper.delete()

      // Hue wrap-around (red).
      if (hLow < 0 || hHigh > 179) {
        const lo = hLow < 0 ? 179 + hLow : 0
        const hi = hHigh > 179 ? hHigh - 179 : hHigh
        const lb2 = cv.matFromArray(1, 3, cv.CV_8UC1, [lo, saturationMin, valueMin])
        const ub2 = cv.matFromArray(1, 3, cv.CV_8UC1, [hi, 255, 255])
        cv.inRange(pool.hsv, lb2, ub2, pool.maskWrap)
        cv.bitwise_or(pool.mask, pool.maskWrap, pool.mask)
        lb2.delete()
        ub2.delete()
      }

      // One open + close pass on the small mask. Cheap at this resolution.
      cv.morphologyEx(pool.mask, pool.mask, cv.MORPH_OPEN, pool.kernel)
      cv.morphologyEx(pool.mask, pool.mask, cv.MORPH_CLOSE, pool.kernel)

      const contours = new cv.MatVector()
      cv.findContours(
        pool.mask,
        contours,
        pool.hierarchy,
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      )

      // Min area scaled to the processing resolution. 500 px² on a 480-wide buffer
      // corresponds to a ~22x22 patch — same intent as the legacy 500 on 400-wide.
      const minArea = 200
      const scaleX = outputCanvas.width / procW
      const scaleY = outputCanvas.height / procH
      const total = contours.size()

      for (let i = 0; i < total; i++) {
        const contour = contours.get(i)
        const area = cv.contourArea(contour)
        if (area >= minArea) {
          const rect = cv.boundingRect(contour)
          detected.push({
            x: rect.x * scaleX,
            y: rect.y * scaleY,
            width: rect.width * scaleX,
            height: rect.height * scaleY,
            area,
          })
        }
        contour.delete()
      }
      contours.delete()

      return detected
    },
    [isReady, targetColor, colorTolerance, saturationMin, valueMin]
  )

  return {
    isReady,
    processFrame,
  }
}
