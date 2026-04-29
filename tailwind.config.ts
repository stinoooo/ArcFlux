import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface — chassis to raised key
        ink: {
          0: '#0B0B0C',
          1: '#101012',
          2: '#15151A',
          3: '#1C1C22',
          4: '#2A2A32',
        },
        // Signal — phosphor cyan
        signal: {
          DEFAULT: '#2DE3D4',
          deep: '#14B8A6',
          bright: '#5EEAD4',
        },
        // Warning amber — for calibration & alerts
        warn: {
          DEFAULT: '#F5A524',
        },
        // Legacy aliases kept so existing components don't break during migration
        arc: {
          primary: '#2DE3D4',
          secondary: '#14B8A6',
          accent: '#5EEAD4',
          glow: '#5EEAD4',
          deep: '#0F766E',
        },
        matte: {
          DEFAULT: '#15151A',
          50: '#2A2A32',
          100: '#1C1C22',
          200: '#15151A',
          300: '#101012',
          400: '#0B0B0C',
          500: '#08080A',
          600: '#050506',
        },
        walnut: '#101012',
        tornado: '#0B0B0C',
        night: '#15151A',
        stout: '#08080A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        widest: '0.2em',
      },
      boxShadow: {
        'signal-glow': '0 0 20px rgba(45, 227, 212, 0.35)',
        'panel-deep': '0 30px 60px -20px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'led-pulse': 'led-pulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'reveal': 'reveal 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
