import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { OpenCVLoader } from '@/components/OpenCVLoader'
import './globals.css'

// Display — characterful editorial serif. Italic-only weight gives Flux a
// signature: refined, not generic SaaS sans.
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

// UI / body — JetBrains Mono. The instrument-panel feel depends on monospace
// for labels, readouts and slider values.
const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Flux — Arcnode',
  description: 'An optical instrument for projection mapping — real-time colour tracking, in your browser.',
  keywords: ['projection mapping', 'physics simulation', 'color tracking', 'opencv', 'matter.js', 'arcnode'],
  authors: [{ name: 'Arcnode' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Flux — Arcnode',
    description: 'An optical instrument for projection mapping.',
    url: 'https://flux.arcnode.dev',
    siteName: 'Flux',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flux — Arcnode',
    description: 'An optical instrument for projection mapping.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B0B0C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen">
        {/* Scope grid backdrop */}
        <div className="scope-grid" aria-hidden="true" />
        {/* Static / grain overlay */}
        <div className="grain-overlay" aria-hidden="true" />
        {/* Scanline atmosphere */}
        <div className="scanline-overlay" aria-hidden="true" />
        {children}
        <OpenCVLoader />
      </body>
    </html>
  )
}
