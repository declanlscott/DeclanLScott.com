import cloudflare from "@astrojs/cloudflare";
import db from "@astrojs/db";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";

import { remarkReadingTime } from "./remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  adapter: cloudflare({ imageService: "compile" }),
  site: "https://www.declanlscott.com",
  integrations: [
    db(),
    sitemap(),
    tailwind({ applyBaseStyles: false }),
    svelte(),
    mdx(),
  ],
  markdown: { remarkPlugins: [remarkReadingTime] },
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ["Arial", "Roboto"],
        resolvePath: (path) => new URL(`./public${path}`, import.meta.url),
      }),
    ],
  },
});
