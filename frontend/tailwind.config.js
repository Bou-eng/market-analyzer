/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This enables the "Night Feature"
  theme: {
    extend: {
      colors: {
        // Custom colors matching the screenshots
        brand: {
          DEFAULT: '#2563EB', // Blue
          dark: '#1E40AF',
          light: '#DBEAFE',
        },
        surface: {
          light: '#F8FAFC',
          dark: '#0F172A',
        }
      }
    },
  },
  plugins: [],
}