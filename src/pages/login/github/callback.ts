import { OAuth2RequestError } from "arctic";
import { db, eq, User } from "astro:db";
import { generateId } from "lucia";

import { github, lucia } from "~/lib/auth";

import type { APIContext } from "astro";

export const prerender = false;

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
        "User-Agent": "cloudflare-worker",
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

      return context.redirect("/guestbook");
    }

    const userId = generateId(15);

    await db.insert(User).values({
      id: userId,
      githubId: githubUser.id,
      username: githubUser.login,
      name: githubUser.name ?? githubUser.login,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return context.redirect("/guestbook");
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
