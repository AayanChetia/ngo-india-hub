import type { Config } from "tailwindcss";

/**
 * NGO India Hub design tokens.
 * Brand: purple primary (#533AB7) + teal accent (#0F6E56).
 * Scales are hand-tuned around those two anchors (500 = brand value).
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Purple — primary brand colour
        primary: {
          50: "#f4f2fc",
          100: "#e9e5f9",
          200: "#d3cbf3",
          300: "#b3a4e9",
          400: "#8e75dc",
          500: "#533AB7", // brand
          600: "#4a33a4",
          700: "#3e2b88",
          800: "#33246e",
          900: "#2a1f59",
          DEFAULT: "#533AB7",
        },
        // Teal — accent colour
        accent: {
          50: "#eefaf5",
          100: "#d3f2e6",
          200: "#a8e5cf",
          300: "#6fd0b1",
          400: "#37b48f",
          500: "#0F6E56", // brand accent
          600: "#0d6049",
          700: "#0b4d3c",
          800: "#0a3e31",
          900: "#083429",
          DEFAULT: "#0F6E56",
        },
        // Supporting neutral slate
        ink: {
          50: "#f8f8fb",
          100: "#f1f1f6",
          200: "#e2e2ec",
          300: "#cbcbd9",
          400: "#9a9ab0",
          500: "#6c6c85",
          600: "#4d4d63",
          700: "#3a3a4c",
          800: "#262633",
          900: "#16161f",
        },
        // Semantic
        success: "#0F6E56",
        warning: "#B7791F",
        danger: "#C1352B",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(22,22,31,0.06), 0 1px 2px rgba(22,22,31,0.04)",
        "card-hover":
          "0 10px 25px -5px rgba(83,58,183,0.12), 0 6px 12px -6px rgba(22,22,31,0.10)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
