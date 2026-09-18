import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        correct: 'rgb(var(--correct) / <alpha-value>)',
        close: 'rgb(var(--close) / <alpha-value>)',
        far: 'rgb(var(--far) / <alpha-value>)',
        'hc-correct': 'rgb(var(--hc-correct) / <alpha-value>)',
        'hc-close': 'rgb(var(--hc-close) / <alpha-value>)',
        'hc-far': 'rgb(var(--hc-far) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          '"Fraunces Variable"',
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif',
        ],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
}

export default config