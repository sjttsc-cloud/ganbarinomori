/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      colors: {
        'primary': '#f4a261',
        'secondary': '#e9c46a',
        'tertiary': '#2a9d8f',
        'background': '#fefae0',
        'text-main': '#264653',
      }
    },
  },
  plugins: [],
}
