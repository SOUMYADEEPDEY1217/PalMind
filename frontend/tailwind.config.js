/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        obsidian: {
          950: '#030508',
          900: '#06090e',
          850: '#090d15',
          800: '#0e1420',
          700: '#161f30',
        },
        coral: {
          50: '#fff5f2',
          100: '#ffe8e2',
          200: '#ffd5c9',
          300: '#ffb5a1',
          400: '#ff8262',
          500: '#ff5722', // signature vibrant molten orange
          600: '#f44312',
          700: '#dc3106',
          800: '#b42605',
          900: '#8e230a',
          950: '#4c0d02',
        },
        primary: {
          50: '#fff5f2',
          100: '#ffe8e2',
          200: '#ffd5c9',
          300: '#ffb5a1',
          400: '#ff8262',
          500: '#ff5722',
          600: '#f44312',
          700: '#dc3106',
          800: '#b42605',
          900: '#8e230a',
          950: '#4c0d02',
        },
        card: 'var(--card)',
        cardForeground: 'var(--card-foreground)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        mutedForeground: 'var(--muted-foreground)',
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 7s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite 1s',
        'float-fast': 'float 4s ease-in-out infinite 0.5s',
        'vortex-spin': 'vortexSpin 40s linear infinite',
        'vortex-pulse': 'vortexPulse 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        vortexSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        vortexPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(30px)' },
          '50%': { opacity: '0.7', filter: 'blur(45px)' },
        },
      },
    },
  },
  plugins: [],
}
