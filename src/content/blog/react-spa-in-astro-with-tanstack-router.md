---
title: "React SPA in Astro with TanStack Router"
date: "2024-03-21T00:00-05:00"
tags: ["react", "spa", "astro", "tanstack", "router"]
image:
  {
    src: "./react-spa-in-astro-with-tanstack-router.png",
    caption: "Astro + React + TanStack Router",
  }
isPublished: true
---

[Astro](https://astro.build/) is usually billed as a web framework for content-driven and/or static websites, shipping zero bytes of JavaScript by default. On the other end of the spectrum, there are solutions like [Remix](https://remix.run/) and [Next.js](https://nextjs.org/) for highly dynamic and interactive server rendered web applications.

But Astro can do much more than just static sites. If you need to have any amount of client-side interactivity, the reality is that you're going to need some JavaScript. Astro offers a great middle ground for this with its [Islands](https://docs.astro.build/en/concepts/islands/) architecture. This feature allows you to render HTML pages on the server (or at build time) and sprinkle in "islands" of interactivity where needed, with or without the first render pass on the server.

Another approach is to embed a full blown client rendered Single Page Application (SPA) within a sub route tree of your Astro site for a dashboard, admin panel, or some other highly interactive feature. This is where [TanStack Router](https://tanstack.com/router/latest) comes in, probably my favorite new React library. [React Router](https://reactrouter.com/en/main) is another option, and it (and by extension, Remix) is great and I've used it before, but the type-safety and search parameters handling in TanStack Router is just... _\*chef's kiss\*_.

## Setup

### React

Getting started with TanStack Router in Astro is pretty straightforward. First, you'll need to add the react integration to your Astro project. I prefer `pnpm`, but use whatever package manager you like:

```zsh
pnpm astro add react
```

This will automatically install `@astrojs/react`, `react`, and `react-dom` as well as add the necessary configuration to your `astro.config.mjs` file. In this file, you'll want to ensure that the output is set to `hybrid`, enabling dynamic routes for the SPA:

```typescript
// astro.config.mjs
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  integrations: [react()],
  // ... other config
});
```

### TanStack Router

TanStack Router supports file-based routing as well code based routing. Code based routing is more flexible, but file-based routing is generally preferred due to convention and ease of use. To enable file-based route generation, there are two options: `@tanstack/router-vite-plugin` and `@tanstack/router-cli`. Anecdotally, I've found the vite plugin to be bit [less reliable](https://github.com/TanStack/router/issues/1312) at regenerating the config when creating or deleting files, so I'll use the CLI:

```zsh
pnpm add @tanstack/react-router @tanstack/router-cli
```

A trick I discovered recently is that you can use regular expressions with `pnpm run` to run multiple scripts at once, negating the need for a separate package like [`npm-run-all`](https://www.npmjs.com/package/npm-run-all2) or [`concurrently`](https://www.npmjs.com/package/concurrently). That way, you can run the Astro dev server and the TanStack Router CLI in a single command:

```json
// package.json
{
  // ...
  "scripts": {
    "dev": "pnpm run /^dev:/",
    "dev:tsr": "tsr watch",
    "dev:astro": "astro dev",
    "build": "tsr generate && astro check && astro build"
  }
  // ...
}
```

Next, create a `tsr.config.json` file in the root of your project so that TanStack Router knows where to look for your routes. I'll be putting everything SPA related in the `src/dashboard` directory:

```json
// tsr.config.json
{
  "routesDirectory": "./src/dashboard/routes",
  "generatedRouteTree": "./src/dashboard/routeTree.gen.ts",
  "routeFileIgnorePrefix": "-",
  "quoteStyle": "single"
}
```

Follow the TanStack Router [Quick Start](https://tanstack.com/router/latest/docs/framework/react/quick-start) and [file-based routing guide](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing) on how to create your routes. One thing not to forget is to set the `basepath` in the `createRouter` call. Base path `/dashboard` corresponds to `src/pages/dashboard` in the Astro project.

```typescript
const router = createRouter({
  routeTree,
  basepath: "/dashboard",
});
```

### Astro

Rendering a SPA in Astro is the same as rendering any other React component, except that it needs to handle all the requests in the `/dashboard` route tree. Create a "catch-all" route `src/pages/dashboard/[...app].astro`, but you can name the file whatever you like:

```astro
---
// src/pages/dashboard/[...app].astro
import { App } from "~/dashboard/app";

export const prerender = false;
---

<App client:only="react" />
```

Two things to note here. First, the `prerender` export is set to `false` to prevent Astro from trying to generate static pages at build time. Second, the `client:only` directive needs to be set to `react` so Astro knows what framework to use for client-side rendering.

## Conclusion

That should be it! You can now build out the react app just like you would for any app built with TanStack Router. If you want to see a working project, check out the example [source code](https://github.com/declanlscott/astro-island-spa), [deployed](https://astro-island-spa.pages.dev/) to Cloudflare Pages.
