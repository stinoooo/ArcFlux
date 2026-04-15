'use client'

import { useCallback, useRef, useEffect, useState } from 'react'
import { useFluxStore } from '@/store/useFluxStore'
import { getWebcamConstraints } from '@/lib/utils'

interface UseWebcamResult {
  videoRef: React.RefObject<HTMLVideoElement>
  startWebcam: () => Promise<void>
  stopWebcam: () => void
  switchCamera: (deviceId: string) => Promise<void>
  refreshCameras: () => Promise<void>
  error: string | null
}

export function useWebcam(): UseWebcamResult {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    selectedCamera,
    webcamQuality,
    setStreaming,
    setSelectedCamera,
    setAvailableCameras,
  } = useFluxStore()

  const refreshCameras = useCallback(async () => {
    try {
      // Request permission first to get full device list
      await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter((d) => d.kind === 'videoinput')
      setAvailableCameras(cameras)

      // Select first camera if none selected
      if (!selectedCamera && cameras.length > 0) {
        setSelectedCamera(cameras[0].deviceId)
      }
    } catch (err) {
      console.error('Failed to enumerate cameras:', err)
      setError('Camera access denied')
    }
  }, [selectedCamera, setAvailableCameras, setSelectedCamera])

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStreaming(false)
    setError(null)
  }, [setStreaming])

  const startWebcam = useCallback(async () => {
    setError(null)
    stopWebcam()

    try {
      const constraints = getWebcamConstraints(webcamQuality, selectedCamera)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        streamRef.current = stream
        setStreaming(true)

        // Log actual video settings
        const track = stream.getVideoTracks()[0]
        const settings = track.getSettings()
        console.log('Webcam started with settings:', {
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          deviceId: settings.deviceId,
        })

        // Apply advanced camera settings if available
        if ('applyConstraints' in track) {
          try {
            // Try to enable advanced features (not all cameras support these)
            // These are vendor-specific extensions not in the standard types
            const advancedConstraints = {
              advanced: [
                { exposureMode: 'continuous' },
                { focusMode: 'continuous' },
                { whiteBalanceMode: 'continuous' },
              ],
            } as unknown as MediaTrackConstraints
            await track.applyConstraints(advancedConstraints)
          } catch {
            // Not all cameras support these features
          }
        }
      }
    } catch (err) {
      console.error('Failed to start webcam:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera.')
        } else if (err.name === 'OverconstrainedError') {
          setError('Camera does not support requested quality. Try a lower setting.')
        } else {
          setError(`Camera error: ${err.message}`)
        }
      }
    }
  }, [selectedCamera, webcamQuality, stopWebcam, setStreaming])

  const switchCamera = useCallback(
    async (deviceId: string) => {
      setSelectedCamera(deviceId)
      if (streamRef.current) {
        await startWebcam()
      }
    },
    [setSelectedCamera, startWebcam]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam()
    }
  }, [stopWebcam])

  // Handle device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      refreshCameras()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [refreshCameras])

  return {
    videoRef: videoRef as React.RefObject<HTMLVideoElement>,
    startWebcam,
    stopWebcam,
    switchCamera,
    refreshCameras,
    error,
  }
}
