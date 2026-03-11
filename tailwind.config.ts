import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B0F",
        card: "#111118",
        border: "rgba(255,255,255,0.10)",
        text: "#EDEDF3",
        muted: "rgba(237,237,243,0.70)",
        brand: "#6D5EF1"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;

