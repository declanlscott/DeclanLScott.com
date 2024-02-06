import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = (runtimeEnv: Record<string, string> = import.meta.env) =>
  createEnv({
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

    /**
     * What object holds the environment variables at runtime. This is usually
     * `process.env` or `import.meta.env`.
     */
    runtimeEnv,
  });
