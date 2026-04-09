import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          threeCore: ["three"],
          threeFiber: ["@react-three/fiber"],
          threeDrei: ["@react-three/drei"],
          ui: [
            "axios",
            "canvas-confetti",
            "clsx",
            "framer-motion",
            "lucide-react",
            "react-helmet-async",
            "react-hot-toast"
          ]
        }
      }
    }
  }
});
