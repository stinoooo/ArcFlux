import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type SpawnMode = 'balls' | 'laser'

export interface CalibrationPoint {
  x: number
  y: number
}

export interface FluxState {
  // Webcam
  isStreaming: boolean
  selectedCamera: string
  availableCameras: MediaDeviceInfo[]
  videoRotation: number
  flipHorizontal: boolean
  flipVertical: boolean
  webcamQuality: 'low' | 'medium' | 'high' | 'ultra'

  // Physics
  spawnMode: SpawnMode
  spawnInterval: number
  spawnPositionX: number
  bounciness: number
  gravity: number
  ballSize: number

  // Color Detection
  targetColor: string
  colorTolerance: number
  saturationMin: number
  valueMin: number
  boxOpacity: number
  showDetection: boolean

  // Calibration
  isCalibrating: boolean
  calibrationPoints: CalibrationPoint[]

  // Display
  showBackground: boolean
  showUI: boolean

  // Status
  opencvReady: boolean
  fps: number
  detectedBlocks: number

  // Actions
  setStreaming: (streaming: boolean) => void
  setSelectedCamera: (camera: string) => void
  setAvailableCameras: (cameras: MediaDeviceInfo[]) => void
  setVideoRotation: (rotation: number) => void
  setFlipHorizontal: (flip: boolean) => void
  setFlipVertical: (flip: boolean) => void
  setWebcamQuality: (quality: 'low' | 'medium' | 'high' | 'ultra') => void

  setSpawnMode: (mode: SpawnMode) => void
  setSpawnInterval: (interval: number) => void
  setSpawnPositionX: (x: number) => void
  setBounciness: (bounciness: number) => void
  setGravity: (gravity: number) => void
  setBallSize: (size: number) => void

  setTargetColor: (color: string) => void
  setColorTolerance: (tolerance: number) => void
  setSaturationMin: (saturation: number) => void
  setValueMin: (value: number) => void
  setBoxOpacity: (opacity: number) => void
  setShowDetection: (show: boolean) => void

  setCalibrating: (calibrating: boolean) => void
  setCalibrationPoints: (points: CalibrationPoint[]) => void

  setShowBackground: (show: boolean) => void
  setShowUI: (show: boolean) => void

  setOpencvReady: (ready: boolean) => void
  setFps: (fps: number) => void
  setDetectedBlocks: (blocks: number) => void

  resetSettings: () => void
}

const defaultState = {
  isStreaming: false,
  selectedCamera: '',
  availableCameras: [] as MediaDeviceInfo[],
  videoRotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  webcamQuality: 'high' as const,

  spawnMode: 'balls' as SpawnMode,
  spawnInterval: 500,
  spawnPositionX: 50,
  bounciness: 0.7,
  gravity: 1,
  ballSize: 15,

  targetColor: '#00ff00',
  colorTolerance: 20,
  saturationMin: 100,
  valueMin: 100,
  boxOpacity: 50,
  showDetection: true,

  isCalibrating: false,
  calibrationPoints: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ],

  showBackground: true,
  showUI: true,

  opencvReady: false,
  fps: 0,
  detectedBlocks: 0,
}

// Create store without persist for now to avoid hydration issues
export const useFluxStore = create<FluxState>()((set) => ({
  ...defaultState,

  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setSelectedCamera: (camera) => set({ selectedCamera: camera }),
  setAvailableCameras: (cameras) => set({ availableCameras: cameras }),
  setVideoRotation: (rotation) => set({ videoRotation: rotation }),
  setFlipHorizontal: (flip) => set({ flipHorizontal: flip }),
  setFlipVertical: (flip) => set({ flipVertical: flip }),
  setWebcamQuality: (quality) => set({ webcamQuality: quality }),

  setSpawnMode: (mode) => set({ spawnMode: mode }),
  setSpawnInterval: (interval) => set({ spawnInterval: interval }),
  setSpawnPositionX: (x) => set({ spawnPositionX: x }),
  setBounciness: (bounciness) => set({ bounciness: bounciness }),
  setGravity: (gravity) => set({ gravity: gravity }),
  setBallSize: (size) => set({ ballSize: size }),

  setTargetColor: (color) => set({ targetColor: color }),
  setColorTolerance: (tolerance) => set({ colorTolerance: tolerance }),
  setSaturationMin: (saturation) => set({ saturationMin: saturation }),
  setValueMin: (value) => set({ valueMin: value }),
  setBoxOpacity: (opacity) => set({ boxOpacity: opacity }),
  setShowDetection: (show) => set({ showDetection: show }),

  setCalibrating: (calibrating) => set({ isCalibrating: calibrating }),
  setCalibrationPoints: (points) => set({ calibrationPoints: points }),

  setShowBackground: (show) => set({ showBackground: show }),
  setShowUI: (show) => set({ showUI: show }),

  setOpencvReady: (ready) => set({ opencvReady: ready }),
  setFps: (fps) => set({ fps: fps }),
  setDetectedBlocks: (blocks) => set({ detectedBlocks: blocks }),

  resetSettings: () => set({ ...defaultState, availableCameras: [] }),
}))
