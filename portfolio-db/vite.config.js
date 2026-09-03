import { defineConfig } from "vite";

export default defineConfig({
  // relative asset paths, so the build works from a subfolder
  base: "./",
  // sql.js ships a .wasm; Vite needs to leave it alone and hash it as an asset
  assetsInclude: ["**/*.wasm"],
  optimizeDeps: { exclude: ["sql.js"] },
});
