import { asDrizzleTable } from "@astrojs/db/runtime";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { GitHub } from "arctic";
import { db } from "astro:db";
import { Lucia } from "lucia";

import { Session, User } from "~/lib/db";
import { env } from "~/lib/env";

import type { DBTable } from "@astrojs/db/types";
import type {
  SQLiteSessionTable,
  SQLiteUserTable,
} from "@lucia-auth/adapter-drizzle";

const adapter = new DrizzleSQLiteAdapter(
  db,
  asDrizzleTable(
    "Session",
    Session as DBTable,
  ) as unknown as SQLiteSessionTable,
  asDrizzleTable("User", User as DBTable) as unknown as SQLiteUserTable,
);

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
  env().GITHUB_CLIENT_ID,
  env().GITHUB_CLIENT_SECRET,
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
