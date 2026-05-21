/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        brand: {
          purple: "#6366f1",
          blue: "#3b82f6",
        },
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(99, 102, 241, 0.12)",
        nav: "0 4px 20px -2px rgba(49, 46, 129, 0.35)",
      },
    },
  },
  plugins: [],
};
