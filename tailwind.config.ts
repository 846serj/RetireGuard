import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f2740",
        brand: "#1f6feb",
        good: "#1a8a55",
        warn: "#c98a00",
        bad: "#c0392b",
      },
    },
  },
  plugins: [],
};
export default config;
