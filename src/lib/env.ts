import { createEnv } from "@t3-oss/env-core";
import { z } from "astro/zod";

export const env = createEnv({
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  client: {
    PUBLIC_NAME: z.string(),
    PUBLIC_EMAIL: z.string().email(),
    PUBLIC_LINKEDIN: z.string().url(),
    PUBLIC_X_USERNAME: z.string(),
  },

  server: {
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),

    ASTRO_STUDIO_APP_TOKEN: z.string(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: import.meta.env,
});
