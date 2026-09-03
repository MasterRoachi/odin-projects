import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // relative asset paths, so the built app works from a subfolder on GitHub
  // Pages rather than only from a domain root
  base: "./",
  plugins: [react()],
});
