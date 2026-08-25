/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        razor: {
          bg: '#050911',
          panel: '#0a101d',
          card: '#0e1726',
          cardHover: '#142034',
          border: '#1b2a42',
          borderLight: '#263b5c',
          blue: '#0c2340',
          primary: '#0c8ce9',
          accent: '#00c988',
          accentHover: '#05e69d',
          amber: '#f59e0b',
          rose: '#ef4444',
          purple: '#8b5cf6',
          textMuted: '#8b9bb4',
          textDim: '#546682'
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(0, 201, 136, 0.25)',
        'glow-blue': '0 0 25px -5px rgba(12, 140, 233, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-rose': '0 0 25px -5px rgba(239, 68, 68, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
