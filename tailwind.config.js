/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  './src/**/*.{js,jsx,ts,tsx}',
  './dist/*.html',
  './dist/*.js'],
  theme: {
    extend: {
      backgroundImage: {
        gradientBg: "url('/src/assets/images/18_grain_texture_1080x1080.jpeg')"
      },
      colors: {
        light: {
          primary: "#4484CE",
          secondary: "#D9D9D9",
          minor: "#F9CF00",
          accent: "#F19F4D"
        },
        dark: {
          primary: "#000000",
          secondary: "#062F4F",
          minor: "#813772",
          accent: "#B82601"
        }
      }
    },
  },
  plugins: [],
}
