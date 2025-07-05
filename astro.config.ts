import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";
import rehypeExternalLinks from "rehype-external-links";

import { remarkReadingTime } from "./remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: cloudflare({ imageService: "compile" }),
  site: "https://www.declanlscott.com",
  integrations: [
    sitemap(),
    tailwind({ applyBaseStyles: false }),
    svelte(),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [[rehypeExternalLinks, { target: "_blank" }]],
  },
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ["Arial", "Roboto"],
        resolvePath: (path) => new URL(`./public${path}`, import.meta.url),
      }),
    ],
  },
});
