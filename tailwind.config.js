/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({addBase, addComponents, addUtilities, theme}){
      addBase({
        'h1': {fontSize: '30px', fontWeight: 'bold'}
      })
    })
  ],
}

