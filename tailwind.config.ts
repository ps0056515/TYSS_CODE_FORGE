import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      fontSize: {
        "readable": ["0.9375rem", { lineHeight: "1.5" }],
      },
      colors: {
        bg: "var(--cf-bg)",
        card: "var(--cf-card)",
        border: "var(--cf-border)",
        text: "var(--cf-text)",
        muted: "var(--cf-muted)",
        brand: "var(--cf-brand)",
        "brand-muted": "var(--cf-brand-muted)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.35)",
        glow: "0 0 24px rgba(109,94,241,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;

