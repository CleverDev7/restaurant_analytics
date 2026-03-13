import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3"
        },
        slate: {
          950: "#0b1220"
        }
      },
      boxShadow: {
        card: "0 15px 40px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
