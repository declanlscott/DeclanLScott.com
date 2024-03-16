import { lucia } from "~/lib/auth";

import type { APIContext } from "astro";

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  if (context.locals.session) {
    await lucia.invalidateSession(context.locals.session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    context.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }

  return new Response(null, { status: 204 });
}
