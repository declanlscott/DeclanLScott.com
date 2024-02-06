import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import { FontaineTransform } from "fontaine";
import { loadEnv } from "vite";

import { env } from "./env";

env(loadEnv(import.meta.env.MODE, process.cwd(), ""));

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ["Arial"],
        resolvePath: (path) => new URL(`./public${path}`, import.meta.url),
      }),
    ],
  },
});
