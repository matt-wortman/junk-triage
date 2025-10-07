import type { Config } from "tailwindcss";

// Tailwind v4 uses CSS-first configuration
// Most theme configuration is in src/index.css using @theme
const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Ensure all responsive text size classes are generated
    'md:text-xl', 'md:text-2xl', 'md:text-3xl', 'md:text-4xl',
    'md:text-5xl', 'md:text-6xl', 'md:text-7xl', 'md:text-8xl', 'md:text-9xl',
  ],
};

export default config;
