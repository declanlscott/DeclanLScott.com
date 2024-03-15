import cloudflare from "@astrojs/cloudflare";
import db from "@astrojs/db";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  adapter: cloudflare(),
  site: "https://www.declanlscott.com",
  integrations: [
    db(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    svelte(),
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
