/**
 * Tailwind CSS - räätälöity konfiguraatio Ilojaloin-sivustolle.
 * Määrittelee värit ja typografia-asetukset brändipaletin mukaisesti.
 */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2A6FD3',
        primaryLight: '#4A97E9',
        offwhite: {
          DEFAULT: '#F5F7FA',
          light: '#FBFCFD',
          dark: '#ECEFF4',
        },
        accentPink: '#FFD4C2',
        accentYellow: '#FFFAC2',
        accentCream: '#F2EDE4',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        heading: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};