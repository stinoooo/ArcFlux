import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flux | Arcnode',
  description: 'Real-time color tracking & physics simulation for projection mapping',
  keywords: ['projection mapping', 'physics simulation', 'color tracking', 'opencv', 'matter.js'],
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
    title: 'Flux | Arcnode',
    description: 'Real-time color tracking & physics simulation for projection mapping',
    url: 'https://flux.arcnode.dev',
    siteName: 'Flux',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flux | Arcnode',
    description: 'Real-time color tracking & physics simulation for projection mapping',
  },
}

export const viewport: Viewport = {
  themeColor: '#121213',
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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-tornado">
        {/* Noise texture overlay */}
        <div className="noise-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}
