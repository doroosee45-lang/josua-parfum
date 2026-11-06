/** @type {import('tailwindcss').Config} */
const fullOpacityScale = Object.fromEntries(
  Array.from({ length: 101 }, (_, i) => [String(i), `${(i / 100).toFixed(2).replace(/\.?0+$/, '') || '0'}`])
);

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      opacity: fullOpacityScale,
      colors: {
        espresso: {
          950: '#14100F',
          900: '#1C1615',
          800: '#241C1A',
          700: '#2C2423',
          600: '#3A302E',
          500: '#5A4E4C',
        },
        roselle: {
          blush: '#E2C0BC',
          champagne: '#D4B8AE',
          rosewood: '#9E6B6B',
          deep: '#8A5A5A',
          gold: '#B08D57',
        },
        ivory: {
          50: '#FCFAFA',
          100: '#FAF8F4',
          200: '#F5EDE8',
          300: '#EAE4E1',
          400: '#E5DCD9',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', '"Cormorant Garamond"', 'cursive'],
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
