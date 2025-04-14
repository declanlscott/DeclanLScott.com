import type { APIContext } from "astro";

export const prerender = false;

// TODO: Reimplement this endpoint

export async function GET(context: APIContext): Promise<Response> {
  return new Response("Not Implemented", { status: 501 });
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
}
