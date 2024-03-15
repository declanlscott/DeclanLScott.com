import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { GitHub } from "arctic";
import { db, Session, User } from "astro:db";
import { Lucia } from "lucia";

import { env } from "~/lib/env";

// @ts-expect-error - Suppressing the type mismatch errors
const adapter = new DrizzleSQLiteAdapter(db, Session, User);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      githubId: attributes.githubId,
    };
  },
});

export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      githubId: number;
      username: string;
    };
  }
}
