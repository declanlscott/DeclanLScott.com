import type { APIContext } from "astro";

export const prerender = false;

// TODO: Reimplement this endpoint

export async function POST(context: APIContext): Promise<Response> {
  return new Response("Not Implemented", { status: 501 });
}
