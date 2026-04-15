import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  // Remove # if present
  hex = hex.replace('#', '')

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  const s = max === 0 ? 0 : diff / max
  const v = max

  if (diff !== 0) {
    switch (max) {
      case r:
        h = 60 * (((g - b) / diff) % 6)
        break
      case g:
        h = 60 * ((b - r) / diff + 2)
        break
      case b:
        h = 60 * ((r - g) / diff + 4)
        break
    }
  }

  if (h < 0) h += 360

  return {
    h: Math.round(h / 2), // OpenCV uses 0-179 for hue
    s: Math.round(s * 255),
    v: Math.round(v * 255),
  }
}

export function getWebcamConstraints(
  quality: 'low' | 'medium' | 'high' | 'ultra',
  deviceId?: string
): MediaStreamConstraints {
  const qualitySettings = {
    low: { width: 640, height: 480, frameRate: 30 },
    medium: { width: 1280, height: 720, frameRate: 30 },
    high: { width: 1920, height: 1080, frameRate: 30 },
    ultra: { width: 3840, height: 2160, frameRate: 30 },
  }

  const settings = qualitySettings[quality]

  return {
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { ideal: settings.width },
      height: { ideal: settings.height },
      frameRate: { ideal: settings.frameRate },
      facingMode: 'environment',
      // Advanced quality settings
      autoGainControl: false,
      noiseSuppression: false,
      // @ts-ignore - These are valid but not in TS types
      exposureMode: 'manual',
      focusMode: 'continuous',
      whiteBalanceMode: 'continuous',
    },
    audio: false,
  }
}

export function formatFps(fps: number): string {
  return fps.toFixed(1)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
