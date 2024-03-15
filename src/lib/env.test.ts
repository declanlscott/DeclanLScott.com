import { expect, test } from "vitest";

import { env } from "~/lib/env";

test("Validate environment variables", () => {
  Object.keys(env).forEach((key) => {
    expect(env[key as keyof typeof env]).toBeDefined();
  });
});
