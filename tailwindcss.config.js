/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        ink: '#101316',
        acid: '#D3F36B',
        paper: '#F4F5F0',
      },
      boxShadow: {
        soft: '0 22px 70px rgba(18, 28, 22, .10)',
      },
    },
  },
  plugins: [],
}
