/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F8FAFC',
          primary: '#6366F1',
          accent: '#10B981',
        },
        deepmidnight: {
          base: '#02030A',
          surface: '#070B16',
          elevated: '#0D1324',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        priorityPulse: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(244, 63, 94, 0.22)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(244, 63, 94, 0)',
          },
        },
      },
      animation: {
        priorityPulse: 'priorityPulse 2.2s ease-out infinite',
      },
    },
  },
  plugins: [],
}

