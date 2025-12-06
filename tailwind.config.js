/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)",
      },
      colors: {
        primary: {
          50: '#f7fcf0',
          100: '#ecf7df',
          200: '#d7eec1',
          300: '#b8e096',
          400: '#94cc66',
          500: '#6c8f32', // ShiftCheck Green
          600: '#557326',
          700: '#435b20',
          800: '#384a1e',
          900: '#303e1c',
        },
        accent: {
          50: '#fff7ed',
          500: '#C55E30', // ShiftCheck Orange
          600: '#9E441E',
        },
        success: {
          50: '#F0FDF4',
          100: '#D1FAE5',
          200: '#A7F3D0',
          500: '#6C8F32',
          600: '#5A7629',
          700: '#065F46',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      }
    }
  },
  plugins: [],
}
