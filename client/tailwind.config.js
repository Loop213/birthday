/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050816",
        panel: "#10162f",
        mist: "#91a8ff",
        neon: {
          cyan: "#4bf4ff",
          pink: "#ff4ecd",
          amber: "#ffd166",
          mint: "#7cf5b3"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 20px 80px rgba(75,244,255,0.16)",
        pink: "0 20px 80px rgba(255,78,205,0.18)"
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(75,244,255,0.2), transparent 30%), radial-gradient(circle at top right, rgba(255,78,205,0.18), transparent 30%), radial-gradient(circle at bottom, rgba(255,209,102,0.12), transparent 40%)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
