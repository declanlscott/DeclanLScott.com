import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";

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
