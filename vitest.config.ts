import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@infernodrift4/game-core": fileURLToPath(
        new URL("./packages/game-core/src/index.ts", import.meta.url),
      ),
      "@infernodrift4/protocol": fileURLToPath(
        new URL("./packages/protocol/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
  },
});
