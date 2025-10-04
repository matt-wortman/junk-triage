import type { Config } from "tailwindcss";

// Tailwind v4 uses CSS-first configuration
// Most theme configuration is in src/index.css using @theme
const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
