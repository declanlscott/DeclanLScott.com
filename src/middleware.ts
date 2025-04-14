import { defineMiddleware } from "astro:middleware";

// TODO: Reimplement middleware auth

export const onRequest = defineMiddleware(async (context, next) => {
  return next();
});
