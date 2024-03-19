import { GitHub } from "arctic";
import { db, Session, User } from "astro:db";
import { Lucia } from "lucia";
import { AstroDBAdapter } from "lucia-adapter-astrodb";

import { env } from "~/lib/env";

const adapter = new AstroDBAdapter(db, Session, User);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: { secure: import.meta.env.PROD },
  },
  getUserAttributes: (attributes) => ({
    username: attributes.username,
    githubId: attributes.githubId,
    name: attributes.name,
  }),
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
      name: string;
    };
  }
}
