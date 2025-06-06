/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ou 'media' para prefers-color-scheme
  theme: {
    colors: {
      // Light Mode
      'light-bg': '#F7F7F8',
      'light-card': '#FFFFFF',
      'light-border': '#E5E7EB',
      'light-text-primary': '#1F2A44',
      'light-text-secondary': '#6B7280',
      'light-accent': '#1D6FF9',
      'light-accent-hover': '#1A5CDB',
      'light-error': '#EF4444',
      'light-success': '#22C55E',
      'liked': '#ec4899',
      'reposted': '#5cefaa',
      // Dark Mode
      'dark-bg': '#14191f',
      'dark-card': '#2D3748',
      'dark-border': '#2e4052',
      'dark-text-primary': '#f1f3f5',
      'dark-text-secondary': '#788ea5',
      'dark-text-link': '#208bfe',
      'dark-accent': '#3B82F6',
      'dark-accent-hover': '#60A5FA',
      'dark-error': '#DC2626',
      'dark-success': '#16A34A'
    },
    fontFamily: {
      primary: ['Inter', 'sans-serif'], // Fonte principal
    }
  },
  plugins: [],
}