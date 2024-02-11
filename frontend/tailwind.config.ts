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
      backgroundImage: {
        gradient:
          "linear-gradient(90deg, var(--gradient-color-1), var(--gradient-color-2), var(--gradient-color-3), var(--gradient-color-4))",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
