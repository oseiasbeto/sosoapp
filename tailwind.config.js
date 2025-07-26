/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ou 'media' para prefers-color-scheme
  theme: {
    colors: {
      // Core 
      'primary': 'rgb(32,139,254)',
      // Light Mode
      'light-bg': '#fff',
      'light-card': '#f1f3f5',
      'light-border': '#d4dbe2',
      'light-text-primary': '#0b0f14',
      'light-text-secondary': '#42576c',
      'light-accent': '#1D6FF9',
      'light-accent-hover': '#1A5CDB',
      'light-error': '#EF4444',
      'light-success': '#22C55E',
      'liked': '#ec4899',
      'reposted': '#5cefaa',
      // Dark Mode
      'dark-bg': '#161e27',
      'dark-card': '#1e2936',
      'dark-border': '#2e4052',
      'dark-text-primary': '#f1f3f5',
      'dark-text-secondary': '#788ea5',
      'dark-text-link': '#208bfe',
      'dark-text-light': '#93a5b7',
      'dark-accent-hover': '#60A5FA',
      'dark-error': '#DC2626',
      'dark-success': '#16A34A',
      'btn-plus-start': 'rgb(90, 113, 250)', // Cor inicial
      'btn-plus-end': 'rgb(0, 133, 255)',    // Cor final
    },
    backgroundImage: {
      'btn-plus': 'linear-gradient(135deg, var(--tw-gradient-stops))', // Gradiente pronto
    },
    fontFamily: {
      primary: ['Inter', 'sans-serif'], // Fonte principal
    }
  },
  plugins: [],
}