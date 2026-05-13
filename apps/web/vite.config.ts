import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/InfernoDrift4/",
  plugins: [react()],
  resolve: {
    alias: {
      "@infernodrift4/game-core": fileURLToPath(
        new URL("../../packages/game-core/src/index.ts", import.meta.url),
      ),
      "@infernodrift4/protocol": fileURLToPath(
        new URL("../../packages/protocol/src/index.ts", import.meta.url),
      ),
    },
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
