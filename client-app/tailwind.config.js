/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'red': {
          'dark': '#ba0c00',
          'normal': '#cc0d00'
        }
      }
    },
  },
  plugins: [],
}