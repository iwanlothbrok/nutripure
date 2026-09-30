/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pure: {
          dark: '#0B0F19',
          card: '#151D2E',
          card2: '#1C263B',
          accent: '#10B981',
          good: '#10B981',
          moderate: '#F59E0B',
          bad: '#EF4444',
          gray: '#94A3B8',
          border: '#2A364F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
