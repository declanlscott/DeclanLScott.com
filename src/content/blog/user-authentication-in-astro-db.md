---
title: "User Authentication in Astro DB"
date: "2024-03-18T00:00-05:00"
tags: ["astro", "database", "lucia", "authentication"]
image:
  {
    src: "./user-authentication-in-astro-db.png",
    caption: "Astro DB + Lucia Auth",
  }
isPublished: true
---

Last week, [Astro](https://astro.build/) [released](https://astro.build/blog/astro-db/) a new database platform called [Astro DB](https://astro.build/db/). It's a fully managed SQL database designed exclusively for Astro websites, powered by [Turso](https://turso.tech/). Turso maintains [libSQL](https://turso.tech/libsql), a fork of SQLite optimized for modern distributed internet workloads. Astro also includes [Drizzle ORM](https://orm.drizzle.team/) for type-safe queries to the database. Read their [blog post](https://astro.build/blog/astro-db-deep-dive/) for a full deep dive.

Naturally, the first thing you'll want to do with your database is give your users authenticated access. Luckily, [Lucia Auth](https://lucia-auth.com/) gives us everything we need to do this. The rest of this blog post is a comprehensive guide to get started with user authentication in Astro DB.

## Setup

If you haven't already setup your project with Astro DB, be sure to follow their [docs](https://docs.astro.build/en/guides/astro-db/) or run the following command to install the `@astrojs/db` integration. This guide uses `pnpm` for package management.

```zsh
pnpm astro add db
```

### Create an OAuth App

This example uses GitHub for authentication, but the process should be similar for other OAuth providers. [Create a OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) in your GitHub account settings and set the redirect URI to `http://localhost:4321/login/github/callback` for local development. For production, use your website's domain. Copy the client ID and secret and paste them into your `.env` file.

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### Define your database

Astro DB configuration lives in the `db` directory. Running the above command should create `db/config.ts` and `db/seed.ts` files. Define your `User` and `Session` tables in `db/config.ts` using the `defineTable` and `column` functions from `astro:db`.

The `User` table requires`id` and `githubId` columns while the `Session` table requires `id`, `expiresAt`, and a `userId` column that references `id` in the `User` table. Feel free to add additional columns to the `User` table as needed. Here's an example configuration:

```typescript
// db/config.ts
import { column, defineDb, defineTable } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    githubId: column.number({ unique: true }),
    username: column.text(),
    name: column.text(),
  },
});

const Session = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => User.columns.id }),
    expiresAt: column.date(),
  },
});

// https://astro.build/db/config
export default defineDb({ tables: { User, Session } });
```

### Lucia

Next, install `lucia`, `lucia-adapter-astrodb`, and `arctic` to your project.

```zsh
pnpm add lucia lucia-adapter-astrodb
```

Somewhere in your project, create a file for your authentication code, for example `src/lib/auth.ts`.

Lucia can be used with many adapters for different databases. In this case, use the `AstroDBAdapter` from `lucia-adapter-astrodb` to connect Lucia to your Astro DB.

(As another option, you can use the`DrizzleSQLiteAdapter` from the official `@lucia-auth/adapter-drizzle` package with the `asDrizzleTable` function from `@astrojs/db/utils`.)

Create a `DatabaseUserAttributes` interface with your database columns and pass it to the module declaration. This will allow you to use the `DatabaseUserAttributes` type in Lucia's `getUserAttributes` function. The returned object from this function is added to the `User` object.

```typescript
// src/lib/auth.ts
import { db, Session, User } from "astro:db";
import { Lucia } from "lucia";
import { AstroDBAdapter } from "lucia-adapter-astrodb";

interface DatabaseUserAttributes {
  githubId: number;
  username: string;
  name: string;
}

const { PROD, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = import.meta.env;

const adapter = new AstroDBAdapter(db, Session, User);

export const lucia = new Lucia(adapter, {
  sessionCookie: { attributes: { secure: PROD } },
  getUserAttributes: (attributes) => ({
    // attributes has the type of `DatabaseUserAttributes`
    username: attributes.username,
    githubId: attributes.githubId,
    name: attributes.name,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
```

### Arctic

Lucia recommends using [Arctic](https://arctic.js.org/) (made by the same developer) for implementing OAuth, as it very simple to use and supports many providers.

```zsh
pnpm add arctic
```

In the same file with lucia, import `GitHub` from `arctic` and export a new instance with your client ID and secret.

```typescript
// src/lib/auth.ts
import { GitHub } from "arctic";

// ... rest of the file

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
```

### SSR

For authentication to work properly, Astro's build output must be set to `server` or `hybrid` in your `astro.config.ts` file. If you want your website to be mostly static, use `hybrid` and don't forget to add `export const prerender = false;` to the upcoming middleware and API endpoints code snippets.

```typescript
// astro.config.ts

// https://astro.build/config
export default defineConfig({
  output: "server", // or "hybrid"
  // ... rest of config
});
```

### Middleware

Middleware is used to validate requests and makes the `Session` and `User` objects available to `Astro.locals` for use in your components. Below is an example that reads and validates the session cookie, and implements [CSRF protection](https://lucia-auth.com/guides/validate-session-cookies/astro).

```typescript
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { verifyRequestOrigin } from "lucia";

import { lucia } from "~/lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.request.method !== "GET") {
    const originHeader = context.request.headers.get("Origin");
    const hostHeader = context.request.headers.get("Host");

    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return new Response(null, { status: 403 });
    }
  }

  const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    context.locals.user = null;
    context.locals.session = null;

    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);

    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();

    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  context.locals.session = session;
  context.locals.user = user;

  return next();
});
```

Also, don't forget to add the types to `App.Locals`

```typescript
// src/env.d.ts

/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    session: import("lucia").Session | null;
    user: import("lucia").User | null;
  }
}
```

### API Endpoints

#### Login

Create a new API endpoint for logging in with GitHub. This endpoint will redirect the user to GitHub's authorization URL.

```typescript
// src/pages/login/github/index.ts
import { generateState } from "arctic";

import { github } from "~/lib/auth";

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const state = generateState();
  const url = await github.createAuthorizationURL(state);

  context.cookies.set("github_oauth_state", state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return context.redirect(url.toString());
}
```

#### Callback

Create a new API endpoint for handling the callback from GitHub. This endpoint will validate the authorization code, create a user if one doesn't already exist, create a session, and redirect the user to the home page.

```typescript
import { OAuth2RequestError } from "arctic";
import { db, eq, User } from "astro:db";
import { generateId } from "lucia";

import { github, lucia } from "~/lib/auth";

import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const code = context.url.searchParams.get("code");
  const state = context.url.searchParams.get("state");
  const storedState = context.cookies.get("github_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, { status: 400 });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    const githubUser: GitHubUser = await githubUserResponse.json();

    const existingUser = (
      await db.select().from(User).where(eq(User.githubId, githubUser.id))
    ).pop();

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return context.redirect("/");
    }

    const userId = generateId(15);

    await db.insert(User).values({
      id: userId,
      githubId: githubUser.id,
      username: githubUser.login,
      // Fallback to the GitHub username if the name is null
      name: githubUser.name ?? githubUser.login,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return context.redirect("/");
  } catch (error) {
    console.error(error);

    // the specific error message depends on the provider
    if (error instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, { status: 400 });
    }

    return new Response(null, { status: 500 });
  }
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
}
```

Note: If deploying your website to Cloudflare, you'll needed to add the `User-Agent` header to the fetch request to the GitHub API as Cloudflare leaves it out by default.

#### Logout

Log out the user by `POST`ing to the `/api/logout` endpoint. This will invalidate the session, remove the session cookie, and redirect the user to the login page.

```typescript
import { lucia } from "~/lib/auth";

import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
  if (!context.locals.session) {
    return new Response(null, { status: 401 });
  }

  await lucia.invalidateSession(context.locals.session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  context.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return Astro.redirect("/login");
}
```

## Implementing in Pages/Components

Now that the middleware, API endpoints, and authentication logic are all in place, all that's left is to implement the login and logout functionality in your pages and components.

```astro
---
// src/pages/login/index.astro
---

<html lang="en">
  <body>
    <a href="/login/github">Sign in with GitHub</a>
  </body>
</html>
```

```astro
<form method="post" action="/api/logout">
  <button>Sign out</button>
</form>
```

### Protecting Routes

You can protect routes by validating `Astro.locals` `session` and/or `user` in your components. For example, in the frontmatter of a page:

```astro
---
const user = Astro.locals.user;
if (!user) {
  return Astro.redirect("/login");
}

const username = user.username;
---
```

## Next Steps

This guide covers the basics of user authentication in Astro DB with Lucia Auth in a _local_ development environment and database. For production, I recommend Astro's hosted solution: [Astro Studio](https://studio.astro.build). It has an extremely generous [free tier](https://astro.build/db/#pricing) and is designed to work seamlessly with Astro DB. Check our their [recipe](https://docs.astro.build/en/recipes/studio/) for more information on how to do this.

## Conclusion

And that's it! If you want to see all of this in action, check out the [guestbook](/guestbook) page on this website, or the example [source code](https://github.com/declanlscott/astrodb-lucia-oauth). This is my first blog post, so I hope you found it helpful! Credit to [this tweet](https://twitter.com/astrodotbuild/status/1767687840354447705) for the inspiration. If you liked this, I might have more Astro content coming soon...
