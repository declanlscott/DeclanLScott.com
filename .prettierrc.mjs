/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
export default {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss",
  ],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
  importOrder: [
    "<BUILTIN_MODULES>",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^[~]",
    "^[.]",
    "",
    "<TYPES>",
    "<TYPES>^[~]",
    "<TYPES>^[.]",
  ],
};
