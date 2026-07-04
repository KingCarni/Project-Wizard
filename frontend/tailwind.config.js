/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', '"Inter"', "system-ui", "sans-serif"],
        display: ['"Instrument Serif"', '"Fraunces"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        // Graphite (neutral base) — warmer than pure gray
        graphite: {
          50:  "#f7f7f8",
          100: "#eeeef1",
          200: "#d9dae0",
          300: "#b8bac4",
          400: "#8f92a0",
          500: "#6b6e7d",
          600: "#4f5261",
          700: "#3d404d",
          800: "#292b35",
          900: "#1a1c23",
          950: "#101117",
        },
        // Royal Purple — accent only
        royal: {
          50:  "#f5f2ff",
          100: "#ede6ff",
          200: "#dbccff",
          300: "#c2a5ff",
          400: "#a578ff",
          500: "#8a4fff",
          600: "#7130f0",
          700: "#5f22cf",
          800: "#4e1da8",
          900: "#421b87",
          950: "#280d5c",
        },
        // Warm whites
        cream: {
          50:  "#fdfcfa",
          100: "#f9f7f2",
          200: "#f2eee5",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(16, 17, 23, 0.04), 0 1px 1px rgba(16, 17, 23, 0.02)",
        card: "0 1px 3px rgba(16, 17, 23, 0.06), 0 1px 2px rgba(16, 17, 23, 0.04)",
        pop: "0 8px 24px -8px rgba(16, 17, 23, 0.12), 0 2px 6px rgba(16, 17, 23, 0.06)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
