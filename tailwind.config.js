/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ou 'media' para prefers-color-scheme
  theme: {
    fontFamily: {
      primary: ['Inter', 'sans-serif'], // Fonte principal
    }
  },
  plugins: [],
}