/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#FFF7ED', 100: '#FFEDD5', 500: '#F97316', 600: '#EA580C', 700: '#C2410C' },
        ink: '#1A1A1A',
        canvas: '#F8F8F7',
      },
      fontFamily: { sans: ['var(--font-geist-sans)', 'sans-serif'] },
      boxShadow: { soft: '0 18px 50px -28px rgba(26, 26, 26, 0.35)' },
    },
  },
  plugins: [],
};

export default config;