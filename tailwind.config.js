/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './main.js'],
  theme: {
    extend: {
      colors: {
        devnet: {
          primary: '#a3e635',
          bg: '#0a0f0a',
          surface: '#111a11',
          border: '#1a2e1a',
          muted: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
