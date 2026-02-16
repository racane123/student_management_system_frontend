/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', dark: '#1d4ed8' },
        secondary: '#1e293b',
        danger: '#ef4444',
      },
      borderRadius: {
        box: '6px',
      },
    },
  },
  plugins: [],
};
