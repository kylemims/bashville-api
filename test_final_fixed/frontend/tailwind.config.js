// tailwind.config.js - Tailwind CSS configuration
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fee394',
        secondary: '#d46a6a',
        accent: '#46cba7',
        background: '#0c0806',
      },
    },
  },
  plugins: [],
}