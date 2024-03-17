import { db, eq, Guestbook, User } from "astro:db";
import { generateId } from "lucia";

import { GuestbookForm } from "~/lib/schemas";

import type { APIContext } from "astro";
import type { EntryDto, GuestbookResponseBody } from "~/lib/types";

export const prerender = false;

export async function POST(context: APIContext): Promise<Response> {
  let responseBody: GuestbookResponseBody;

  if (!context.locals.session) {
    responseBody = { success: false, message: "Unauthorized" };

    return new Response(JSON.stringify(responseBody), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await context.request.formData();

  const result = GuestbookForm.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    responseBody = {
      success: false,
      message: "Invalid form data",
      errors: result.error.errors,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let entryDto: EntryDto;
  try {
    const transaction = await db.transaction(async (tx) => {
      if (!context.locals.session) return;

      const entry = (
        await tx
          .insert(Guestbook)
          .values({
            id: generateId(15),
            authorId: context.locals.session.userId,
            message: result.data.message,
          })
          .returning()
      ).pop();

      const user = (
        await tx
          .select({ name: User.name })
          .from(User)
          .where(eq(User.id, context.locals.session.userId))
      ).pop();

      if (!user || !entry) return;

      return { name: user.name, message: entry.message };
    });

    if (!transaction) {
      throw new Error("Transaction failed");
    }

    entryDto = transaction;
  } catch (error) {
    console.error(error);
    responseBody = { success: false, message: "Internal server error" };

    return new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  responseBody = { success: true, message: "Entry created", entry: entryDto };

  return new Response(JSON.stringify(responseBody), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
