import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "alabaster-grey": {
          50: "#f3f2f2",
          100: "#e7e4e4",
          200: "#cfc9c9",
          300: "#b6afaf",
          400: "#9e9494",
          500: "#867979",
          600: "#6b6161",
          700: "#504949",
          800: "#363030",
          900: "#1b1818",
          950: "#131111",
        },
        "mint-cream": {
          50: "#f0f6ee",
          100: "#e0edde",
          200: "#c2dbbd",
          300: "#a3c99c",
          400: "#85b87a",
          500: "#66a659",
          600: "#528547",
          700: "#3d6336",
          800: "#294224",
          900: "#142112",
          950: "#0e170c",
        },
        "steel-blue": {
          50: "#ebf3f9",
          100: "#d7e8f4",
          200: "#b0d1e8",
          300: "#88badd",
          400: "#61a2d1",
          500: "#398bc6",
          600: "#2e6f9e",
          700: "#225477",
          800: "#17384f",
          900: "#0b1c28",
          950: "#08131c",
        },
        "sandy-brown": {
          50: "#fef0e6",
          100: "#fee1cd",
          200: "#fcc29c",
          300: "#fba46a",
          400: "#fa8638",
          500: "#f96706",
          600: "#c75305",
          700: "#953e04",
          800: "#632903",
          900: "#321501",
          950: "#230e01",
        },
        "soft-linen": {
          50: "#f3f4f0",
          100: "#e7eae1",
          200: "#cfd5c3",
          300: "#b7c0a5",
          400: "#9faa88",
          500: "#87956a",
          600: "#6c7755",
          700: "#515a3f",
          800: "#363c2a",
          900: "#1b1e15",
          950: "#13150f",
        },
      },
      fontFamily: {
        sans: ["Lexend Deca", "Inter", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
        serif: ["DM Serif Display", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero":
          "linear-gradient(135deg, #1b1818 0%, #363030 40%, #225477 100%)",
        "gradient-card":
          "linear-gradient(180deg, #f3f4f0 0%, #e7eae1 100%)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "scan": "scan 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        scan: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
