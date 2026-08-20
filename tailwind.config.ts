import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090A0F",
        surface: {
          50: "#1E202C",
          100: "#181A24",
          200: "#12131C",
          300: "#0D0E15",
        },
        strk: {
          flame: "#FF5722",
          orange: "#FF8A00",
          amber: "#FFB800",
          gold: "#FFD700",
          neon: "#00F5D4",
          purple: "#9D4EDD",
          ruby: "#E63946",
          dark: "#08090D",
          card: "#12141F",
          border: "#23273A",
          textMuted: "#8892B0",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "flame-gradient": "linear-gradient(135deg, #FF4500 0%, #FF8C00 50%, #FFD700 100%)",
        "violet-flame": "linear-gradient(135deg, #7928CA 0%, #FF0080 100%)",
        "cyber-gradient": "linear-gradient(135deg, #00F5D4 0%, #00BBF9 100%)",
        "dark-gradient": "linear-gradient(180deg, #161826 0%, #0D0E17 100%)",
      },
      boxShadow: {
        "flame-sm": "0 0 15px rgba(255, 87, 34, 0.25)",
        "flame-md": "0 0 25px rgba(255, 87, 34, 0.4)",
        "flame-lg": "0 0 45px rgba(255, 138, 0, 0.55)",
        "neon-glow": "0 0 20px rgba(0, 245, 212, 0.35)",
        "purple-glow": "0 0 25px rgba(157, 78, 221, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "flicker": "flicker 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.04)" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
