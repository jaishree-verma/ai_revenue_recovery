/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        amex: {
          blue: '#2563eb',
          darkBlue: '#1d4ed8',
          brightBlue: '#3b82f6',
          navy: '#0f172a',
          darkBg: '#080d14',
          cardBg: '#0d1520',
          green: '#10b981',
        }
      }
    },
  },
  plugins: [],
}
