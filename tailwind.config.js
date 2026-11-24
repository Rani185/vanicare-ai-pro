/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        slate: {
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        countUp: {
          from: { transform: 'translateY(6px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(-12px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
        barGrow: {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
      },
      animation: {
        waveform: 'waveform 0.9s ease-in-out infinite',
        fadeIn: 'fadeIn 0.4s ease-out',
        slideInRight: 'slideInRight 0.35s ease-out',
        pulseRing: 'pulseRing 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite',
        shimmer: 'shimmer 1.8s infinite',
        countUp: 'countUp 0.3s ease-out',
        toastIn: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        spinSlow: 'spinSlow 8s linear infinite',
        barGrow: 'barGrow 0.7s cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
};
