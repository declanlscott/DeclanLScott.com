import db from "@astrojs/db";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";
import { loadEnv } from "vite";

import { env } from "./src/lib/env";

env(loadEnv(import.meta.env.MODE, process.cwd(), ""));

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  // site: "https://www.declanlscott.com",
  integrations: [
    db(),
    sitemap(),
    tailwind({ applyBaseStyles: false }),
    svelte(),
  ],
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ["Arial", "Roboto"],
        resolvePath: (path) => new URL(`./public${path}`, import.meta.url),
      }),
    ],
    optimizeDeps: {
      exclude: ["oslo"],
    },
  },
});
