// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        customRed: '#E02D3D',
        customLightGrey: '#94A3B8',
      },
    },
  },
  plugins: [],
};
