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
        // Accent colors - Teal/Cyan theme
        'arc': {
          primary: '#14B8A6',    // teal-500
          secondary: '#0D9488',  // teal-600
          accent: '#2DD4BF',     // teal-400
          glow: '#5EEAD4',       // teal-300
          deep: '#0F766E',       // teal-700
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
          '0%': { boxShadow: '0 0 5px rgba(20, 184, 166, 0.5), 0 0 20px rgba(20, 184, 166, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(13, 148, 136, 0.6), 0 0 40px rgba(13, 148, 136, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'inner-glow': 'inset 0 0 20px rgba(20, 184, 166, 0.1)',
        'arc': '0 0 30px rgba(20, 184, 166, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
