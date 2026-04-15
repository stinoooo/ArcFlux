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
        // Matte black palette - no pure blacks
        'matte': {
          DEFAULT: '#28282B',
          50: '#3d3d42',
          100: '#28282B',
          200: '#232326',
          300: '#1e1e21',
          400: '#19191c',
          500: '#141417',
          600: '#0f0f12',
        },
        'walnut': '#1B1813',
        'tornado': '#121213',
        'night': '#232323',
        'stout': '#0F0B0A',
        // Accent colors
        'arc': {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#a855f7',
          glow: '#c084fc',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
        'arc': '0 0 30px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
