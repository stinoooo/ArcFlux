'use client'

import Script from 'next/script'

export function OpenCVLoader() {
  return (
    <Script
      src="/opencv.js"
      strategy="lazyOnload"
      onLoad={() => {
        console.log('OpenCV.js loaded successfully')
      }}
      onError={(e) => {
        console.error('OpenCV.js failed to load:', e)
      }}
    />
  )
}
