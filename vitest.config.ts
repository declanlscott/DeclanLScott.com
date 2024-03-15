import { config } from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

config();

export default defineConfig({
  plugins: [tsconfigPaths()],
});
