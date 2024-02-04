import typography from "@tailwindcss/typography";
import defaultTheme from "tailwindcss/defaultTheme";

import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [typography],
} satisfies Config;
