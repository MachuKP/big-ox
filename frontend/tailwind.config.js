/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        primary: "#1b75d0",
        secondary: "#e7700d",
        white: "0c0d0e",
        black: "3b4045",
        gray: "#f6f6f6",
      },
    },
  },
  plugins: ["prettier-plugin-tailwindcss", require("tailwindcss-animate")],
};
