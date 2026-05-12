/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: { 900: '#0f1117', 800: '#1a1d2e', 700: '#252840', 600: '#2f3354' },
        accent: { DEFAULT: '#6c63ff', light: '#8b85ff' },
        good: '#22c55e',
        warn: '#f59e0b',
        bad: '#ef4444',
      },
    },
  },
  plugins: [],
}
