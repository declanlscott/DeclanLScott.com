import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";
import { loadEnv } from "vite";

import { env } from "./env";

env(loadEnv(import.meta.env.MODE, process.cwd(), ""));

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ["Arial", "Roboto"],
        resolvePath: (path) => new URL(`./public${path}`, import.meta.url),
      }),
    ],
  },
});
