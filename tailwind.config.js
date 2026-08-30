module.exports = {
  presets: ['@tailwindcss/forms'],
  content: [
    './web/index.html',
    './web/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1a1a1a',
      },
    },
  },
  plugins: [],
};
