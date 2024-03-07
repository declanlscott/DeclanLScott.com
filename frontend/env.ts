import { email, string, url } from "valibot";

import { createEnv } from "./src/lib/vendor/env";

export const env = (runtimeEnv: Record<string, string> = import.meta.env) =>
  createEnv({
    /**
     * The prefix that client-side variables must have. This is enforced both at
     * a type-level and at runtime.
     */
    clientPrefix: "PUBLIC_",

    client: {
      PUBLIC_NAME: string(),
      PUBLIC_EMAIL: string([email()]),
      PUBLIC_LINKEDIN: string([url()]),
      PUBLIC_X_USERNAME: string(),
    },

    /**
     * What object holds the environment variables at runtime. This is usually
     * `process.env` or `import.meta.env`.
     */
    runtimeEnv,
  });
