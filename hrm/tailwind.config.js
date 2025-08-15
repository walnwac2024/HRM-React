/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customRed: "#E11D48", // change hex to your exact red
        customLightGrey: "#94A3B8",
      },
    },
  },
  plugins: [],
};
