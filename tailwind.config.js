module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#121212',
          surface: '#1E1E1E',
          primary: '#2D2D2D',
          text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            muted: '#BDBDBD'
          }
        }
      }
    },
  },
  plugins: [],
} 