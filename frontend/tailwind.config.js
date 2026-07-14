/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        themeBg: "var(--bg-main)",
        themeText: "var(--text-main)",
        themeDesc: "var(--text-muted)",
        themeBtn: "var(--btn-primary)",
      },
    },
  },
  plugins: [],
};